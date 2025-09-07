'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, type AuthUser } from '@/lib/auth'

interface AuthContextType {
  user: AuthUser | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string, phone?: string) => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const refreshUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (currentUser) {
        console.log('👤 사용자 로그인:', currentUser.email, currentUser.profile?.role)
        setUser(currentUser)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('❌ refreshUser 에러:', error)
      // getCurrentUser에서 이미 RLS 오류 처리를 하므로 여기서는 null만 설정
      setUser(null)
      throw error // 호출자가 에러 상황을 알 수 있도록 re-throw
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // 로그인 성공 후 사용자 정보 새로고침
      try {
        await refreshUser()
      } catch (refreshError) {
        console.warn('⚠️ 사용자 정보 새로고침 실패했지만 로그인은 계속 진행:', refreshError)
      }
      
      // 대시보드로 리다이렉트
      router.push('/dashboard')
    } catch (error) {
      console.error('❌ 로그인 에러:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, name: string, phone?: string) => {
    setLoading(true)
    try {
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

      if (error) throw error

      // 회원가입 성공 메시지 또는 이메일 확인 안내
      if (data.user && !data.session) {
        // 이메일 확인 필요
        router.push('/auth/verify-email')
      } else if (data.session) {
        // 바로 로그인됨
        await refreshUser()
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      setUser(null)
      setSession(null)
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true

    // 초기 세션은 onAuthStateChange의 INITIAL_SESSION에서 처리됨
    console.log('🚀 AuthProvider 초기화 시작 - Auth 리스너 설정 중')

    // 인증 상태 변화 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 Auth 상태 변화:', event, session?.user?.email)
        
        if (!mounted) return
        
        setSession(session)
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
          if (session?.user) {
            console.log('🔄 Auth 리스너에서 사용자 정보 로딩:', event)
            try {
              await refreshUser()
              console.log('✅ Auth 리스너 사용자 정보 로딩 완료')
            } catch (refreshError) {
              console.warn('⚠️ Auth 리스너 사용자 정보 로딩 실패, 기본값 설정:', refreshError)
              // 세션은 유효하므로 기본값으로 사용자 설정
              const role = session.user.email === 'admin@test.com' ? 'admin' : 'student'
              const userData = {
                ...session.user,
                profile: {
                  name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
                  role: role,
                  phone: undefined
                }
              }
              console.log('🔧 Auth 리스너 기본값 설정:', userData.email, userData.profile.role)
              setUser(userData)
            }
          } else {
            console.log('⚠️ Auth 리스너: 세션 없음')
            setUser(null)
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('🚪 로그아웃 감지')
          setUser(null)
        }
        
        setLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}