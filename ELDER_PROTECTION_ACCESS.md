# 노인보호전문기관 게시판 접근 제한 구현 완료 ✅

## 📌 구현 개요

**경기북서부노인보호전문기관 직원만** 노인보호전문기관 게시판에 접근할 수 있도록 제한했습니다.

---

## 🎯 핵심 기능

### 1. **접근 권한 설정**
- ✅ **경기북서부노인보호전문기관 직원**: 접근 허용
- ❌ **다른 부서 직원**: 접근 거부
- ✅ **관리자**: 모든 게시판 접근 가능

### 2. **보안 인증**
- JWT 토큰 기반 인증
- 7일 유효 토큰
- 로그인 시 자동 발급

### 3. **활동 기록**
- 모든 게시판 접근 자동 로그
- 사용자별 활동 통계
- IP 주소 및 User Agent 기록

---

## 🏗️ 시스템 구조

```
┌─────────────────┐
│   사용자 로그인   │
│ @gg.pass.or.kr  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  JWT 토큰 발급   │
│ (7일 유효)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  게시판 접근      │
│  /elder-        │
│  protection     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  권한 확인       │
│  부서명 검증     │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌──────┐  ┌──────┐
│ 허용 │  │ 거부 │
└──────┘  └──────┘
```

---

## 📝 사용 방법

### 1단계: 회원가입 및 승인

```bash
# 1. 회원가입
이메일: kim.worker@gg.pass.or.kr

# 2. 관리자가 승인 및 부서 지정
부서: 경기북서부노인보호전문기관
상태: approved
```

### 2단계: 로그인

```bash
# 로그인 API 호출
POST /api/auth/login
{
  "email": "kim.worker@gg.pass.or.kr"
}

# 응답 (JWT 토큰 포함)
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "department_name": "경기북서부노인보호전문기관"
  }
}
```

### 3단계: 게시판 접근

```bash
# 게시판 API 호출 (JWT 토큰 필수)
GET /api/elder-protection
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 성공 응답
{
  "success": true,
  "data": [게시글 목록]
}

# 실패 응답 (다른 부서)
{
  "success": false,
  "message": "경기북서부노인보호전문기관 직원만 접근 가능합니다."
}
```

---

## 🔐 보안 기능

### JWT 토큰 구조
```json
{
  "id": "user-uuid",
  "email": "kim.worker@gg.pass.or.kr",
  "department_id": "dept-uuid",
  "department_name": "경기북서부노인보호전문기관",
  "role": "user",
  "status": "approved",
  "iat": 1640000000,
  "exp": 1640604800
}
```

### 권한 확인 프로세스
1. **토큰 검증**: JWT 서명 및 만료 시간 확인
2. **사용자 상태**: `approved` 상태만 허용
3. **부서 확인**: 
   - 경기북서부노인보호전문기관 ✅
   - 관리자 (role: admin) ✅
   - 기타 ❌

---

## 🧪 테스트 결과

### ✅ 테스트 1: 경기북서부노인보호전문기관 직원
```
부서: 경기북서부노인보호전문기관
역할: user
결과: ✅ 접근 허용
```

### ❌ 테스트 2: 경기북부노인보호전문기관 직원
```
부서: 경기북부노인보호전문기관
역할: user
결과: ❌ 접근 거부
메시지: "경기북서부노인보호전문기관 직원만 접근 가능합니다."
```

### ✅ 테스트 3: 관리자
```
부서: 기획예산팀
역할: admin
결과: ✅ 접근 허용 (관리자 특권)
```

---

## 📁 주요 파일

| 파일 | 설명 |
|------|------|
| `lib/auth-middleware.ts` | JWT 인증 및 권한 확인 미들웨어 |
| `lib/db.ts` | PostgreSQL 연결 및 데이터 쿼리 |
| `app/api/elder-protection/route.ts` | 노인보호전문기관 게시판 API |
| `app/elder-protection/page.tsx` | 게시판 프론트엔드 페이지 |
| `ACCESS_CONTROL_GUIDE.md` | 전체 시스템 가이드 문서 |

---

## 🚀 다음 단계

### 데이터베이스 설정
```bash
# 1. PostgreSQL 설치
sudo apt-get install postgresql

# 2. 데이터베이스 생성
createdb welfare_trends

# 3. 스키마 적용
psql welfare_trends -f lib/auth-schema.sql
psql welfare_trends -f lib/db-schema.sql

# 4. 환경 변수 설정
echo "DATABASE_URL=postgresql://localhost/welfare_trends" >> .env.local
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env.local
```

### 서버 실행
```bash
npm run dev
```

### 접속 URL
- 홈페이지: http://localhost:3000
- 로그인: http://localhost:3000/auth/login
- 노인보호전문기관 게시판: http://localhost:3000/elder-protection

---

## 📊 활동 로그 예시

```sql
-- 경기북서부노인보호전문기관 게시판 접근 로그
SELECT 
  u.email,
  u.department_name,
  ua.activity_type,
  ua.created_at
FROM user_activities ua
JOIN users u ON ua.user_id = u.id
WHERE ua.activity_type = 'view_elder_protection'
ORDER BY ua.created_at DESC
LIMIT 10;
```

---

## 🔄 확장 가능성

### 다른 노인보호전문기관 게시판 추가
각 노인보호전문기관별로 별도 게시판 생성 가능:

```typescript
// 경기북부노인보호전문기관 게시판
export function requireGyeonggiNorthElderProtection(request: NextRequest) {
  // ...
  const ALLOWED_DEPARTMENT = '경기북부노인보호전문기관';
  // ...
}

// 경기동부노인보호전문기관 게시판
export function requireGyeonggiEastElderProtection(request: NextRequest) {
  // ...
  const ALLOWED_DEPARTMENT = '경기동부노인보호전문기관';
  // ...
}
```

---

## 💡 주요 특징

✅ **간단한 사용법**: 로그인 후 자동으로 권한 확인  
✅ **강력한 보안**: JWT 토큰 + 부서별 접근 제어  
✅ **확장 가능**: 다른 게시판도 쉽게 추가 가능  
✅ **활동 추적**: 모든 접근 자동 로그 기록  
✅ **관리자 전권**: 관리자는 모든 게시판 접근 가능  

---

## 📞 문의

시스템 관련 문의사항은 관리자에게 연락하세요.

**구현일**: 2025-12-25  
**버전**: 1.0.0  
**상태**: ✅ 완료 및 커밋됨
