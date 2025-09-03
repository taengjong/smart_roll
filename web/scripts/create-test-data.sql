-- 테스트 데이터 생성 스크립트
-- 출석 체크 기능 개발을 위한 샘플 데이터

-- 1. 테스트 사용자 프로필 생성 (실제 사용자는 인증 후 자동 생성됨)
-- 임시로 직접 생성 (나중에 실제 인증으로 대체)
INSERT INTO profiles (id, email, name, role) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'student@test.com', '김학생', 'student'),
  ('550e8400-e29b-41d4-a716-446655440001', 'admin@test.com', '관리자', 'admin'),
  ('550e8400-e29b-41d4-a716-446655440002', 'student2@test.com', '이학생', 'student'),
  ('550e8400-e29b-41d4-a716-446655440003', 'student3@test.com', '박학생', 'student')
ON CONFLICT (id) DO NOTHING;

-- 2. 수강권 구매 데이터 생성
INSERT INTO subscriptions (id, user_id, course_id, purchase_date, expiry_date, remaining_classes, total_classes, status) 
SELECT 
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  c.id,
  CURRENT_DATE - INTERVAL '7 days',
  CURRENT_DATE + INTERVAL '21 days',
  8,
  12,
  'active'
FROM courses c 
WHERE c.name = '취미 보컬'
LIMIT 1;

INSERT INTO subscriptions (id, user_id, course_id, purchase_date, expiry_date, remaining_classes, total_classes, status) 
SELECT 
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440002',
  c.id,
  CURRENT_DATE - INTERVAL '5 days',
  CURRENT_DATE + INTERVAL '35 days',
  6,
  8,
  'active'
FROM courses c 
WHERE c.name = '입시 기타'
LIMIT 1;

INSERT INTO subscriptions (id, user_id, course_id, purchase_date, expiry_date, remaining_classes, total_classes, status) 
SELECT 
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440003',
  c.id,
  CURRENT_DATE - INTERVAL '3 days',
  CURRENT_DATE + INTERVAL '25 days',
  10,
  12,
  'active'
FROM courses c 
WHERE c.name = '피아노 초급'
LIMIT 1;

-- 3. 수업 일정 생성
-- 오늘과 내일, 어제 수업 생성
WITH subscription_data AS (
  SELECT s.id as subscription_id, p.name as student_name, c.name as course_name
  FROM subscriptions s
  JOIN profiles p ON s.user_id = p.id
  JOIN courses c ON s.course_id = c.id
  WHERE p.role = 'student'
)
INSERT INTO classes (subscription_id, scheduled_date, scheduled_time, status, created_at) 
SELECT 
  subscription_id,
  CURRENT_DATE - 1,  -- 어제
  '14:00'::time,
  'attended',
  NOW() - INTERVAL '1 day'
FROM subscription_data
WHERE student_name = '김학생';

-- 오늘 수업 (출석 체크 대상)
WITH subscription_data AS (
  SELECT s.id as subscription_id, p.name as student_name, c.name as course_name
  FROM subscriptions s
  JOIN profiles p ON s.user_id = p.id
  JOIN courses c ON s.course_id = c.id
  WHERE p.role = 'student'
)
INSERT INTO classes (subscription_id, scheduled_date, scheduled_time, status) 
SELECT 
  subscription_id,
  CURRENT_DATE,  -- 오늘
  '14:00'::time,
  'scheduled'
FROM subscription_data
WHERE student_name = '김학생';

-- 다른 학생들의 오늘 수업
WITH subscription_data AS (
  SELECT s.id as subscription_id, p.name as student_name, c.name as course_name
  FROM subscriptions s
  JOIN profiles p ON s.user_id = p.id
  JOIN courses c ON s.course_id = c.id
  WHERE p.role = 'student'
)
INSERT INTO classes (subscription_id, scheduled_date, scheduled_time, status) 
SELECT 
  subscription_id,
  CURRENT_DATE,
  '16:00'::time,
  'scheduled'
FROM subscription_data
WHERE student_name = '이학생'

UNION ALL

SELECT 
  subscription_id,
  CURRENT_DATE,
  '18:00'::time,
  'scheduled'
FROM subscription_data
WHERE student_name = '박학생';

-- 내일 수업
WITH subscription_data AS (
  SELECT s.id as subscription_id, p.name as student_name, c.name as course_name
  FROM subscriptions s
  JOIN profiles p ON s.user_id = p.id
  JOIN courses c ON s.course_id = c.id
  WHERE p.role = 'student'
)
INSERT INTO classes (subscription_id, scheduled_date, scheduled_time, status) 
SELECT 
  subscription_id,
  CURRENT_DATE + 1,  -- 내일
  '14:00'::time,
  'scheduled'
FROM subscription_data
WHERE student_name = '김학생'

UNION ALL

SELECT 
  subscription_id,
  CURRENT_DATE + 1,
  '16:00'::time,
  'scheduled'
FROM subscription_data
WHERE student_name = '이학생';

-- 4. 지난 주 출석 이력 생성
WITH subscription_data AS (
  SELECT s.id as subscription_id, p.name as student_name
  FROM subscriptions s
  JOIN profiles p ON s.user_id = p.id
  WHERE p.role = 'student'
)
INSERT INTO classes (subscription_id, scheduled_date, scheduled_time, status, attended_at) 
SELECT 
  subscription_id,
  CURRENT_DATE - (i + 3),
  '14:00'::time,
  CASE WHEN random() > 0.2 THEN 'attended' ELSE 'missed' END,
  CASE WHEN random() > 0.2 THEN NOW() - INTERVAL '1 day' * (i + 3) ELSE NULL END
FROM subscription_data, generate_series(0, 4) as i
WHERE student_name IN ('김학생', '이학생', '박학생');

-- 5. 확인 쿼리
SELECT 
  p.name as student_name,
  c.name as course_name,
  s.remaining_classes,
  s.total_classes,
  COUNT(cl.*) as total_scheduled_classes,
  COUNT(CASE WHEN cl.status = 'attended' THEN 1 END) as attended_classes
FROM profiles p
JOIN subscriptions s ON p.id = s.user_id
JOIN courses c ON s.course_id = c.id
LEFT JOIN classes cl ON s.id = cl.subscription_id
WHERE p.role = 'student'
GROUP BY p.name, c.name, s.remaining_classes, s.total_classes
ORDER BY p.name;