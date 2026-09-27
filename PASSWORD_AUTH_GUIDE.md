# 비밀번호 인증 시스템 가이드

## 🔐 개요

이제 시스템은 **이메일 + 비밀번호** 인증을 사용합니다.

---

## 📋 yoonhj79@gmail.com 관리자 계정

### 계정 정보
```
이메일: yoonhj79@gmail.com
비밀번호: YOUR_ADMIN_PASSWORD
역할: admin (관리자)
```

### 로그인 방법

#### 1️⃣ 웹 브라우저
```
URL: http://localhost:3000/auth/login
이메일: yoonhj79@gmail.com
비밀번호: YOUR_ADMIN_PASSWORD
```

#### 2️⃣ API (curl)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "yoonhj79@gmail.com",
    "password": "YOUR_ADMIN_PASSWORD"
  }'
```

---

## 🚀 데이터베이스 설정

### 방법 1: 자동 스크립트 실행 (권장 ⭐)
```bash
# password_hash 필드 추가 + yoonhj79@gmail.com 계정 생성
psql -U postgres -d welfare_trends -f add_password_field.sql
```

### 방법 2: 수동 설정
```bash
psql -U postgres -d welfare_trends
```

```sql
-- 1. password_hash 컬럼 추가
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- 2. yoonhj79@gmail.com 관리자 생성
-- 비밀번호: YOUR_ADMIN_PASSWORD (bcrypt 해시)
ALTER TABLE users DROP CONSTRAINT IF EXISTS valid_email;

INSERT INTO users (email, password_hash, department_id, role, status, approved_at, created_at, updated_at)
VALUES (
    'yoonhj79@gmail.com',
    :'admin_password_hash',
    (SELECT id FROM departments WHERE name = '기획예산팀'),
    'admin',
    'approved',
    NOW(),
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    role = 'admin',
    status = 'approved';

ALTER TABLE users ADD CONSTRAINT valid_email 
CHECK (email LIKE '%@gg.pass.or.kr' OR email IN ('yoonhj79@gmail.com'));

-- 3. password_hash를 필수로 변경
ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL;

-- 4. 확인
SELECT email, role, status FROM users WHERE email = 'yoonhj79@gmail.com';

\q
```

---

## 🆕 회원가입 방법

### 웹 브라우저에서 회원가입
```
URL: http://localhost:3000/auth/signup
이메일: your.name@gg.pass.or.kr
비밀번호: (최소 6자)
```

### API로 회원가입
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "kim.worker@gg.pass.or.kr",
    "password": "mypassword123"
  }'
```

**응답**:
```json
{
  "success": true,
  "message": "가입 신청이 완료되었습니다. 관리자 승인 후 이용 가능합니다.",
  "user": {
    "email": "kim.worker@gg.pass.or.kr",
    "status": "pending"
  }
}
```

---

## 🔑 비밀번호 규칙

- **최소 길이**: 6자 이상
- **권장**: 8자 이상, 영문+숫자+특수문자 조합
- **저장**: bcrypt 해시로 안전하게 암호화

---

## 👤 관리자가 사용자 승인하는 방법

### 1. PostgreSQL에서 승인
```sql
-- 사용자 목록 확인
SELECT email, status, created_at 
FROM users 
WHERE status = 'pending'
ORDER BY created_at DESC;

-- 승인 및 부서 배정
UPDATE users 
SET 
    status = 'approved',
    approved_at = NOW(),
    department_id = (SELECT id FROM departments WHERE name = '경기북서부노인보호전문기관')
WHERE email = 'kim.worker@gg.pass.or.kr';
```

### 2. 관리자 웹 페이지에서 승인 (개발 예정)
```
URL: http://localhost:3000/admin/users
로그인: yoonhj79@gmail.com / YOUR_ADMIN_PASSWORD
```

---

## 🔐 비밀번호 변경 방법

### PostgreSQL에서 직접 변경
```sql
-- 새 비밀번호 해시 생성 (Node.js)
-- node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('새비밀번호', 10, (e,h) => console.log(h));"

-- 비밀번호 업데이트
UPDATE users 
SET password_hash = '<새로운_bcrypt_해시>'
WHERE email = 'yoonhj79@gmail.com';
```

### 비밀번호 해시 생성 도구
```bash
# Node.js로 bcrypt 해시 생성
node << 'EOF'
const bcrypt = require('bcryptjs');
const password = process.env.ADMIN_PASSWORD;
bcrypt.hash(password, 10, (err, hash) => {
    if (err) throw err;
    console.log('비밀번호:', password);
    console.log('해시:', hash);
});
EOF
```

---

## 🧪 테스트 시나리오

### 1. 관리자 로그인 테스트
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"yoonhj79@gmail.com","password":"YOUR_ADMIN_PASSWORD"}'
```

**예상 결과**: ✅ 성공, JWT 토큰 발급

### 2. 잘못된 비밀번호 테스트
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"yoonhj79@gmail.com","password":"wrongpassword"}'
```

**예상 결과**: ❌ 401 Unauthorized

### 3. 회원가입 후 로그인 테스트
```bash
# 1. 회원가입
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test.user@gg.pass.or.kr","password":"test123"}'

# 2. 관리자가 승인 (PostgreSQL)
psql -U postgres -d welfare_trends -c \
  "UPDATE users SET status='approved' WHERE email='test.user@gg.pass.or.kr';"

# 3. 로그인
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test.user@gg.pass.or.kr","password":"test123"}'
```

---

## 📊 변경된 파일 목록

1. **lib/auth-schema.sql**
   - `password_hash VARCHAR(255) NOT NULL` 필드 추가

2. **app/api/auth/signup/route.ts**
   - `password` 파라미터 추가
   - bcrypt 해시 생성

3. **app/api/auth/login/route.ts**
   - `password` 파라미터 추가
   - DB의 `password_hash`와 bcrypt.compare로 비밀번호 검증

4. **add_password_field.sql** (새 파일)
   - 마이그레이션 스크립트

---

## 🔒 보안 기능

- ✅ **bcrypt 해시**: 비밀번호를 암호화하여 저장
- ✅ **Salt 라운드**: 10라운드 (충분히 안전)
- ✅ **평문 저장 안 함**: 비밀번호 원문은 절대 저장하지 않음
- ✅ **타이밍 공격 방지**: bcrypt.compare 사용
- ✅ **최소 길이 검증**: 6자 이상

---

## ⚠️ 주의사항

1. **비밀번호 입력**: `YOUR_ADMIN_PASSWORD`는 자리표시자입니다. 실제 비밀번호는 공개 문서에 적지 마세요.
2. **로그인 검증**: 현재 로그인 API는 DB의 `password_hash`를 bcrypt.compare로 대조합니다.
3. **비밀번호 재설정**: 아직 비밀번호 재설정 기능이 없습니다. 관리자가 SQL로 직접 변경해야 합니다.

---

## 🆘 문제 해결

### Q1: "이메일 또는 비밀번호가 올바르지 않습니다" 오류
- 비밀번호 확인: `YOUR_ADMIN_PASSWORD`
- 이메일 확인: `yoonhj79@gmail.com`
- DB 계정 존재 확인:
  ```sql
  SELECT email, role, status FROM users WHERE email = 'yoonhj79@gmail.com';
  ```

### Q2: "비밀번호는 최소 6자 이상이어야 합니다" 오류
- 비밀번호를 6자 이상으로 입력하세요

### Q3: password_hash 컬럼이 없다는 오류
- 마이그레이션 스크립트 실행:
  ```bash
  psql -U postgres -d welfare_trends -f add_password_field.sql
  ```

---

## ✅ 최종 확인

```bash
# 1. DB 스키마 확인
psql -U postgres -d welfare_trends -c "\d users"

# 2. yoonhj79@gmail.com 계정 확인
psql -U postgres -d welfare_trends -c \
  "SELECT email, role, status FROM users WHERE email = 'yoonhj79@gmail.com';"

# 3. 로그인 테스트
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"yoonhj79@gmail.com","password":"YOUR_ADMIN_PASSWORD"}'
```

**예상 결과**:
```
email: yoonhj79@gmail.com
role: admin
status: approved
비밀번호: YOUR_ADMIN_PASSWORD
```

---

**작성일**: 2025-12-25  
**버전**: 2.0.0 (비밀번호 인증 추가)  
**상태**: ✅ 설정 완료
