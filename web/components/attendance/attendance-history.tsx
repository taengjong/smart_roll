'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Clock, RefreshCw, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AttendanceRecord {
  classId: string
  courseName: string
  courseDescription: string
  scheduledDate: string
  scheduledTime: string
  status: 'scheduled' | 'attended' | 'missed' | 'cancelled'
  attendedAt?: string
  notes?: string
}

interface AttendanceStats {
  totalClasses: number
  attendedClasses: number
  missedClasses: number
  attendanceRate: number
  courseStats: Record<string, {
    total: number
    attended: number
    missed: number
  }>
}

interface AttendanceHistoryProps {
  userId: string
  limit?: number
}

export function AttendanceHistory({ userId, limit = 10 }: AttendanceHistoryProps) {
  const [history, setHistory] = useState<AttendanceRecord[]>([])
  const [stats, setStats] = useState<AttendanceStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)
  const [hasMore, setHasMore] = useState(false)

  const fetchAttendanceHistory = async () => {
    try {
      setError(null)
      const response = await fetch(`/api/attendance/history/${userId}?limit=${limit}&offset=0`)
      const result = await response.json()

      if (result.success) {
        setHistory(result.data.history)
        setStats(result.data.stats)
        setHasMore(result.data.pagination.hasMore)
      } else {
        setError(result.error || 'Failed to fetch attendance history')
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Failed to fetch attendance history:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchAttendanceHistory()
    }
  }, [userId, limit])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'attended':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'missed':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'attended':
        return '출석'
      case 'missed':
        return '결석'
      case 'cancelled':
        return '취소'
      default:
        return '예정'
    }
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'attended':
        return 'text-green-600 bg-green-50'
      case 'missed':
        return 'text-red-600 bg-red-50'
      case 'cancelled':
        return 'text-gray-600 bg-gray-50'
      default:
        return 'text-yellow-600 bg-yellow-50'
    }
  }

  const displayedHistory = showAll ? history : history.slice(0, 5)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>출석 기록</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>출석 기록을 불러오는 중...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>출석 기록</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchAttendanceHistory} variant="outline" size="sm">
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
        <CardTitle>출석 기록</CardTitle>
        {stats && (
          <CardDescription>
            전체 {stats.totalClasses}회 중 {stats.attendedClasses}회 출석 (출석률: {stats.attendanceRate}%)
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 출석 통계 */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.attendedClasses}</div>
              <div className="text-sm text-muted-foreground">출석</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.missedClasses}</div>
              <div className="text-sm text-muted-foreground">결석</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.attendanceRate}%</div>
              <div className="text-sm text-muted-foreground">출석률</div>
            </div>
          </div>
        )}

        {/* 출석 기록 목록 */}
        <div className="space-y-3">
          {displayedHistory.length > 0 ? (
            displayedHistory.map((record) => (
              <div 
                key={record.classId} 
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium">{record.courseName}</h4>
                    <span className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      getStatusClass(record.status)
                    )}>
                      {getStatusText(record.status)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>
                      {new Date(record.scheduledDate).toLocaleDateString('ko-KR', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    <span>{record.scheduledTime}</span>
                    {record.attendedAt && (
                      <span className="text-green-600">
                        출석: {new Date(record.attendedAt).toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    )}
                  </div>
                  
                  {record.notes && (
                    <p className="text-sm text-muted-foreground mt-1 italic">
                      {record.notes}
                    </p>
                  )}
                </div>
                
                <div className="ml-4">
                  {getStatusIcon(record.status)}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>아직 출석 기록이 없습니다.</p>
            </div>
          )}
        </div>

        {/* 더보기/접기 버튼 */}
        {history.length > 5 && (
          <div className="flex justify-center pt-4">
            <Button
              onClick={() => setShowAll(!showAll)}
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
            >
              {showAll ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  접기
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  더보기 ({history.length - 5}개 더)
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}