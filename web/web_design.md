# SmartRoll - 웹 기반 학원 출석 관리 시스템 설계 문서

## 1. 프로젝트 개요

### 🎯 목표
- **웹 우선 개발**: PWA로 모든 디바이스 대응
- **빠른 MVP 출시**: 2-3개월 내 서비스 런칭
- **관리 효율화**: 학원 관리자와 학생 모두를 위한 통합 솔루션

### 📱 웹 기반 선택 이유
- 한 번 개발로 모든 플랫폼 커버 (모바일, 태블릿, PC)
- 앱스토어 심사 없이 즉시 배포/업데이트 가능
- PWA 기술로 네이티브 앱과 동일한 사용자 경험 제공
- 개발 및 유지보수 비용 최소화

## 2. 기술 스택

### 🚀 핵심 기술 스택
```
Frontend: Next.js 14 (App Router) + TypeScript + Tailwind CSS
Backend: Next.js API Routes + Prisma ORM
Database: Supabase (PostgreSQL + 실시간 기능)
Authentication: Supabase Auth
Hosting: Vercel (자동 배포)
PWA: next-pwa 플러그인
```

### 🔧 추가 라이브러리
```
UI Components: shadcn/ui
Form Handling: React Hook Form + Zod
State Management: Zustand (필요시)
QR Code: qrcode + qr-scanner
Charts: Recharts (통계용)
Date Handling: date-fns
Icons: Lucide React
```

### 📊 서비스 구조
```
[PWA Web App] ←→ [Next.js API] ←→ [Supabase DB]
       ↓                              ↑
[Service Worker]              [Real-time Updates]
```

## 3. 데이터베이스 설계 (Supabase)

### 3.1 Supabase 스키마 설계

#### users (Supabase Auth 확장)
```sql
-- Supabase의 auth.users를 확장하는 profiles 테이블
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### courses (수강권 종류)
```sql
CREATE TABLE courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL, -- '취미 보컬', '입시 기타' 등
    duration_weeks INTEGER DEFAULT 4,
    price DECIMAL(10,2),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### subscriptions (구매한 수강권)
```sql
CREATE TABLE subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    purchase_date DATE DEFAULT CURRENT_DATE,
    expiry_date DATE,
    remaining_classes INTEGER DEFAULT 0,
    total_classes INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### classes (개별 수업)
```sql
CREATE TABLE classes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'attended', 'missed', 'cancelled', 'makeup_requested')),
    attended_at TIMESTAMPTZ,
    attended_by UUID REFERENCES profiles(id), -- 관리자가 대리 출석 시
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### payments (결제 내역)
```sql
CREATE TABLE payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT DEFAULT 'offline',
    transaction_id TEXT,
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    paid_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.2 Supabase Row Level Security (RLS) 정책

```sql
-- profiles 정책
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- subscriptions 정책
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all subscriptions" ON subscriptions FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
```

## 4. PWA 설정 계획

### 4.1 PWA 기능 구현
```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  buildExcludes: [/middleware-manifest\.json$/],
})

module.exports = withPWA({
  experimental: {
    appDir: true,
  },
})
```

### 4.2 manifest.json
```json
{
  "name": "SmartRoll - 스마트 출석",
  "short_name": "SmartRoll",
  "description": "학원 출석 관리 시스템",
  "theme_color": "#3b82f6",
  "background_color": "#ffffff",
  "display": "standalone",
  "orientation": "portrait",
  "scope": "/",
  "start_url": "/",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 4.3 오프라인 지원
- 기본 페이지 캐싱 (로그인, 메인 대시보드)
- 출석 데이터 로컬 저장 후 온라인 시 동기화
- 오프라인 상태 감지 및 사용자 알림

## 5. 프로젝트 구조

### 5.1 디렉토리 구조
```
smart-roll-web/
├── app/                    # Next.js 13+ App Router
│   ├── (auth)/            # 인증 관련 페이지
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/       # 메인 애플리케이션
│   │   ├── attendance/
│   │   ├── classes/
│   │   ├── courses/
│   │   └── admin/
│   ├── api/               # API Routes
│   ├── globals.css
│   └── layout.tsx
├── components/            # 재사용 가능한 컴포넌트
│   ├── ui/               # shadcn/ui 컴포넌트
│   ├── forms/            # 폼 관련 컴포넌트
│   └── dashboard/        # 대시보드 전용 컴포넌트
├── lib/                  # 유틸리티 함수
│   ├── supabase.ts
│   ├── auth.ts
│   └── utils.ts
├── types/                # TypeScript 타입 정의
├── hooks/                # Custom React Hooks
└── public/               # 정적 파일
    ├── icons/            # PWA 아이콘
    └── manifest.json
```

### 5.2 주요 컴포넌트 설계

#### 1. 인증 시스템
```typescript
// components/auth/LoginForm.tsx
interface LoginFormProps {
  onSuccess: () => void;
}

// lib/auth.ts - Supabase Auth 래퍼
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};
```

#### 2. 출석 체크 시스템
```typescript
// components/attendance/AttendanceButton.tsx
interface AttendanceButtonProps {
  classId: string;
  onAttendanceMarked: (classId: string) => void;
}

// QR 코드 스캔 기능 (선택적)
// components/attendance/QRScanner.tsx
```

#### 3. 관리자 대시보드
```typescript
// components/admin/AdminDashboard.tsx
interface AdminDashboardProps {
  students: Student[];
  classes: Class[];
  subscriptions: Subscription[];
}
```

## 6. 개발 로드맵 (3개월)

### 📅 1개월차: 기반 구조 및 인증
**주차 1-2: 프로젝트 설정** ✅ **완료 (2025-09-02)**
- [x] Next.js 14 + TypeScript 프로젝트 초기화 ✅
- [x] 데이터베이스 스키마 생성 (supabase-schema.sql) ✅ 
- [x] Tailwind CSS + shadcn/ui 설정 ✅
- [x] 기본 라우팅 구조 설정 ✅
- [x] 기본 UI 컴포넌트 (Button, Card) ✅
- [x] TypeScript 타입 정의 ✅
- [x] PWA 기본 설정 (manifest.json) ✅
- [x] 프로젝트 문서화 (README.md) ✅
- [x] Git 설정 (.gitignore 업데이트) ✅
- [ ] Supabase 프로젝트 생성 및 스키마 실행 🔄 **진행 예정**

**주차 3-4: 인증 시스템**
- [ ] Supabase Auth 연동
- [ ] 로그인/회원가입 페이지 구현
- [ ] 사용자 프로필 관리 기능
- [ ] 역할 기반 접근 제어 (학생/관리자)

### 📅 2개월차: 핵심 기능 구현
**주차 5-6: 출석 시스템**
- [ ] 출석 체크 기능 구현
- [ ] 수업 일정 조회 화면
- [ ] 출석 이력 표시 기능
- [ ] 실시간 출석 현황 업데이트

**주차 7-8: 수업 관리 시스템**
- [ ] 수강권 관리 기능
- [ ] 수업 등록/수정/삭제 기능
- [ ] 학생별 수업 할당 시스템
- [ ] 기본 통계 대시보드

### 📅 3개월차: 고도화 및 배포
**주차 9-10: 관리자 기능 완성**
- [ ] 관리자 전용 대시보드
- [ ] 학생 관리 (등록/수정/삭제)
- [ ] 대리 출석 처리 기능
- [ ] 수강권 현황 모니터링

**주차 11-12: PWA 최적화 및 배포**
- [ ] PWA 설정 완료 (오프라인 지원, 홈화면 추가)
- [ ] 모바일 UI/UX 최적화
- [ ] 성능 최적화 (이미지, 코드 분할)
- [ ] Vercel 배포 및 도메인 연결
- [ ] 사용자 테스트 및 버그 수정

## 7. API 설계

### 7.1 주요 API 엔드포인트

#### 인증 관련
```typescript
// app/api/auth/profile/route.ts
GET /api/auth/profile - 현재 사용자 프로필 조회
PUT /api/auth/profile - 사용자 프로필 업데이트
```

#### 출석 관련
```typescript
// app/api/attendance/route.ts
POST /api/attendance - 출석 체크
GET /api/attendance/[userId] - 특정 사용자 출석 이력

// app/api/attendance/[classId]/route.ts
PUT /api/attendance/[classId] - 출석 상태 업데이트 (관리자)
```

#### 수업 관리
```typescript
// app/api/classes/route.ts
GET /api/classes - 수업 목록 조회
POST /api/classes - 새 수업 생성 (관리자)

// app/api/classes/[id]/route.ts
PUT /api/classes/[id] - 수업 정보 업데이트
DELETE /api/classes/[id] - 수업 삭제
```

### 7.2 실시간 업데이트 (Supabase Realtime)
```typescript
// hooks/useRealtimeAttendance.ts
export const useRealtimeAttendance = (classId: string) => {
  useEffect(() => {
    const subscription = supabase
      .channel(`attendance-${classId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'classes' },
        (payload) => {
          // 실시간 출석 현황 업데이트
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [classId]);
};
```

## 8. UI/UX 설계

### 8.1 모바일 우선 디자인
- **Touch-friendly**: 최소 44px 터치 영역
- **thumb-zone 고려**: 중요한 버튼들을 엄지손가락 영역에 배치
- **단순한 네비게이션**: 하단 탭 또는 햄버거 메뉴

### 8.2 주요 화면 설계

#### 학생 대시보드
```
┌─────────────────────┐
│  📅 오늘의 수업      │
│  ┌─────────────────┐ │
│  │ 보컬 레슨       │ │
│  │ 14:00 - 15:00   │ │
│  │ [출석체크] 버튼  │ │
│  └─────────────────┘ │
│                     │
│  📊 이번 달 출석률   │
│  ████████░░ 80%     │
│                     │
│  📋 최근 출석 기록   │
│  • 12/01 보컬 ✅   │
│  • 11/29 기타 ✅   │
│  • 11/27 보컬 ❌   │
└─────────────────────┘
```

#### 관리자 대시보드
```
┌─────────────────────┐
│  👥 오늘 수업 현황   │
│  총 12명 중 8명 출석 │
│                     │
│  🔍 학생 검색       │
│  [검색 입력창]      │
│                     │
│  📝 빠른 액션       │
│  [수업 등록]        │
│  [출석 처리]        │
│  [학생 관리]        │
└─────────────────────┘
```

### 8.3 접근성 (a11y)
- 스크린 리더 지원
- 키보드 네비게이션
- 충분한 색상 대비
- 의미있는 alt 텍스트

## 9. 보안 및 성능

### 9.1 보안 조치
- **Supabase RLS**: 데이터베이스 레벨 접근 제어
- **CSRF 보호**: Next.js 기본 보안 기능 활용
- **입력 검증**: Zod 스키마를 통한 타입 안전성
- **환경 변수 관리**: `.env.local`로 민감 정보 보호

### 9.2 성능 최적화
- **코드 분할**: 라우트별 자동 코드 분할
- **이미지 최적화**: Next.js Image 컴포넌트 활용
- **캐싱 전략**: Supabase 쿼리 캐싱
- **번들 분석**: `@next/bundle-analyzer`로 번들 크기 모니터링

## 10. 운영 및 모니터링

### 10.1 배포 전략
- **Vercel 자동 배포**: Git 푸시 시 자동 배포
- **Preview 배포**: PR별 미리보기 환경
- **환경 분리**: development, staging, production

### 10.2 모니터링
- **Vercel Analytics**: 웹 성능 및 사용자 분석
- **Supabase Dashboard**: 데이터베이스 및 API 모니터링
- **사용자 피드백**: 앱 내 피드백 수집 기능

## 11. 예상 비용 (월 기준)

### 11.1 개발/테스트 단계
- **도메인**: $1/월 (.com 도메인)
- **Vercel**: 무료 (Hobby 플랜)
- **Supabase**: 무료 (Free 플랜 - 500MB DB, 5GB 대역폭)
- **총합**: ~$1/월

### 11.2 상용 서비스 운영 시
- **도메인**: $1/월
- **Vercel**: $20/월 (Pro 플랜, 커스텀 도메인)
- **Supabase**: $25/월 (Pro 플랜, 8GB DB, 250GB 대역폭)
- **총합**: ~$46/월

## 12. 다음 단계

## 📈 프로젝트 진행 현황

### ✅ 완료된 작업 (2025-09-02)
1. **개발 환경 구축** ✅
   - Next.js 15.5.2 프로젝트 생성 완료
   - TypeScript + Tailwind CSS 설정 완료
   - 필수 패키지 설치 완료 (@supabase/supabase-js, shadcn/ui 등)

2. **프로젝트 기반 구조** ✅
   - 디렉토리 구조 설정 완료 (app/, components/, lib/, types/ 등)
   - 기본 UI 컴포넌트 생성 (Button, Card)
   - Tailwind 테마 및 CSS 변수 설정 완료
   - TypeScript 데이터베이스 타입 정의 완료

3. **데이터베이스 설계** ✅
   - 완전한 Supabase SQL 스키마 파일 생성 (supabase-schema.sql)
   - RLS 정책 및 트리거 함수 포함
   - 샘플 데이터 포함

4. **PWA 기본 설정** ✅
   - manifest.json 생성 완료
   - 메타데이터 설정 완료

5. **프로젝트 문서화** ✅
   - 상세한 README.md 작성 완료
   - 설치/실행 가이드 포함
   - Git 설정 (.gitignore) 완료

6. **개발 서버 테스트** ✅
   - 로컬 개발 환경 정상 동작 확인 (http://localhost:3000)

### 🔄 다음 단계
1. **Supabase 프로젝트 생성**
   - https://supabase.com 에서 새 프로젝트 생성
   - supabase-schema.sql 파일을 SQL Editor에서 실행
   - 환경 변수 설정 (.env.local)

2. **인증 시스템 구현**
   - 로그인/회원가입 페이지 구현
   - Supabase Auth 연동
   - 사용자 프로필 관리

3. **기본 대시보드 구조 생성**
   - 학생용 대시보드 레이아웃
   - 관리자용 대시보드 레이아웃
   - 네비게이션 구조

### 성공을 위한 핵심 포인트
- **사용자 피드백 우선**: 완벽한 기능보다 사용자가 원하는 기능 먼저
- **점진적 개선**: MVP → 피드백 → 개선 사이클 반복
- **모바일 최적화**: 대부분의 사용자가 모바일로 접근할 것

### 📊 전체 진행률
**주차 1-2 프로젝트 설정: 90% 완료** ✅
- 초기 설정 및 기반 구조 완료
- Supabase 연결만 남은 상태