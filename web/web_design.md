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

### 📅 1개월차: 기반 구조 및 핵심 기능
**주차 1-2: 프로젝트 설정** ✅ **완료 (2025-09-02)**
- [x] Next.js 15.5.2 + TypeScript 프로젝트 초기화 ✅
- [x] 데이터베이스 스키마 생성 (supabase-schema.sql) ✅ 
- [x] Tailwind CSS + shadcn/ui 설정 ✅
- [x] 기본 라우팅 구조 설정 ✅
- [x] 기본 UI 컴포넌트 (Button, Card, NavigationMenu) ✅
- [x] TypeScript 타입 정의 ✅
- [x] PWA 기본 설정 (manifest.json) ✅
- [x] 프로젝트 문서화 (README.md, SUPABASE_SETUP.md) ✅
- [x] Git 설정 (.gitignore 업데이트) ✅
- [x] Supabase 프로젝트 생성 및 스키마 실행 ✅
- [x] Supabase 연결 테스트 및 디버깅 완료 ✅

**주차 2-3: 대시보드 및 레이아웃** ✅ **완료 (2025-09-03)**
- [x] 반응형 헤더 네비게이션 구현 (모바일/데스크톱) ✅
- [x] 사이드바 메뉴 시스템 (역할별 메뉴 분리) ✅
- [x] 대시보드 레이아웃 컴포넌트 ✅
- [x] 학생용 대시보드 페이지 (통계, 오늘 수업, 출석 기록) ✅
- [x] 관리자용 대시보드 페이지 (전체 현황, 빠른 액션) ✅
- [x] 랜딩 페이지 개선 (Hero 섹션, 기능 소개, CTA) ✅

**주차 3-4: 출석 관리 시스템** ✅ **완료 (2025-09-03)**
- [x] 출석 체크 API 라우트 구현 (`POST /api/attendance/check`) ✅
- [x] 오늘의 수업 조회 API (`GET /api/attendance/today/[userId]`) ✅
- [x] 출석 이력 조회 API (`GET /api/attendance/history/[userId]`) ✅
- [x] 출석 체크 버튼 컴포넌트 (상태별 UI 변화) ✅
- [x] 오늘의 수업 컴포넌트 (실시간 새로고침) ✅
- [x] 출석 이력 및 통계 컴포넌트 ✅
- [x] 출석 관리 통합 페이지 (`/attendance`) ✅
- [x] 테스트 데이터 스크립트 작성 ✅
- [x] 권한 검증 및 날짜 검증 로직 ✅
- [x] 수강권 자동 관리 (남은 수업 수 감소) ✅

**주차 4: 인증 시스템** 🔄 **진행 예정**
- [ ] Supabase Auth 연동
- [ ] 로그인/회원가입 페이지 구현
- [ ] 사용자 프로필 관리 기능
- [ ] 역할 기반 접근 제어 (학생/관리자)

### 📅 2개월차: 고급 기능 구현
**주차 5-6: 관리자 기능**

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

#### 출석 관련 ✅ **구현 완료**
```typescript
// app/api/attendance/check/route.ts
POST /api/attendance/check - 출석 체크
// Body: { classId: string, userId: string }
// 기능: 권한 검증, 날짜 검증, 수강권 자동 관리

// app/api/attendance/today/[userId]/route.ts  
GET /api/attendance/today/[userId] - 오늘 예정된 수업 목록 조회
// 반환: 오늘 수업, 활성 수강권, 주간 출석 통계

// app/api/attendance/history/[userId]/route.ts
GET /api/attendance/history/[userId] - 출석 이력 및 통계 조회
// 쿼리: ?limit=10&offset=0
// 반환: 출석 기록, 출석률, 코스별 통계

// app/api/test-supabase/route.ts
GET /api/test-supabase - Supabase 연결 테스트
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

### ✅ 완료된 작업 (2025-09-03 업데이트)

#### 1. **개발 환경 구축** ✅ **완료**
- Next.js 15.5.2 + TypeScript 프로젝트 생성
- Tailwind CSS + shadcn/ui 컴포넌트 시스템 설정
- 필수 패키지 설치 (@supabase/supabase-js, lucide-react, class-variance-authority 등)
- 개발 서버 정상 동작 확인 (http://localhost:3001)

#### 2. **데이터베이스 및 백엔드** ✅ **완료**
- 완전한 Supabase 스키마 설계 및 구현 (5개 테이블)
- RLS 정책 및 트리거 함수 구현
- Supabase 프로젝트 연결 및 테스트 완료
- Service Role 및 Anonymous 클라이언트 설정
- API 라우트 구현 (출석 체크, 이력 조회, 오늘 수업)
- 테스트 데이터 스크립트 작성

#### 3. **UI/UX 및 레이아웃 시스템** ✅ **완료**
- 반응형 헤더 네비게이션 (모바일/데스크톱)
- 사이드바 메뉴 시스템 (역할별 메뉴 분리)
- 대시보드 레이아웃 컴포넌트
- 학생용/관리자용 대시보드 페이지
- 프로페셔널 랜딩 페이지 (Hero, 기능 소개, CTA)
- 완전한 모바일 최적화

#### 4. **출석 관리 시스템** ✅ **완료**
- **API 엔드포인트**: 
  - `POST /api/attendance/check` - 출석 체크
  - `GET /api/attendance/today/[userId]` - 오늘 수업 조회
  - `GET /api/attendance/history/[userId]` - 출석 이력 및 통계
- **React 컴포넌트**:
  - `AttendanceButton` - 스마트 출석 체크 버튼
  - `TodayClasses` - 오늘의 수업 목록 (실시간 새로고침)
  - `AttendanceHistory` - 출석 이력 및 통계 (출석률, 코스별 통계)
- **주요 기능**:
  - 권한 검증 (본인 수업만 출석 가능)
  - 날짜 검증 (수업 당일만 출석 체크 가능)
  - 수강권 자동 관리 (남은 수업 수 자동 감소)
  - 실시간 상태 업데이트
  - 출석률 및 통계 계산
- **테스트 환경**: `/attendance` 페이지에서 완전한 테스트 가능

#### 5. **문서화 및 설정** ✅ **완료**
- README.md (상세한 설치/실행 가이드)
- SUPABASE_SETUP.md (Supabase 설정 가이드)
- Git 설정 (.gitignore) 업데이트
- PWA 기본 설정 (manifest.json)
- TypeScript 타입 정의 완료

### 🏗 **구현된 파일 구조**
```
web/
├── app/
│   ├── api/attendance/          # 출석 관리 API
│   ├── attendance/              # 출석 페이지
│   ├── dashboard/               # 대시보드
│   └── test-supabase/          # Supabase 연결 테스트
├── components/
│   ├── attendance/             # 출석 관련 컴포넌트
│   ├── layout/                 # 레이아웃 컴포넌트
│   └── ui/                     # 기본 UI 컴포넌트
├── lib/                        # 유틸리티 (Supabase 클라이언트)
├── hooks/                      # Custom React Hooks
├── scripts/                    # 테스트 데이터 스크립트
└── types/                      # TypeScript 타입 정의
```

### 🔄 **다음 단계 우선순위**

#### 높은 우선순위
1. **사용자 인증 시스템**
   - Supabase Auth 연동
   - 로그인/회원가입 페이지
   - 세션 관리 및 보안

2. **관리자 기능**
   - 학생 관리 (등록/수정/삭제)
   - 대리 출석 처리
   - 수강권 발급 및 관리

#### 중간 우선순위  
3. **수업 관리 시스템**
   - 수업 스케줄 등록/수정
   - 학생별 수업 할당
   - 수업 취소/변경 처리

4. **실시간 기능 강화**
   - Supabase Realtime 연동
   - 푸시 알림 (PWA)

### 📊 **전체 진행률: 약 40% 완료** ✅

**완료**: 기반 인프라, 출석 관리 핵심 기능  
**진행 중**: 사용자 인증 시스템 설계  
**대기**: 관리자 기능, 고급 기능들

### 🎯 **주요 성과**
- **완전한 출석 체크 시스템** 구현 및 테스트 완료
- **확장 가능한 아키텍처** 구축
- **모바일 우선 반응형 디자인** 완성
- **실용적인 MVP** 수준 달성

다음 단계로 **인증 시스템**을 구현하면 실제 서비스 런칭이 가능한 수준입니다! 🚀