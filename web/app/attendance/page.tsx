'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { TodayClasses } from '@/components/attendance/today-classes'
import { AttendanceHistory } from '@/components/attendance/attendance-history'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// 테스트용 사용자 목록 (나중에 실제 인증으로 교체)
const TEST_USERS = [
  { id: '550e8400-e29b-41d4-a716-446655440000', name: '김학생', role: 'student' as const },
  { id: '550e8400-e29b-41d4-a716-446655440002', name: '이학생', role: 'student' as const },
  { id: '550e8400-e29b-41d4-a716-446655440003', name: '박학생', role: 'student' as const },
]

export default function AttendancePage() {
  const [selectedUserId, setSelectedUserId] = useState(TEST_USERS[0].id)
  const [refreshKey, setRefreshKey] = useState(0)

  const selectedUser = TEST_USERS.find(user => user.id === selectedUserId) || TEST_USERS[0]

  const handleAttendanceUpdate = () => {
    // 출석 업데이트 시 전체 데이터 새로고침
    setRefreshKey(prev => prev + 1)
  }

  return (
    <DashboardLayout user={selectedUser}>
      <div className="space-y-6">
        {/* 테스트 헤더 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h2 className="font-semibold text-yellow-800 mb-2">🧪 출석 체크 기능 테스트</h2>
          <p className="text-yellow-700 text-sm mb-3">
            실제 서비스에서는 로그인한 사용자가 자동으로 설정됩니다. 
            테스트를 위해 사용자를 선택해주세요.
          </p>
          
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-yellow-800">
              테스트 사용자:
            </label>
            <select 
              value={selectedUserId} 
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="px-3 py-1 border rounded-md bg-white text-sm"
            >
              {TEST_USERS.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
            
            <Button 
              onClick={() => setRefreshKey(prev => prev + 1)}
              variant="outline"
              size="sm"
            >
              새로고침
            </Button>
          </div>
        </div>

        {/* 페이지 제목 */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">출석 체크</h1>
          <p className="text-muted-foreground">
            {selectedUser.name}님의 출석 현황을 관리합니다.
          </p>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="grid gap-6 md:grid-cols-2">
          <div key={`today-${selectedUserId}-${refreshKey}`}>
            <TodayClasses 
              userId={selectedUserId} 
              onAttendanceUpdate={handleAttendanceUpdate}
            />
          </div>
          
          <div key={`history-${selectedUserId}-${refreshKey}`}>
            <AttendanceHistory userId={selectedUserId} />
          </div>
        </div>

        {/* 테스트 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>📋 테스트 가이드</CardTitle>
            <CardDescription>
              출석 체크 기능을 테스트하는 방법
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-semibold mb-2">✅ 테스트 단계</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>테스트 데이터가 Supabase에 생성되어 있는지 확인</li>
                  <li>다른 테스트 사용자로 변경해보기</li>
                  <li>"출석 체크" 버튼 클릭</li>
                  <li>출석 상태 변경 확인</li>
                  <li>출석 이력에 기록 추가 확인</li>
                </ol>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">🔧 테스트 데이터 생성</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Supabase SQL Editor에서 다음 파일 실행:
                </p>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  scripts/create-test-data.sql
                </code>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2">🚀 구현된 기능</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>오늘 예정된 수업 목록 조회</li>
                <li>원클릭 출석 체크</li>
                <li>출석 상태 실시간 업데이트</li>
                <li>출석 이력 및 통계 표시</li>
                <li>수강권별 남은 수업 수 관리</li>
                <li>반응형 모바일 UI</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}