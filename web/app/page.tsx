import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckSquare, Users, Calendar, BarChart3, Smartphone, Zap } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-primary">SmartRoll</div>
          <div className="space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/login">로그인</Link>
            </Button>
            <Button asChild>
              <Link href="/register">회원가입</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
            스마트한 출석 관리의
            <span className="text-primary block">새로운 시작</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            학원 관리자와 학생 모두를 위한 직관적이고 효율적인 출석 관리 시스템입니다.
            복잡한 출석 관리를 간단하게 만들어보세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/dashboard">대시보드 둘러보기</Link>
            </Button>
            <Button size="lg" variant="outline">
              데모 체험하기
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            왜 SmartRoll인가요?
          </h2>
          <p className="text-gray-600 text-lg">
            학원 운영의 모든 출석 관리 니즈를 한 번에 해결합니다
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CheckSquare className="h-12 w-12 text-primary mb-4" />
              <CardTitle>간편한 출석 체크</CardTitle>
              <CardDescription>
                원클릭으로 출석을 기록하고 실시간으로 현황을 파악할 수 있습니다.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <Users className="h-12 w-12 text-primary mb-4" />
              <CardTitle>통합 학생 관리</CardTitle>
              <CardDescription>
                학생 정보, 수강권, 출석 이력을 한 곳에서 체계적으로 관리합니다.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <Calendar className="h-12 w-12 text-primary mb-4" />
              <CardTitle>스마트 스케줄링</CardTitle>
              <CardDescription>
                수업 일정을 자동으로 관리하고 학생들에게 알림을 제공합니다.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-primary mb-4" />
              <CardTitle>실시간 통계</CardTitle>
              <CardDescription>
                출석률, 수업 현황 등 다양한 통계를 시각적으로 확인할 수 있습니다.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <Smartphone className="h-12 w-12 text-primary mb-4" />
              <CardTitle>모바일 최적화</CardTitle>
              <CardDescription>
                PWA 기술로 모든 디바이스에서 앱과 같은 사용 경험을 제공합니다.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <Zap className="h-12 w-12 text-primary mb-4" />
              <CardTitle>빠른 성능</CardTitle>
              <CardDescription>
                최신 웹 기술로 빠르고 안정적인 서비스를 제공합니다.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            지금 바로 시작해보세요
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            복잡한 출석 관리를 SmartRoll로 간단하게 만들어보세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register">무료로 시작하기</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary" asChild>
              <Link href="/dashboard">데모 체험하기</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="text-2xl font-bold mb-4">SmartRoll</div>
            <p className="text-gray-400">
              스마트한 출석 관리 시스템 © 2024
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}