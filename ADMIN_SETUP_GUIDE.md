# 관리자 설정 가이드

## 📋 관리자 계정 생성 방법

관리자는 일반 사용자처럼 회원가입 후, 데이터베이스에서 직접 권한을 변경해야 합니다.

---

## 🚀 방법 1: 새로운 관리자 계정 생성 (권장)

### 1단계: 회원가입
```
웹사이트 접속: http://localhost:3000/auth/signup
이메일 입력: admin@gg.pass.or.kr
```

### 2단계: 데이터베이스에서 관리자 권한 부여
```sql
-- PostgreSQL에 접속
psql -U postgres -d welfare_trends

-- 1. 사용자 조회 (이메일로 찾기)
SELECT id, email, role, status, department_id 
FROM users 
WHERE email = 'admin@gg.pass.or.kr';

-- 2. 관리자 권한 부여 및 승인
UPDATE users 
SET role = 'admin',
    status = 'approved',
    approved_at = NOW()
WHERE email = 'admin@gg.pass.or.kr';

-- 3. 부서 지정 (선택사항 - 기획예산팀 예시)
UPDATE users 
SET department_id = (
    SELECT id FROM departments WHERE name = '기획예산팀'
)
WHERE email = 'admin@gg.pass.or.kr';

-- 4. 결과 확인
SELECT u.id, u.email, u.role, u.status, d.name as department_name
FROM users u
LEFT JOIN departments d ON u.department_id = d.id
WHERE u.email = 'admin@gg.pass.or.kr';
```

### 3단계: 로그인
```
웹사이트 접속: http://localhost:3000/auth/login
이메일 입력: admin@gg.pass.or.kr
```

**결과**: 관리자로 로그인되며, 모든 게시판에 접근 가능합니다.

---

## 🔧 방법 2: 기존 사용자를 관리자로 승급

기존 일반 사용자를 관리자로 변경하는 경우:

```sql
-- PostgreSQL에 접속
psql -U postgres -d welfare_trends

-- 특정 사용자를 관리자로 변경
UPDATE users 
SET role = 'admin'
WHERE email = 'kim.worker@gg.pass.or.kr';

-- 확인
SELECT email, role, status, department_name
FROM users u
LEFT JOIN departments d ON u.department_id = d.id
WHERE u.email = 'kim.worker@gg.pass.or.kr';
```

---

## 🛠️ 방법 3: SQL로 직접 관리자 계정 생성 (빠른 방법)

회원가입 없이 데이터베이스에서 직접 생성:

```sql
-- PostgreSQL에 접속
psql -U postgres -d welfare_trends

-- 1. 부서 ID 조회
SELECT id, name FROM departments WHERE name = '기획예산팀';

-- 2. 관리자 계정 직접 생성
INSERT INTO users (
    email,
    department_id,
    role,
    status,
    approved_at,
    created_at,
    updated_at
)
VALUES (
    'admin@gg.pass.or.kr',
    (SELECT id FROM departments WHERE name = '기획예산팀'),
    'admin',
    'approved',
    NOW(),
    NOW(),
    NOW()
);

-- 3. 생성된 관리자 확인
SELECT u.id, u.email, u.role, u.status, d.name as department_name
FROM users u
LEFT JOIN departments d ON u.department_id = d.id
WHERE u.email = 'admin@gg.pass.or.kr';
```

---

## 📊 관리자 권한 확인

### API 테스트로 확인
```bash
# 1. 로그인
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gg.pass.or.kr"}'

# 응답 예시:
# {
#   "success": true,
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "user": {
#     "role": "admin",  <-- 관리자 확인
#     "department_name": "기획예산팀"
#   }
# }

# 2. 토큰으로 노인보호전문기관 게시판 접근 (관리자는 접근 가능해야 함)
curl http://localhost:3000/api/elder-protection \
  -H "Authorization: Bearer <토큰>"

# 성공 응답: { "success": true, "data": [...] }
```

---

## 🎯 관리자 vs 일반 사용자 차이

| 기능 | 일반 사용자 (user) | 관리자 (admin) |
|------|------------------|---------------|
| 학술정보 게시판 | ✅ 접근 가능 | ✅ 접근 가능 |
| 정책동향 게시판 | ✅ 접근 가능 | ✅ 접근 가능 |
| 사회서비스원 게시판 | ✅ 접근 가능 | ✅ 접근 가능 |
| **노인보호전문기관 게시판** | ❌ 부서 제한 | ✅ **전체 접근** |
| 사용자 관리 | ❌ 불가 | ✅ 가능 |
| 게시글 작성 | ❌ 제한적 | ✅ 전체 가능 |
| 통계 대시보드 | ❌ 불가 | ✅ 가능 |

---

## 🔒 보안 권장사항

### 1. 관리자 이메일 규칙
- `admin@gg.pass.or.kr` - 최고 관리자
- `manager.NAME@gg.pass.or.kr` - 부서 관리자
- `admin.DEPARTMENT@gg.pass.or.kr` - 특정 부서 관리자

### 2. 관리자 계정 수 제한
```sql
-- 현재 관리자 수 확인
SELECT COUNT(*) as admin_count 
FROM users 
WHERE role = 'admin' AND status = 'approved';

-- 관리자 목록 조회
SELECT email, department_name, created_at
FROM users u
LEFT JOIN departments d ON u.department_id = d.id
WHERE u.role = 'admin'
ORDER BY created_at DESC;
```

### 3. 관리자 활동 로그 확인
```sql
-- 관리자 활동 기록 조회
SELECT 
    u.email,
    aa.action,
    aa.details,
    aa.created_at
FROM admin_activities aa
JOIN users u ON aa.admin_id = u.id
ORDER BY aa.created_at DESC
LIMIT 20;
```

---

## 📝 실습 예제: 완전한 관리자 설정 과정

```bash
# 1. PostgreSQL 접속
psql -U postgres -d welfare_trends

# 2. 관리자 계정 생성 (복사해서 실행)
INSERT INTO users (email, department_id, role, status, approved_at, created_at, updated_at)
VALUES (
    'admin@gg.pass.or.kr',
    (SELECT id FROM departments WHERE name = '기획예산팀'),
    'admin',
    'approved',
    NOW(),
    NOW(),
    NOW()
);

# 3. 확인
SELECT u.email, u.role, u.status, d.name as department_name
FROM users u
LEFT JOIN departments d ON u.department_id = d.id
WHERE u.email = 'admin@gg.pass.or.kr';

# 예상 결과:
#        email         | role  | status   | department_name
# ---------------------+-------+----------+----------------
#  admin@gg.pass.or.kr | admin | approved | 기획예산팀

# 4. PostgreSQL 종료
\q
```

```bash
# 5. 웹 브라우저에서 로그인 테스트
# http://localhost:3000/auth/login
# 이메일: admin@gg.pass.or.kr

# 6. 노인보호전문기관 게시판 접근 테스트
# http://localhost:3000/elder-protection
# 결과: ✅ 접근 가능 (관리자 권한)
```

---

## 🆘 문제 해결

### Q1: 로그인은 되는데 관리자 권한이 없어요
```sql
-- role 확인 및 수정
UPDATE users 
SET role = 'admin'
WHERE email = 'admin@gg.pass.or.kr';
```

### Q2: "승인 대기 중입니다" 메시지가 나와요
```sql
-- status 승인으로 변경
UPDATE users 
SET status = 'approved', approved_at = NOW()
WHERE email = 'admin@gg.pass.or.kr';
```

### Q3: 관리자인데 노인보호전문기관 게시판에 접근할 수 없어요
- JWT 토큰을 새로 발급받으세요 (다시 로그인)
- 토큰에는 이전 role 정보가 담겨있어, 권한 변경 후 재로그인 필요

### Q4: 부서가 NULL로 표시돼요
```sql
-- 부서 지정
UPDATE users 
SET department_id = (SELECT id FROM departments WHERE name = '기획예산팀')
WHERE email = 'admin@gg.pass.or.kr';
```

---

## 🎓 참고 코드

### JWT 토큰에 담기는 관리자 정보
```typescript
// lib/auth-middleware.ts
interface AuthUser {
  id: string;
  email: string;
  department_id: string;
  department_name: string;
  role: 'user' | 'admin';  // <-- 이 값이 'admin'이면 관리자
  status: 'approved';
}
```

### 관리자 권한 확인 로직
```typescript
// lib/auth-middleware.ts
export function hasElderProtectionAccess(user: AuthUser): boolean {
  // 관리자는 무조건 접근 가능
  if (user.role === 'admin') {
    return true;
  }

  // 일반 사용자는 부서 확인
  return user.department_name === '경기북서부노인보호전문기관';
}
```

---

## ✅ 빠른 설정 요약

```bash
# 1. PostgreSQL 접속
psql -U postgres -d welfare_trends

# 2. 관리자 생성 (한 줄 명령어)
INSERT INTO users (email, department_id, role, status, approved_at, created_at, updated_at) VALUES ('admin@gg.pass.or.kr', (SELECT id FROM departments WHERE name = '기획예산팀'), 'admin', 'approved', NOW(), NOW(), NOW());

# 3. 확인
SELECT email, role, status FROM users WHERE email = 'admin@gg.pass.or.kr';

# 4. 종료
\q

# 5. 로그인
# http://localhost:3000/auth/login
```

---

**작성일**: 2025-12-25  
**버전**: 1.0.0  
**문의**: 시스템 관리자
