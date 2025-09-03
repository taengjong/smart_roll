'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSupabaseConnection } from '@/hooks/use-supabase-connection'
import { CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react'

export default function TestSupabasePage() {
  const { isConnected, isLoading, error, lastChecked, retry } = useSupabaseConnection()
  const [apiTestResult, setApiTestResult] = useState<any>(null)
  const [apiTesting, setApiTesting] = useState(false)

  const testAPIRoute = async () => {
    setApiTesting(true)
    setApiTestResult(null)

    try {
      const response = await fetch('/api/test-supabase')
      const result = await response.json()
      setApiTestResult(result)
    } catch (error) {
      setApiTestResult({
        success: false,
        error: 'Failed to call API route',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setApiTesting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Supabase 연결 테스트</h1>
          <p className="text-muted-foreground">
            SmartRoll과 Supabase 데이터베이스 연결 상태를 확인합니다
          </p>
        </div>

        {/* Client-side Connection Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isConnected ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span>클라이언트 연결 테스트</span>
            </CardTitle>
            <CardDescription>
              브라우저에서 Supabase로의 직접 연결을 테스트합니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <div className="flex justify-between">
                <span className="font-medium">상태:</span>
                <span className={`font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {isLoading ? '연결 중...' : isConnected ? '연결됨' : '연결 실패'}
                </span>
              </div>
              
              {error && (
                <div className="flex justify-between">
                  <span className="font-medium">오류:</span>
                  <span className="text-red-600 text-sm max-w-md text-right">{error}</span>
                </div>
              )}
              
              {lastChecked && (
                <div className="flex justify-between">
                  <span className="font-medium">마지막 확인:</span>
                  <span className="text-sm text-muted-foreground">
                    {lastChecked.toLocaleString('ko-KR')}
                  </span>
                </div>
              )}
            </div>
            
            <Button onClick={retry} disabled={isLoading} className="w-full">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              다시 연결 테스트
            </Button>
          </CardContent>
        </Card>

        {/* API Route Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {apiTesting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : apiTestResult?.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : apiTestResult && !apiTestResult.success ? (
                <XCircle className="h-5 w-5 text-red-600" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
              )}
              <span>API 라우트 테스트</span>
            </CardTitle>
            <CardDescription>
              서버에서 Supabase로의 연결을 테스트합니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {apiTestResult && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm overflow-x-auto">
                  {JSON.stringify(apiTestResult, null, 2)}
                </pre>
              </div>
            )}
            
            <Button onClick={testAPIRoute} disabled={apiTesting} className="w-full">
              {apiTesting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              API 라우트 테스트
            </Button>
          </CardContent>
        </Card>

        {/* Setup Guide */}
        <Card>
          <CardHeader>
            <CardTitle>설정 가이드</CardTitle>
            <CardDescription>
              연결에 문제가 있다면 다음 단계를 확인하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm space-y-1">
              <p>1. <code>SUPABASE_SETUP.md</code> 파일의 가이드를 따라 Supabase 프로젝트를 생성하세요</p>
              <p>2. <code>.env.local</code> 파일에 올바른 Supabase URL과 API 키를 설정하세요</p>
              <p>3. <code>supabase-schema.sql</code> 파일을 Supabase SQL Editor에서 실행하세요</p>
              <p>4. 개발 서버를 재시작하세요: <code>npm run dev</code></p>
            </div>
          </CardContent>
        </Card>

        {/* Environment Variables Check */}
        <Card>
          <CardHeader>
            <CardTitle>환경 변수 확인</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>NEXT_PUBLIC_SUPABASE_URL:</span>
                <span className={process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url' ? 'text-green-600' : 'text-red-600'}>
                  {process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url' ? '설정됨' : '미설정'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
                <span className={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your_supabase_anon_key' ? 'text-green-600' : 'text-red-600'}>
                  {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your_supabase_anon_key' ? '설정됨' : '미설정'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}