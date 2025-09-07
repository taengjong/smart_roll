'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { AuthenticatedRoute } from '@/components/auth/protected-route'
import { 
  Calendar, 
  CheckSquare, 
  Clock, 
  Users,
  BookOpen,
  TrendingUp,
  AlertTriangle
} from 'lucide-react'

export default function DashboardPage() {
  return (
    <AuthenticatedRoute>
      <DashboardContent />
    </AuthenticatedRoute>
  )
}

function DashboardContent() {
  const { user } = useAuth()
  
  if (!user) return null
  
  if (user.profile?.role === 'admin') {
    return <AdminDashboard />
  } else {
    return <StudentDashboard />
  }
}

function StudentDashboard() {
  const { user } = useAuth()
  // TODO: 실제 데이터로 교체
  const todayClasses = [
    {
      id: '1',
      courseName: '취미 보컬',
      time: '14:00 - 15:00',
      status: 'scheduled' as const
    },
    {
      id: '2', 
      courseName: '기타 레슨',
      time: '16:00 - 17:00',
      status: 'scheduled' as const
    }
  ]

  const stats = {
    attendanceRate: 85,
    remainingClasses: 12,
    totalClasses: 20,
    nextClass: '오늘 14:00'
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">안녕하세요, {user?.profile?.name || user?.email}님! 👋</h1>
          <p className="text-muted-foreground">
            오늘의 수업 일정과 출석 현황을 확인하세요.
          </p>
        </div>

        {/* 통계 카드 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">출석률</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.attendanceRate}%</div>
              <p className="text-xs text-muted-foreground">이번 달 기준</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">남은 수업</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.remainingClasses}회</div>
              <p className="text-xs text-muted-foreground">전체 {stats.totalClasses}회 중</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">다음 수업</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.nextClass}</div>
              <p className="text-xs text-muted-foreground">취미 보컬</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">이번 주 출석</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3/4</div>
              <p className="text-xs text-muted-foreground">수업 참여</p>
            </CardContent>
          </Card>
        </div>

        {/* 오늘의 수업 */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
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
            </CardHeader>
            <CardContent className="space-y-4">
              {todayClasses.length > 0 ? (
                todayClasses.map((classItem) => (
                  <div key={classItem.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{classItem.courseName}</h3>
                      <p className="text-sm text-muted-foreground">{classItem.time}</p>
                    </div>
                    <Button size="sm">
                      출석체크
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  오늘 예정된 수업이 없습니다.
                </p>
              )}
            </CardContent>
          </Card>

          {/* 최근 출석 기록 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckSquare className="mr-2 h-5 w-5" />
                최근 출석 기록
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">12/01 취미 보컬</p>
                  <p className="text-sm text-muted-foreground">14:00 - 15:00</p>
                </div>
                <span className="text-green-600">✅ 출석</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">11/29 기타 레슨</p>
                  <p className="text-sm text-muted-foreground">16:00 - 17:00</p>
                </div>
                <span className="text-green-600">✅ 출석</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">11/27 취미 보컬</p>
                  <p className="text-sm text-muted-foreground">14:00 - 15:00</p>
                </div>
                <span className="text-red-600">❌ 결석</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

function AdminDashboard() {
  const { user } = useAuth()
  // TODO: 실제 데이터로 교체
  const stats = {
    todayAttendance: { attended: 8, total: 12 },
    activeStudents: 45,
    activeCourses: 6,
    pendingActions: 3
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">관리자 대시보드 👨‍💼</h1>
          <p className="text-muted-foreground">
            전체 학원 운영 현황을 한눈에 확인하세요.
          </p>
        </div>

        {/* 관리자 통계 카드 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">오늘 출석률</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.todayAttendance.attended}/{stats.todayAttendance.total}
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.round((stats.todayAttendance.attended / stats.todayAttendance.total) * 100)}% 출석
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">활성 학생</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeStudents}명</div>
              <p className="text-xs text-muted-foreground">등록된 학생</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">운영 중인 과정</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeCourses}개</div>
              <p className="text-xs text-muted-foreground">활성 과정</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">대기 중인 작업</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pendingActions}</div>
              <p className="text-xs text-muted-foreground">처리 필요</p>
            </CardContent>
          </Card>
        </div>

        {/* 관리자 주요 기능 */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>빠른 액션</CardTitle>
              <CardDescription>자주 사용하는 관리 기능</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                새 학생 등록
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                수업 스케줄 등록
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <CheckSquare className="mr-2 h-4 w-4" />
                대리 출석 처리
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <BookOpen className="mr-2 h-4 w-4" />
                수강권 발급
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>최근 활동</CardTitle>
              <CardDescription>시스템 내 최근 활동 현황</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-sm">김민수 학생이 보컬 레슨에 출석했습니다.</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <p className="text-sm">새로운 기타 수강권이 등록되었습니다.</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <p className="text-sm">이지은 학생의 보강 요청이 있습니다.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}