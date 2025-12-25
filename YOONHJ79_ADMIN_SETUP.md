# yoonhj79@gmail.com 관리자 계정 설정 가이드

## ✅ 완료된 작업

1. **이메일 제약조건 수정** - `yoonhj79@gmail.com` 허용
2. **회원가입 API 수정** - 관리자 이메일로 가입 가능
3. **로그인 API 수정** - 관리자 이메일로 로그인 가능
4. **SQL 스크립트 준비** - 관리자 계정 생성 스크립트

---

## 🚀 관리자 계정 생성 방법

### 방법 1: SQL 스크립트 실행 (권장)

```bash
# PostgreSQL에 접속하여 스크립트 실행
psql -U postgres -d welfare_trends -f setup_yoonhj79_admin.sql
```

**이 스크립트가 자동으로 수행하는 작업**:
- ✅ 이메일 제약조건 해제
- ✅ `yoonhj79@gmail.com` 관리자 계정 생성
- ✅ 부서: 기획예산팀 지정
- ✅ 역할: admin 설정
- ✅ 상태: approved 설정
- ✅ 새로운 이메일 제약조건 추가 (yoonhj79@gmail.com 허용)

---

### 방법 2: 웹사이트에서 회원가입 후 승급

#### 1️⃣ 회원가입
```
웹사이트: http://localhost:3000/auth/signup
이메일: yoonhj79@gmail.com
```

#### 2️⃣ PostgreSQL에서 관리자로 승급
```bash
psql -U postgres -d welfare_trends
```

```sql
-- 관리자로 승급 및 승인
UPDATE users 
SET 
    role = 'admin',
    status = 'approved',
    approved_at = NOW(),
    department_id = (SELECT id FROM departments WHERE name = '기획예산팀')
WHERE email = 'yoonhj79@gmail.com';

-- 확인
SELECT email, role, status FROM users WHERE email = 'yoonhj79@gmail.com';

\q
```

---

### 방법 3: 빠른 수동 생성 (한 줄 명령어)

```bash
psql -U postgres -d welfare_trends << 'EOF'
-- 제약조건 해제
ALTER TABLE users DROP CONSTRAINT IF EXISTS valid_email;

-- 관리자 계정 생성
INSERT INTO users (email, department_id, role, status, approved_at, created_at, updated_at)
VALUES (
    'yoonhj79@gmail.com',
    (SELECT id FROM departments WHERE name = '기획예산팀'),
    'admin',
    'approved',
    NOW(),
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    role = 'admin',
    status = 'approved',
    approved_at = NOW();

-- 제약조건 재설정
ALTER TABLE users ADD CONSTRAINT valid_email 
CHECK (email LIKE '%@gg.pass.or.kr' OR email IN ('yoonhj79@gmail.com'));

-- 확인
SELECT email, role, status FROM users WHERE email = 'yoonhj79@gmail.com';
EOF
```

---

## 🔐 로그인 방법

### 1️⃣ 웹 브라우저에서 로그인
```
URL: http://localhost:3000/auth/login
이메일: yoonhj79@gmail.com
```

### 2️⃣ API로 로그인 테스트 (curl)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"yoonhj79@gmail.com"}'
```

**성공 응답 예시**:
```json
{
  "success": true,
  "message": "로그인 성공",
  "user": {
    "id": "uuid",
    "email": "yoonhj79@gmail.com",
    "role": "admin",
    "status": "approved",
    "department_name": "기획예산팀"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 🎯 관리자 권한 확인

로그인 후 다음 기능 사용 가능:

### ✅ 접근 가능한 페이지
- 홈페이지: http://localhost:3000
- 학술정보: http://localhost:3000/academy
- 정책동향: http://localhost:3000/policy
- 사회서비스원: http://localhost:3000/social-service
- **노인보호전문기관**: http://localhost:3000/elder-protection ← 관리자 전용!
- 관리자 대시보드: http://localhost:3000/admin
- 사용자 관리: http://localhost:3000/admin/users

### ✅ 관리자 권한
- 모든 게시판 접근 (부서 제한 없음)
- 사용자 승인/거부
- 부서 배정
- 게시글 작성/수정/삭제
- 통계 및 활동 로그 확인

---

## 🔧 수정된 파일 목록

1. **lib/auth-schema.sql**
   - 이메일 제약조건 수정: `yoonhj79@gmail.com` 허용

2. **app/api/auth/signup/route.ts**
   - `ALLOWED_ADMIN_EMAILS` 배열 추가
   - 관리자 이메일로 회원가입 가능

3. **app/api/auth/login/route.ts**
   - `ALLOWED_ADMIN_EMAILS` 배열 추가
   - 관리자 이메일로 로그인 가능

4. **setup_yoonhj79_admin.sql** (새 파일)
   - 관리자 계정 자동 생성 스크립트

---

## 📊 계정 정보

```
이메일: yoonhj79@gmail.com
역할: admin (관리자)
상태: approved (승인됨)
부서: 기획예산팀
권한: 전체 시스템 접근 가능
```

---

## 🧪 테스트 시나리오

### 1. 로그인 테스트
```bash
# 로그인
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"yoonhj79@gmail.com"}'

# 결과: ✅ 성공, JWT 토큰 발급
```

### 2. 노인보호전문기관 게시판 접근 테스트
```bash
# 토큰 저장
TOKEN="<로그인_응답의_토큰>"

# 게시판 접근
curl http://localhost:3000/api/elder-protection \
  -H "Authorization: Bearer $TOKEN"

# 결과: ✅ 접근 성공 (관리자 권한)
```

### 3. 일반 게시판 접근 테스트
```bash
# 정책동향 게시판
curl http://localhost:3000/api/policy \
  -H "Authorization: Bearer $TOKEN"

# 결과: ✅ 접근 성공
```

---

## ⚠️ 주의사항

1. **비밀번호 없음**: 현재 시스템은 이메일 기반 인증만 사용합니다.
2. **JWT 토큰 유효기간**: 7일 (재로그인 시 새 토큰 발급)
3. **권한 변경 시**: 다시 로그인해야 새로운 권한 적용
4. **데이터베이스 필수**: PostgreSQL이 실행 중이어야 합니다.

---

## 🆘 문제 해결

### Q1: 로그인 시 "등록되지 않은 이메일입니다" 오류
```sql
-- 사용자가 생성되었는지 확인
psql -U postgres -d welfare_trends -c \
  "SELECT email, role, status FROM users WHERE email = 'yoonhj79@gmail.com';"

-- 사용자가 없으면 방법 1의 SQL 스크립트 실행
```

### Q2: "승인 대기 중입니다" 오류
```sql
-- 상태를 approved로 변경
psql -U postgres -d welfare_trends -c \
  "UPDATE users SET status = 'approved', approved_at = NOW() WHERE email = 'yoonhj79@gmail.com';"
```

### Q3: "관리자 권한이 필요합니다" 오류
```sql
-- role을 admin으로 변경
psql -U postgres -d welfare_trends -c \
  "UPDATE users SET role = 'admin' WHERE email = 'yoonhj79@gmail.com';"

-- 그리고 다시 로그인 (JWT 토큰 재발급)
```

---

## ✅ 최종 확인

```bash
# PostgreSQL에서 계정 확인
psql -U postgres -d welfare_trends -c \
  "SELECT u.email, u.role, u.status, d.name as department 
   FROM users u 
   LEFT JOIN departments d ON u.department_id = d.id 
   WHERE u.email = 'yoonhj79@gmail.com';"
```

**예상 결과**:
```
       email        | role  |  status  | department  
--------------------+-------+----------+-------------
 yoonhj79@gmail.com | admin | approved | 기획예산팀
```

---

**작성일**: 2025-12-25  
**버전**: 1.0.0  
**상태**: ✅ 설정 완료
