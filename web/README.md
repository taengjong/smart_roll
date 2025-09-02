# SmartRoll - 웹 기반 학원 출석 관리 시스템

학원 관리자와 학생을 위한 모던 웹 기반 출석 관리 시스템입니다.

## 🚀 기술 스택

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## 📋 주요 기능

- **사용자 인증**: 학생/관리자 역할 기반 인증
- **출석 관리**: 실시간 출석 체크 및 이력 관리
- **수강권 관리**: 수강권 등록, 수정, 삭제
- **수업 스케줄링**: 수업 일정 관리 및 조회
- **실시간 업데이트**: Supabase Realtime을 통한 실시간 데이터 동기화
- **PWA 지원**: 모바일 앱과 같은 사용자 경험
- **관리자 대시보드**: 종합적인 관리 기능

## 🏗 프로젝트 구조

```
smart-roll/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 인증 관련 페이지
│   ├── (dashboard)/       # 메인 애플리케이션
│   ├── api/               # API Routes
│   ├── globals.css
│   └── layout.tsx
├── components/            # 재사용 가능한 컴포넌트
│   └── ui/               # shadcn/ui 컴포넌트
├── lib/                  # 유틸리티 함수
├── types/                # TypeScript 타입 정의
├── hooks/                # Custom React Hooks
└── public/               # 정적 파일
```

## 🔧 설치 및 실행

### 1. 저장소 클론
```bash
git clone [repository-url]
cd smart-roll/web
```

### 2. 의존성 설치
```bash
npm install
```

### 3. Supabase 프로젝트 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. SQL Editor에서 `supabase-schema.sql` 파일 실행
3. API 키 확인 (Settings > API)

### 4. 환경 변수 설정

`.env.local.example`을 복사하여 `.env.local` 생성:

```bash
cp .env.local.example .env.local
```

`.env.local` 파일에 Supabase 설정 추가:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 📊 데이터베이스 스키마

### 주요 테이블
- **profiles**: 사용자 프로필 (학생/관리자)
- **courses**: 수강권 종류
- **subscriptions**: 구매한 수강권
- **classes**: 개별 수업 및 출석 정보
- **payments**: 결제 내역

### RLS (Row Level Security)
- 사용자는 본인의 데이터만 조회/수정 가능
- 관리자는 모든 데이터 접근 가능
- 자동 프로필 생성 및 권한 관리

## 👥 사용자 역할

### 학생 (Student)
- 본인의 수업 일정 조회
- 출석 체크
- 출석 이력 확인
- 수강권 현황 조회

### 관리자 (Admin)
- 모든 학생 관리
- 수업 스케줄 관리
- 출석 현황 모니터링
- 수강권 등록/관리
- 대리 출석 처리
- 통계 및 보고서

## 🚀 배포

### Vercel 배포

1. GitHub 저장소에 코드 푸시
2. [Vercel](https://vercel.com)에서 프로젝트 import
3. 환경 변수 설정
4. 자동 배포 완료

### 환경 변수 (Vercel)
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

## 📱 PWA 기능

- 오프라인 지원
- 홈 화면에 추가 가능
- 푸시 알림 (향후 추가 예정)
- 모바일 친화적 UI/UX

## 🛠 개발 스크립트

```bash
npm run dev          # 개발 서버 실행
npm run build        # 프로덕션 빌드
npm run start        # 프로덕션 서버 실행
npm run lint         # ESLint 실행
npm run type-check   # TypeScript 타입 체크
```

## 📝 관리자 계정 생성

1. 앱에서 일반 사용자로 회원가입
2. Supabase Dashboard > Table Editor > profiles
3. 해당 사용자의 `role`을 `admin`으로 변경

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'admin@example.com';
```

## 🤝 기여 방법

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 라이센스

This project is licensed under the MIT License.

## 🆘 문제 해결

### 일반적인 문제들

**Q: Supabase 연결 오류**
- 환경 변수가 정확히 설정되었는지 확인
- Supabase 프로젝트가 활성화되었는지 확인

**Q: 권한 오류**
- RLS 정책이 올바르게 설정되었는지 확인
- 사용자 역할이 정확히 할당되었는지 확인

**Q: 빌드 오류**
- TypeScript 타입 오류 확인: `npm run type-check`
- 린트 오류 확인: `npm run lint`

## 📞 지원

문제나 질문이 있으시면 이슈를 생성해 주세요.