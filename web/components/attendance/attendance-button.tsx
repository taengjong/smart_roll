'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckSquare, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AttendanceButtonProps {
  classId: string
  userId: string
  status: 'scheduled' | 'attended' | 'missed' | 'cancelled'
  courseName: string
  scheduledTime: string
  onAttendanceMarked?: (classId: string, newStatus: string) => void
  disabled?: boolean
}

export function AttendanceButton({
  classId,
  userId,
  status,
  courseName,
  scheduledTime,
  onAttendanceMarked,
  disabled = false
}: AttendanceButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [currentStatus, setCurrentStatus] = useState(status)

  const handleAttendanceCheck = async () => {
    if (isLoading || currentStatus === 'attended') return

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/attendance/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId,
          userId
        })
      })

      const result = await response.json()

      if (result.success) {
        setCurrentStatus('attended')
        onAttendanceMarked?.(classId, 'attended')
        
        // 성공 알림 (간단한 알림)
        if (typeof window !== 'undefined') {
          // TODO: 더 나은 토스트 알림으로 교체
          alert(`${courseName} 수업 출석이 완료되었습니다!`)
        }
      } else {
        // 에러 알림
        if (typeof window !== 'undefined') {
          alert(`출석 체크 실패: ${result.error}`)
        }
      }
    } catch (error) {
      console.error('Attendance check failed:', error)
      if (typeof window !== 'undefined') {
        alert('출석 체크 중 오류가 발생했습니다.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusConfig = () => {
    switch (currentStatus) {
      case 'attended':
        return {
          icon: CheckCircle,
          text: '출석 완료',
          variant: 'default' as const,
          className: 'bg-green-600 hover:bg-green-700 text-white',
          clickable: false
        }
      case 'missed':
        return {
          icon: XCircle,
          text: '결석',
          variant: 'destructive' as const,
          className: '',
          clickable: false
        }
      case 'cancelled':
        return {
          icon: XCircle,
          text: '취소됨',
          variant: 'secondary' as const,
          className: '',
          clickable: false
        }
      default: // scheduled
        return {
          icon: CheckSquare,
          text: '출석 체크',
          variant: 'default' as const,
          className: 'bg-blue-600 hover:bg-blue-700 text-white',
          clickable: true
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>{scheduledTime}</span>
      </div>
      
      <Button
        onClick={config.clickable ? handleAttendanceCheck : undefined}
        disabled={disabled || isLoading || !config.clickable}
        variant={config.variant}
        className={cn(
          'w-full flex items-center space-x-2',
          config.className
        )}
        size="sm"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Icon className="h-4 w-4" />
        )}
        <span>{isLoading ? '처리 중...' : config.text}</span>
      </Button>

      {currentStatus === 'attended' && (
        <div className="text-xs text-green-600 text-center">
          ✅ 출석이 기록되었습니다
        </div>
      )}
    </div>
  )
}