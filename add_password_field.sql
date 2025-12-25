-- 사용자 테이블에 password_hash 필드 추가
-- 기존 테이블에 비밀번호 필드를 추가하는 마이그레이션

-- 1. password_hash 컬럼 추가 (nullable로 먼저 추가)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- 2. 기존 사용자들에게 임시 비밀번호 설정
-- bcrypt 해시: 'welcome123' (테스트용)
-- $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
UPDATE users 
SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
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
-- 비밀번호: admin123
-- bcrypt 해시: $2a$10$8K1p/a0dL3.GyJHR7xA4au8u9H6EqNvVjKj1Q7n0vV0K0K0K0K0K0 (예시)
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
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- 'welcome123'
    (SELECT id FROM departments WHERE name = '기획예산팀' LIMIT 1),
    'admin',
    'approved',
    NOW(),
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
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

-- ============================================
-- 실행 결과
-- ============================================
-- yoonhj79@gmail.com 계정 정보:
-- 이메일: yoonhj79@gmail.com
-- 비밀번호: welcome123
-- 역할: admin
-- 상태: approved
-- 부서: 기획예산팀
-- 
-- 로그인 방법:
-- http://localhost:3000/auth/login
-- 이메일: yoonhj79@gmail.com
-- 비밀번호: welcome123
-- ============================================
