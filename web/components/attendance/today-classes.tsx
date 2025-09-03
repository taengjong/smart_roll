'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AttendanceButton } from './attendance-button'
import { Calendar, RefreshCw, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TodayClass {
  classId: string
  courseId: string
  courseName: string
  courseDescription: string
  scheduledDate: string
  scheduledTime: string
  status: 'scheduled' | 'attended' | 'missed' | 'cancelled'
  attendedAt?: string
  subscription: {
    id: string
    remainingClasses: number
    totalClasses: number
  }
}

interface TodayClassesProps {
  userId: string
  onAttendanceUpdate?: () => void
}

export function TodayClasses({ userId, onAttendanceUpdate }: TodayClassesProps) {
  const [classes, setClasses] = useState<TodayClass[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchTodayClasses = async () => {
    try {
      setError(null)
      const response = await fetch(`/api/attendance/today/${userId}`)
      const result = await response.json()

      if (result.success) {
        setClasses(result.data.todayClasses)
        setLastUpdated(new Date())
      } else {
        setError(result.error || 'Failed to fetch today classes')
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Failed to fetch today classes:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchTodayClasses()
    }
  }, [userId])

  const handleAttendanceMarked = (classId: string, newStatus: string) => {
    // 로컬 상태 업데이트
    setClasses(prev => 
      prev.map(cls => 
        cls.classId === classId 
          ? { ...cls, status: newStatus as any, attendedAt: new Date().toISOString() }
          : cls
      )
    )
    
    // 부모 컴포넌트에 알림
    onAttendanceUpdate?.()
  }

  const handleRefresh = () => {
    setIsLoading(true)
    fetchTodayClasses()
  }

  if (isLoading && !lastUpdated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            오늘의 수업
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>수업 정보를 불러오는 중...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            오늘의 수업
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            다시 시도
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              오늘의 수업
            </CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString('ko-KR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
              })}
            </CardDescription>
          </div>
          <Button 
            onClick={handleRefresh} 
            variant="ghost" 
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {classes.length > 0 ? (
          classes.map((classItem) => (
            <div 
              key={classItem.classId} 
              className="flex items-center justify-between p-4 border rounded-lg bg-card"
            >
              <div className="flex-1">
                <h3 className="font-medium text-lg">{classItem.courseName}</h3>
                {classItem.courseDescription && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {classItem.courseDescription}
                  </p>
                )}
                <div className="text-sm text-muted-foreground">
                  남은 수업: {classItem.subscription.remainingClasses}/{classItem.subscription.totalClasses}회
                </div>
                {classItem.attendedAt && (
                  <div className="text-xs text-green-600 mt-1">
                    출석 완료: {new Date(classItem.attendedAt).toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                )}
              </div>
              
              <div className="ml-4">
                <AttendanceButton
                  classId={classItem.classId}
                  userId={userId}
                  status={classItem.status}
                  courseName={classItem.courseName}
                  scheduledTime={classItem.scheduledTime}
                  onAttendanceMarked={handleAttendanceMarked}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>오늘 예정된 수업이 없습니다.</p>
            <p className="text-sm mt-1">편안한 하루 보내세요! 😊</p>
          </div>
        )}
        
        {lastUpdated && (
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            마지막 업데이트: {lastUpdated.toLocaleTimeString('ko-KR')}
          </div>
        )}
      </CardContent>
    </Card>
  )
}