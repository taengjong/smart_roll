'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { TodayClasses } from '@/components/attendance/today-classes'
import { AttendanceHistory } from '@/components/attendance/attendance-history'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { StudentRoute } from '@/components/auth/protected-route'

export default function AttendancePage() {
  return (
    <StudentRoute>
      <AttendanceContent />
    </StudentRoute>
  )
}

function AttendanceContent() {
  const { user } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)

  const handleAttendanceUpdate = () => {
    // 출석 업데이트 시 전체 데이터 새로고침
    setRefreshKey(prev => prev + 1)
  }

  if (!user) return null

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 페이지 제목 */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">출석 체크</h1>
          <p className="text-muted-foreground">
            {user.profile?.name || user.email}님의 출석 현황을 관리합니다.
          </p>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="grid gap-6 md:grid-cols-2">
          <div key={`today-${user.id}-${refreshKey}`}>
            <TodayClasses 
              userId={user.id} 
              onAttendanceUpdate={handleAttendanceUpdate}
            />
          </div>
          
          <div key={`history-${user.id}-${refreshKey}`}>
            <AttendanceHistory userId={user.id} />
          </div>
        </div>

        {/* 출석 안내 */}
        <Card>
          <CardHeader>
            <CardTitle>📋 출석 체크 안내</CardTitle>
            <CardDescription>
              출석 체크 기능 사용 방법
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-semibold mb-2">✅ 출석 체크 방법</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>오늘의 수업에서 해당 수업 확인</li>
                  <li>"출석 체크" 버튼 클릭</li>
                  <li>출석 완료 확인</li>
                  <li>출석 이력에서 기록 확인</li>
                </ol>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">📊 이용 가능한 기능</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>오늘 예정된 수업 목록 확인</li>
                  <li>원클릭 출석 체크</li>
                  <li>출석 이력 및 통계 확인</li>
                  <li>수강권별 남은 수업 수 확인</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}