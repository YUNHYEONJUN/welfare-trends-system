-- yoonhj79@gmail.com을 관리자로 설정하는 SQL 스크립트
-- 이메일 제약조건을 임시로 해제하고 관리자 계정 생성

-- ============================================
-- 1단계: 이메일 제약조건 확인
-- ============================================
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'users'::regclass
AND conname = 'valid_email';

-- ============================================
-- 2단계: 이메일 제약조건 삭제 (임시)
-- ============================================
ALTER TABLE users DROP CONSTRAINT IF EXISTS valid_email;

-- ============================================
-- 3단계: 기존 사용자 확인
-- ============================================
SELECT 
    id, 
    email, 
    role, 
    status
FROM users 
WHERE email = 'yoonhj79@gmail.com';

-- ============================================
-- 4단계: 관리자 계정 생성
-- ============================================

-- 4-A: 사용자가 이미 존재하는 경우 관리자로 승급
UPDATE users 
SET 
    role = 'admin',
    status = 'approved',
    approved_at = NOW(),
    updated_at = NOW(),
    department_id = (SELECT id FROM departments WHERE name = '기획예산팀' LIMIT 1)
WHERE email = 'yoonhj79@gmail.com'
RETURNING id, email, role, status;

-- 4-B: 사용자가 없는 경우 새로 생성
INSERT INTO users (
    email,
    department_id,
    role,
    status,
    approved_at,
    created_at,
    updated_at
)
SELECT
    'yoonhj79@gmail.com',
    (SELECT id FROM departments WHERE name = '기획예산팀' LIMIT 1),
    'admin',
    'approved',
    NOW(),
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'yoonhj79@gmail.com'
)
RETURNING id, email, role, status;

-- ============================================
-- 5단계: 새로운 이메일 제약조건 추가 (관리자 이메일 허용)
-- ============================================
-- @gg.pass.or.kr 또는 특정 관리자 이메일만 허용
ALTER TABLE users 
ADD CONSTRAINT valid_email 
CHECK (
    email LIKE '%@gg.pass.or.kr' 
    OR email IN ('yoonhj79@gmail.com')
);

-- ============================================
-- 6단계: 최종 확인
-- ============================================
SELECT 
    u.id,
    u.email,
    u.role,
    u.status,
    d.name as department_name,
    u.approved_at,
    u.created_at
FROM users u
LEFT JOIN departments d ON u.department_id = d.id
WHERE u.email = 'yoonhj79@gmail.com';

-- ============================================
-- 7단계: 모든 관리자 목록 확인
-- ============================================
SELECT 
    u.email,
    u.role,
    u.status,
    d.name as department_name
FROM users u
LEFT JOIN departments d ON u.department_id = d.id
WHERE u.role = 'admin'
ORDER BY u.created_at;

-- ============================================
-- 실행 결과 요약
-- ============================================
-- 이메일: yoonhj79@gmail.com
-- 역할: admin
-- 상태: approved
-- 부서: 기획예산팀
-- 
-- 이제 http://localhost:3000/auth/login 에서
-- yoonhj79@gmail.com 으로 로그인하면 관리자 권한으로 접속됩니다.
-- ============================================
