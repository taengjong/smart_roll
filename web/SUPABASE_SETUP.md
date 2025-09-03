# Supabase 설정 가이드

## 1. Supabase 프로젝트 생성

### 단계 1: Supabase 계정 생성
1. [https://supabase.com](https://supabase.com) 접속
2. **Start your project** 클릭
3. GitHub 계정으로 로그인 (권장) 또는 이메일로 회원가입

### 단계 2: 새 프로젝트 생성
1. 대시보드에서 **New project** 클릭
2. 프로젝트 정보 입력:
   - **Name**: `smart-roll` (또는 원하는 이름)
   - **Database Password**: 강력한 비밀번호 생성 (잘 기억해두세요!)
   - **Region**: `Northeast Asia (Seoul)` 선택 (한국에서 가장 빠른 응답속도)
3. **Create new project** 클릭
4. 프로젝트 생성 완료까지 약 2-3분 대기

## 2. 데이터베이스 스키마 생성

### 단계 1: SQL Editor 접속
1. 왼쪽 메뉴에서 **SQL Editor** 클릭
2. **New query** 버튼 클릭

### 단계 2: 스키마 실행
1. `supabase-schema.sql` 파일의 전체 내용을 복사
2. SQL Editor에 붙여넣기
3. **Run** 버튼 클릭 (Ctrl/Cmd + Enter)
4. 성공 메시지 확인: "Success. No rows returned"

### 단계 3: 테이블 생성 확인
1. 왼쪽 메뉴에서 **Table Editor** 클릭
2. 다음 테이블들이 생성되었는지 확인:
   - `profiles`
   - `courses` 
   - `subscriptions`
   - `classes`
   - `payments`

## 3. API 키 확인

### 단계 1: Settings 접속
1. 왼쪽 메뉴에서 **Settings** 클릭
2. **API** 탭 선택

### 단계 2: 필요한 키 복사
다음 정보들을 복사해두세요:

```
Project URL: https://your-project-id.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **주의**: `service_role` 키는 모든 권한을 가지므로 절대 클라이언트에서 사용하지 마세요!

## 4. 환경 변수 설정

### 단계 1: 환경 변수 파일 생성
프로젝트 루트에서 다음 명령 실행:
```bash
cp .env.local.example .env.local
```

### 단계 2: 환경 변수 입력
`.env.local` 파일을 열고 다음과 같이 수정:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Supabase Service Role Key (for admin operations)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**실제 값으로 교체해주세요!**

## 5. Row Level Security (RLS) 활성화 확인

### 확인 방법
1. **Table Editor**에서 각 테이블 클릭
2. 오른쪽 **Settings** 탭에서 "Enable Row Level Security" 활성화 확인
3. **Policies** 탭에서 생성된 정책들 확인

### 주요 정책들
- **profiles**: 본인 데이터만 조회/수정, 관리자는 모든 데이터 접근
- **courses**: 활성 과정은 모두 조회 가능, 관리자만 관리
- **subscriptions**: 본인 수강권만 조회, 관리자는 모든 데이터 접근
- **classes**: 본인 수업만 조회, 관리자는 모든 데이터 접근
- **payments**: 본인 결제만 조회, 관리자는 모든 데이터 접근

## 6. 인증 설정 (선택사항)

### 이메일 인증 설정
1. **Authentication** → **Settings** 클릭
2. **Email Auth** 섹션에서 설정 확인:
   - Enable email confirmations: ON (권장)
   - Enable email change confirmations: ON (권장)

### 소셜 로그인 설정 (나중에)
원하는 경우 Google, GitHub 등의 소셜 로그인 설정 가능

## 7. 연결 테스트

환경 변수 설정 후 개발 서버를 재시작하고 연결 테스트:

```bash
npm run dev
```

브라우저에서 콘솔을 열고 Supabase 연결 오류가 없는지 확인

## 📝 다음 단계

1. ✅ Supabase 프로젝트 생성
2. ✅ 스키마 실행
3. ✅ 환경 변수 설정
4. 🔄 연결 테스트
5. 🔄 관리자 계정 생성

## 🆘 문제 해결

### 자주 발생하는 오류들

**1. "relation does not exist" 오류**
- 스키마가 제대로 실행되지 않음
- SQL Editor에서 `supabase-schema.sql` 재실행

**2. "RLS policy" 오류** 
- Row Level Security 정책 문제
- 각 테이블의 RLS 정책이 올바르게 설정되었는지 확인

**3. 환경 변수 인식 오류**
- `.env.local` 파일 위치 확인 (프로젝트 루트)
- 개발 서버 재시작 필요

### 지원
문제 발생 시 Supabase 대시보드의 **Logs** 탭에서 오류 로그를 확인할 수 있습니다.