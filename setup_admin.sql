-- yoonhj79@gmail.com을 관리자로 설정하는 SQL 스크립트

-- 1. 먼저 해당 이메일로 가입된 사용자가 있는지 확인
SELECT 
    id, 
    email, 
    role, 
    status, 
    department_id,
    created_at
FROM users 
WHERE email = 'yoonhj79@gmail.com';

-- 2-A. 사용자가 이미 존재하는 경우: 관리자로 승급
UPDATE users 
SET 
    role = 'admin',
    status = 'approved',
    approved_at = NOW(),
    updated_at = NOW(),
    department_id = (SELECT id FROM departments WHERE name = '기획예산팀' LIMIT 1)
WHERE email = 'yoonhj79@gmail.com';

-- 2-B. 사용자가 없는 경우: 새로 생성 (이메일이 @gg.pass.or.kr이 아니므로 제약조건 임시 해제 필요)
-- 먼저 제약조건 확인
\d users

-- 이메일 제약조건을 우회하기 위해 직접 삽입 시도
-- 참고: 실제로는 이메일 도메인 제약이 있어 실패할 수 있습니다
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
);

-- 3. 최종 확인
SELECT 
    u.id,
    u.email,
    u.role,
    u.status,
    d.name as department_name,
    u.approved_at
FROM users u
LEFT JOIN departments d ON u.department_id = d.id
WHERE u.email = 'yoonhj79@gmail.com';
