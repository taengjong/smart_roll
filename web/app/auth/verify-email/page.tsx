import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, ArrowLeft } from 'lucide-react'

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">SmartRoll</h1>
        </div>

        <Card className="mt-8">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle>이메일을 확인해주세요</CardTitle>
            <CardDescription>
              회원가입이 완료되었습니다!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center text-sm text-gray-600 space-y-3">
              <p>
                입력하신 이메일 주소로 확인 메일을 보내드렸습니다.
              </p>
              <p>
                이메일의 <strong>확인 링크</strong>를 클릭하시면 
                계정이 활성화됩니다.
              </p>
              <p className="text-xs text-gray-500">
                메일이 오지 않았다면 스팸 폴더를 확인해보세요.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>💡 참고:</strong> 이메일 확인 후 로그인하시면 
                  SmartRoll의 모든 기능을 이용하실 수 있습니다.
                </p>
              </div>
              
              <div className="pt-4">
                <Button className="w-full" asChild>
                  <Link href="/auth/login">
                    로그인 페이지로 이동
                  </Link>
                </Button>
                
                <Button variant="outline" className="w-full mt-3" asChild>
                  <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    홈으로 돌아가기
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          <p>
            문제가 있으시면{' '}
            <Link href="/support" className="text-blue-600 hover:text-blue-500">
              고객지원
            </Link>
            으로 연락해주세요.
          </p>
        </div>
      </div>
    </div>
  )
}