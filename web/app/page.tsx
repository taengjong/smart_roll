export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-primary">
          SmartRoll
        </h1>
        <p className="text-xl text-muted-foreground">
          스마트 출석 관리 시스템
        </p>
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <p className="text-muted-foreground">
            학원 관리자와 학생을 위한 통합 출석 관리 솔루션
          </p>
        </div>
      </div>
    </div>
  )
}