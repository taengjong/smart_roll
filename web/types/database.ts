export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          phone: string | null
          role: 'student' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          phone?: string | null
          role?: 'student' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          phone?: string | null
          role?: 'student' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          name: string
          duration_weeks: number | null
          price: number | null
          description: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          duration_weeks?: number | null
          price?: number | null
          description?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          duration_weeks?: number | null
          price?: number | null
          description?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          course_id: string
          purchase_date: string
          expiry_date: string | null
          remaining_classes: number
          total_classes: number
          status: 'active' | 'expired' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          purchase_date?: string
          expiry_date?: string | null
          remaining_classes?: number
          total_classes?: number
          status?: 'active' | 'expired' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          purchase_date?: string
          expiry_date?: string | null
          remaining_classes?: number
          total_classes?: number
          status?: 'active' | 'expired' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
      classes: {
        Row: {
          id: string
          subscription_id: string
          scheduled_date: string
          scheduled_time: string
          status: 'scheduled' | 'attended' | 'missed' | 'cancelled' | 'makeup_requested'
          attended_at: string | null
          attended_by: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          subscription_id: string
          scheduled_date: string
          scheduled_time: string
          status?: 'scheduled' | 'attended' | 'missed' | 'cancelled' | 'makeup_requested'
          attended_at?: string | null
          attended_by?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          subscription_id?: string
          scheduled_date?: string
          scheduled_time?: string
          status?: 'scheduled' | 'attended' | 'missed' | 'cancelled' | 'makeup_requested'
          attended_at?: string | null
          attended_by?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          subscription_id: string | null
          amount: number
          payment_method: string
          transaction_id: string | null
          status: 'pending' | 'completed' | 'failed' | 'refunded'
          paid_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subscription_id?: string | null
          amount: number
          payment_method?: string
          transaction_id?: string | null
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          paid_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subscription_id?: string | null
          amount?: number
          payment_method?: string
          transaction_id?: string | null
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          paid_at?: string
          created_at?: string
        }
      }
    }
  }
}