\set ON_ERROR_STOP on
BEGIN;

-- 사용자 테이블에 password_hash 필드 추가
-- 기존 테이블에 비밀번호 필드를 추가하는 마이그레이션

-- 1. password_hash 컬럼 추가 (nullable로 먼저 추가)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- 2. 기존 사용자들에게 임시 비밀번호 설정
-- 기존 사용자용 임시 해시는 실행 전에 별도 생성
-- psql 변수 existing_user_password_hash 필요
UPDATE users 
SET password_hash = :'existing_user_password_hash'
WHERE password_hash IS NULL;

-- 3. password_hash를 NOT NULL로 변경
ALTER TABLE users 
ALTER COLUMN password_hash SET NOT NULL;

-- 4. 확인
SELECT 
    email, 
    role, 
    status,
    CASE 
        WHEN password_hash IS NOT NULL THEN '설정됨' 
        ELSE '미설정' 
    END as password_status
FROM users;

-- ============================================
-- 참고: yoonhj79@gmail.com 관리자 계정 생성
-- ============================================

-- 먼저 이메일 제약조건 해제 (이미 되어있으면 스킵)
ALTER TABLE users DROP CONSTRAINT IF EXISTS valid_email;

-- yoonhj79@gmail.com 관리자 계정 생성
-- 비밀번호: YOUR_UNIQUE_ADMIN_PASSWORD
-- psql 변수 admin_password_hash 필요
INSERT INTO users (
    email,
    password_hash,
    department_id,
    role,
    status,
    approved_at,
    created_at,
    updated_at
)
VALUES (
    'yoonhj79@gmail.com',
    :'admin_password_hash', -- supplied privately
    (SELECT id FROM departments WHERE name = '기획예산팀' LIMIT 1),
    'admin',
    'approved',
    NOW(),
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    role = 'admin',
    status = 'approved',
    approved_at = NOW(),
    updated_at = NOW();

-- 이메일 제약조건 재설정
ALTER TABLE users 
ADD CONSTRAINT valid_email 
CHECK (
    email LIKE '%@gg.pass.or.kr' 
    OR email IN ('yoonhj79@gmail.com')
);

-- 최종 확인
SELECT 
    u.email,
    u.role,
    u.status,
    d.name as department_name,
    CASE 
        WHEN u.password_hash IS NOT NULL THEN '✓ 설정됨' 
        ELSE '✗ 미설정' 
    END as password_status,
    u.created_at
FROM users u
LEFT JOIN departments d ON u.department_id = d.id
ORDER BY u.created_at DESC;

COMMIT;

-- ============================================
-- 실행 결과
-- ============================================
-- yoonhj79@gmail.com 계정 정보:
-- 이메일: yoonhj79@gmail.com
-- 비밀번호: YOUR_ADMIN_PASSWORD
-- 역할: admin
-- 상태: approved
-- 부서: 기획예산팀
-- 
-- 로그인 방법:
-- http://localhost:3000/auth/login
-- 이메일: yoonhj79@gmail.com
-- 비밀번호: YOUR_ADMIN_PASSWORD
-- ============================================
