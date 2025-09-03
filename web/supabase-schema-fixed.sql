-- SmartRoll Database Schema for Supabase (Fixed RLS Policies)
-- This file contains the complete database schema with corrected RLS policies

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create courses table (course types/packages)
CREATE TABLE courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL, -- '취미 보컬', '입시 기타' etc.
    duration_weeks INTEGER DEFAULT 4,
    price DECIMAL(10,2),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subscriptions table (purchased course packages)
CREATE TABLE subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    purchase_date DATE DEFAULT CURRENT_DATE,
    expiry_date DATE,
    remaining_classes INTEGER DEFAULT 0,
    total_classes INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create classes table (individual class sessions)
CREATE TABLE classes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'attended', 'missed', 'cancelled', 'makeup_requested')),
    attended_at TIMESTAMPTZ,
    attended_by UUID REFERENCES profiles(id), -- admin who marked attendance
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create payments table (payment records)
CREATE TABLE payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT DEFAULT 'offline',
    transaction_id TEXT,
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    paid_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_classes_subscription_id ON classes(subscription_id);
CREATE INDEX idx_classes_scheduled_date ON classes(scheduled_date);
CREATE INDEX idx_classes_status ON classes(status);
CREATE INDEX idx_payments_user_id ON payments(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- FIXED RLS Policies for profiles (avoiding recursion)
CREATE POLICY "Users can view own profile" ON profiles 
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles 
FOR UPDATE USING (auth.uid() = id);

-- For admin policies, we'll use a simpler approach without self-referencing
CREATE POLICY "Service role can manage all profiles" ON profiles 
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policies for courses
CREATE POLICY "Everyone can view active courses" ON courses 
FOR SELECT USING (is_active = true);

CREATE POLICY "Service role can manage courses" ON courses 
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policies for subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions" ON subscriptions 
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policies for classes
CREATE POLICY "Users can view own classes" ON classes 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM subscriptions 
        WHERE subscriptions.id = classes.subscription_id 
        AND subscriptions.user_id = auth.uid()
    )
);

CREATE POLICY "Service role can manage classes" ON classes 
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policies for payments
CREATE POLICY "Users can view own payments" ON payments 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage payments" ON payments 
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Functions and Triggers

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger to create profile on auth.users insert
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
DROP TRIGGER IF EXISTS update_classes_updated_at ON classes;

-- Triggers to update updated_at timestamp
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classes_updated_at
    BEFORE UPDATE ON classes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically update remaining classes on attendance
CREATE OR REPLACE FUNCTION update_remaining_classes()
RETURNS TRIGGER AS $$
BEGIN
    -- If class status changed to 'attended', decrease remaining classes
    IF NEW.status = 'attended' AND OLD.status != 'attended' THEN
        UPDATE subscriptions 
        SET remaining_classes = remaining_classes - 1
        WHERE id = NEW.subscription_id;
    END IF;
    
    -- If class status changed from 'attended' to something else, increase remaining classes
    IF OLD.status = 'attended' AND NEW.status != 'attended' THEN
        UPDATE subscriptions 
        SET remaining_classes = remaining_classes + 1
        WHERE id = NEW.subscription_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_class_status_change ON classes;

-- Trigger to update remaining classes on class status change
CREATE TRIGGER on_class_status_change
    AFTER UPDATE ON classes
    FOR EACH ROW EXECUTE FUNCTION update_remaining_classes();

-- Sample data (optional - for testing)
INSERT INTO courses (name, duration_weeks, price, description) VALUES
('취미 보컬', 4, 200000, '취미로 배우는 보컬 레슨'),
('입시 기타', 8, 400000, '입시를 위한 기타 레슨'),
('피아노 초급', 6, 300000, '피아노 초급 과정'),
('드럼 레슨', 4, 250000, '드럼 기초 레슨')
ON CONFLICT DO NOTHING;

-- Note: Admin user creation will be handled through the application
-- After first user signs up, update their role manually:
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-admin-email@example.com';