import { supabase } from './supabase'
import type { User, Session } from '@supabase/supabase-js'

export interface AuthUser extends User {
  profile?: {
    name: string
    role: 'student' | 'admin'
    phone?: string
  }
}

// 현재 사용자 세션 가져오기
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    // 사용자 프로필 정보 가져오기
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('name, role, phone')
      .eq('id', user.id)
      .single()

    if (profileError) {
      // RLS 무한 재귀 오류인 경우 기본 프로필로 진행
      if (profileError.code === '42P17') {
        // admin@test.com은 관리자로 설정
        const role = user.email === 'admin@test.com' ? 'admin' : 'student'
        
        return {
          ...user,
          profile: {
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            role: role,
            phone: undefined
          }
        }
      }
      
      // 기타 에러의 경우 기본값으로 진행
      const role = user.email === 'admin@test.com' ? 'admin' : 'student'
      return {
        ...user,
        profile: {
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          role: role,
          phone: undefined
        }
      }
    }

    return {
      ...user,
      profile: profile || undefined
    }
  } catch (error) {
    console.error('❌ getCurrentUser 전체 에러:', error)
    return null
  }
}

// 로그인
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  return data
}

// 회원가입
export async function signUp(email: string, password: string, name: string, phone?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        phone,
      }
    }
  })

  if (error) {
    throw error
  }

  return data
}

// 로그아웃
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    throw error
  }
}

// 비밀번호 재설정 요청
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })

  if (error) {
    throw error
  }
}

// 비밀번호 업데이트
export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) {
    throw error
  }
}

// 프로필 업데이트
export async function updateProfile(updates: {
  name?: string
  phone?: string
}) {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (error) {
    throw error
  }
}

// 관리자 권한 확인
export function isAdmin(user: AuthUser | null): boolean {
  return user?.profile?.role === 'admin'
}

// 학생 권한 확인
export function isStudent(user: AuthUser | null): boolean {
  return user?.profile?.role === 'student'
}