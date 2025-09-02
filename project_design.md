# SmartRoll - 학원 출석 관리 시스템 설계 문서

## 1. 프로젝트 개요
SmartRoll은 음악 학원의 수업 출석 및 수강권 관리를 위한 모바일/웹 통합 솔루션입니다.

### 주요 목표
- 학생들의 수업 출석 관리 자동화
- 수강권 결제 및 관리 시스템 구현
- 관리자 및 학생용 통합 플랫폼 제공

## 2. 기능 요구사항 분석

### 2.1 사용자 역할
- **학생 (개인 유저)**: 출석 체크, 수업 조회, 결제, 통계 조회
- **관리자**: 수업 할당, 출석 관리, 시스템 전반 관리

### 2.2 핵심 기능

#### 학생 기능
1. **출석 관리**
   - 할당된 수업에 대한 출석 체크
   - 수업 일정 조회

2. **수강권 관리**
   - 앱 내 결제 시스템 (취미 보컬/기타, 입시 보컬/기타)
   - 4주간 유효한 수강권 구매

3. **기록 및 통계**
   - 출석 이력 조회
   - 결제 내역 조회
   - 수강 통계 대시보드

4. **스케줄 관리**
   - 수업 취소 요청
   - 수업 보강 요청

#### 관리자 기능
1. **수업 관리**
   - 학생별 수업 할당
   - 대리 출석 처리 (학생 휴대폰 미소지 시)

2. **시스템 관리**
   - 전체 출석 현황 모니터링
   - 수강권 현황 관리

## 3. 시스템 아키텍처

### 3.1 전체 구조
```
[iOS App] ←→ [REST API] ←→ [Database]
[Android App] ↗    ↓         ↑
[Web Admin] ←→ [Backend Server]
```

### 3.2 기술 스택 제안

#### 백엔드
- **Framework**: Node.js + Express 또는 Python + Django/FastAPI
- **Database**: PostgreSQL (관계형 데이터를 위한 안정적 선택)
- **Authentication**: JWT 기반 인증
- **Payment**: 아임포트 또는 토스페이먼츠 연동

#### 모바일 앱
- **iOS**: Swift + SwiftUI (현재 프로젝트에서 시작된 것으로 보임)
- **Android**: Kotlin + Jetpack Compose
- **Cross-platform 대안**: React Native 또는 Flutter

#### 웹 관리자 페이지
- **Frontend**: React.js + TypeScript
- **UI Framework**: Material-UI 또는 Ant Design

#### 인프라
- **Cloud**: AWS 또는 Google Cloud Platform
- **Database Hosting**: AWS RDS 또는 Google Cloud SQL
- **API Hosting**: AWS EC2/Lambda 또는 Google Cloud Run

## 4. 데이터베이스 스키마 설계

### 4.1 주요 엔티티

#### Users (사용자)
```sql
- id: PRIMARY KEY
- email: VARCHAR (유니크)
- password_hash: VARCHAR
- name: VARCHAR
- phone: VARCHAR
- role: ENUM ('student', 'admin')
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### Courses (수강권 종류)
```sql
- id: PRIMARY KEY
- name: VARCHAR (취미 보컬, 입시 기타 등)
- duration_weeks: INTEGER (기본 4주)
- price: DECIMAL
- description: TEXT
```

#### Subscriptions (구매한 수강권)
```sql
- id: PRIMARY KEY
- user_id: FOREIGN KEY → Users.id
- course_id: FOREIGN KEY → Courses.id
- purchase_date: DATE
- expiry_date: DATE
- remaining_classes: INTEGER
- status: ENUM ('active', 'expired', 'cancelled')
```

#### Classes (개별 수업)
```sql
- id: PRIMARY KEY
- subscription_id: FOREIGN KEY → Subscriptions.id
- scheduled_date: DATE
- scheduled_time: TIME
- status: ENUM ('scheduled', 'attended', 'missed', 'cancelled', 'makeup_requested')
- created_at: TIMESTAMP
```

#### Payments (결제 내역)
```sql
- id: PRIMARY KEY
- user_id: FOREIGN KEY → Users.id
- subscription_id: FOREIGN KEY → Subscriptions.id
- amount: DECIMAL
- payment_method: VARCHAR
- transaction_id: VARCHAR
- status: ENUM ('pending', 'completed', 'failed', 'refunded')
- created_at: TIMESTAMP
```

#### Attendance (출석 기록)
```sql
- id: PRIMARY KEY
- class_id: FOREIGN KEY → Classes.id
- attended_by: FOREIGN KEY → Users.id (관리자가 대리 출석 시)
- attendance_time: TIMESTAMP
- location: VARCHAR (GPS 좌표 또는 장소명)
```

## 5. 개발 계획 및 우선순위

### Phase 1: 기본 시스템 구축 (8-10주)
1. **주차 1-2**: 백엔드 API 기본 구조
   - 사용자 인증 시스템
   - 기본 CRUD 작업

2. **주차 3-4**: 데이터베이스 설계 및 구현
   - 스키마 생성 및 마이그레이션
   - 기본 데이터 시딩

3. **주차 5-6**: 모바일 앱 기본 기능
   - 로그인/회원가입
   - 수업 조회 화면

4. **주차 7-8**: 출석 시스템 구현
   - 출석 체크 기능
   - 출석 이력 조회

### Phase 2: 결제 및 관리 기능 (6-8주)
1. **주차 9-10**: 결제 시스템 연동
   - 앱 내 결제 기능
   - 수강권 구매 플로우

2. **주차 11-12**: 관리자 웹 페이지
   - 관리자 대시보드
   - 수업 할당 기능

3. **주차 13-14**: 고급 기능
   - 통계 대시보드
   - 수업 취소/보강 시스템

### Phase 3: 최적화 및 배포 (4-6주)
1. **주차 15-16**: 테스트 및 버그 수정
2. **주차 17-18**: 성능 최적화 및 보안 강화
3. **주차 19-20**: 배포 및 운영 환경 설정

## 6. 주요 고려사항

### 6.1 보안
- 개인정보 암호화 저장
- API 엔드포인트 보안 (Rate Limiting, CORS 설정)
- 결제 데이터 PCI DSS 준수

### 6.2 확장성
- 마이크로서비스 아키텍처 고려 (향후 확장 시)
- 캐싱 전략 (Redis 등)
- 데이터베이스 인덱싱 최적화

### 6.3 사용자 경험
- 직관적인 UI/UX 디자인
- 오프라인 모드 지원 (제한적)
- 푸시 알림 시스템

### 6.4 운영 관리
- 로깅 및 모니터링 시스템
- 백업 및 복구 전략
- CI/CD 파이프라인 구축

## 7. 예상 비용 및 리소스

### 7.1 개발 리소스
- 백엔드 개발자: 1명 (풀타임 4-5개월)
- 모바일 앱 개발자: 1-2명 (풀타임 3-4개월)
- 웹 프론트엔드 개발자: 1명 (풀타임 2-3개월)

### 7.2 운영 비용 (월 기준)
- 서버 호스팅: $50-200
- 데이터베이스: $30-100
- 결제 시스템 수수료: 거래액의 2-3%
- 앱스토어 등록비: 연간 $100-200

## 8. 다음 단계

1. 상세 요구사항 분석 및 확정
2. UI/UX 디자인 설계
3. 개발 환경 설정
4. MVP (Minimum Viable Product) 범위 결정
5. 개발 착수

이 설계 문서는 프로젝트의 전반적인 방향을 제시하며, 개발 과정에서 세부사항은 지속적으로 업데이트될 예정입니다.