'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  requiredRole?: 'student' | 'admin'
  redirectTo?: string
}

export function ProtectedRoute({ 
  children, 
  requireAuth = true,
  requiredRole,
  redirectTo = '/auth/login'
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log('🔒 ProtectedRoute 체크:', { loading, user: !!user, userEmail: user?.email, requiredRole })
    
    if (loading) {
      console.log('⏳ 인증 로딩 중...')
      return // 로딩 중이면 대기
    }

    // 잠시 대기 후 다시 체크 (Auth 상태 동기화 시간 확보)
    const delayedCheck = setTimeout(() => {
      console.log('🔒 지연 체크:', { loading, user: !!user, userEmail: user?.email })
      
      // 인증이 필요한데 사용자가 없는 경우
      if (requireAuth && !user) {
        console.log('❌ 인증 필요하지만 사용자 없음 → 로그인 페이지로 리다이렉트')
        router.push(redirectTo)
        return
      }

      // 특정 역할이 필요한데 역할이 맞지 않는 경우
      if (requiredRole && user?.profile?.role !== requiredRole) {
        // 관리자 페이지인데 학생인 경우 학생 대시보드로
        if (requiredRole === 'admin' && user?.profile?.role === 'student') {
          router.push('/dashboard')
        } 
        // 학생 페이지인데 관리자인 경우 관리자 대시보드로
        else if (requiredRole === 'student' && user?.profile?.role === 'admin') {
          router.push('/admin')
        }
        // 그 외의 경우 로그인으로
        else {
          router.push('/auth/login')
        }
        return
      }
    }, 100) // 100ms 지연

    return () => clearTimeout(delayedCheck)
  }, [user, loading, requireAuth, requiredRole, redirectTo, router])

  // 로딩 중 표시
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">로그인 상태를 확인하고 있습니다...</p>
        </div>
      </div>
    )
  }

  // 인증이 필요하지만 사용자가 없는 경우
  if (requireAuth && !user) {
    return null // useEffect에서 리다이렉트 처리
  }

  // 역할이 필요하지만 맞지 않는 경우
  if (requiredRole && user?.profile?.role !== requiredRole) {
    return null // useEffect에서 리다이렉트 처리
  }

  return <>{children}</>
}

// 인증된 사용자만 접근 가능
export function AuthenticatedRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAuth={true}>
      {children}
    </ProtectedRoute>
  )
}

// 학생만 접근 가능
export function StudentRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAuth={true} requiredRole="student">
      {children}
    </ProtectedRoute>
  )
}

// 관리자만 접근 가능
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAuth={true} requiredRole="admin">
      {children}
    </ProtectedRoute>
  )
}

// 게스트만 접근 가능 (로그인하지 않은 사용자)
export function GuestRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAuth={false} redirectTo="/dashboard">
      {children}
    </ProtectedRoute>
  )
}