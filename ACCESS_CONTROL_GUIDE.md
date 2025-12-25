# 게시판 접근 제한 시스템 가이드

## 📋 목차
1. [개요](#개요)
2. [접근 권한 구조](#접근-권한-구조)
3. [구현 내용](#구현-내용)
4. [데이터베이스 설정](#데이터베이스-설정)
5. [API 사용법](#api-사용법)
6. [프론트엔드 연동](#프론트엔드-연동)
7. [테스트 시나리오](#테스트-시나리오)

---

## 개요

### 🎯 목적
경기북서부노인보호전문기관 직원들만 전용 게시판에 접근할 수 있도록 제한하는 시스템입니다.

### ✅ 주요 기능
- **JWT 토큰 기반 인증**: 안전한 토큰 인증 시스템
- **부서별 접근 제어**: 특정 부서 직원만 게시판 접근 가능
- **관리자 전체 접근**: 관리자는 모든 게시판 열람 가능
- **활동 로그 기록**: 모든 접근 및 활동 자동 기록

---

## 접근 권한 구조

### 게시판별 접근 권한

| 게시판 | 접근 권한 | 설명 |
|--------|----------|------|
| 학술정보 (`/academy`) | 전체 직원 | 모든 경기도사회서비스원 직원 |
| 정책동향 (`/policy`) | 전체 직원 | 모든 경기도사회서비스원 직원 |
| 사회서비스원 (`/social-service`) | 전체 직원 | 모든 경기도사회서비스원 직원 |
| **노인보호전문기관 (`/elder-protection`)** | **경기북서부노인보호전문기관만** | **해당 기관 직원 + 관리자** |

### 권한 레벨

```typescript
interface AuthUser {
  id: string;
  email: string;
  department_id: string;
  department_name: string;  // 예: '경기북서부노인보호전문기관'
  role: 'user' | 'admin';   // user: 일반 직원, admin: 관리자
  status: 'approved';        // 승인된 사용자만 로그인 가능
}
```

---

## 구현 내용

### 📁 파일 구조

```
welfare-trends/
├── lib/
│   ├── auth-middleware.ts    # 인증 미들웨어 (JWT 검증, 권한 확인)
│   └── db.ts                  # 데이터베이스 헬퍼 함수
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── login/
│   │   │       └── route.ts   # 로그인 API (JWT 토큰 발급)
│   │   └── elder-protection/
│   │       └── route.ts       # 노인보호전문기관 게시판 API
│   └── elder-protection/
│       └── page.tsx           # 노인보호전문기관 게시판 페이지
└── lib/db-schema.sql          # 데이터베이스 스키마 (접근 제어 필드 추가)
```

### 🔐 인증 미들웨어 (`lib/auth-middleware.ts`)

#### 주요 함수

1. **`verifyToken(request)`**: JWT 토큰 검증
```typescript
const user = verifyToken(request);
// Returns: AuthUser | null
```

2. **`hasElderProtectionAccess(user)`**: 경기북서부노인보호전문기관 접근 권한 확인
```typescript
const hasAccess = hasElderProtectionAccess(user);
// Returns: true (관리자 또는 경기북서부노인보호전문기관 직원)
```

3. **`requireElderProtection(request)`**: 경기북서부노인보호전문기관 전용 미들웨어
```typescript
const { user, error } = requireElderProtection(request);
if (error) {
  return NextResponse.json({ message: error.message }, { status: error.status });
}
```

---

## 데이터베이스 설정

### 1. PostgreSQL 설치 및 데이터베이스 생성

```bash
# PostgreSQL 설치 (Ubuntu/Debian)
sudo apt-get install postgresql postgresql-contrib

# 데이터베이스 생성
sudo -u postgres psql
CREATE DATABASE welfare_trends;
\q
```

### 2. 스키마 적용

```bash
# auth-schema.sql 적용 (사용자 및 부서)
psql -U postgres -d welfare_trends -f lib/auth-schema.sql

# db-schema.sql 적용 (콘텐츠 및 접근 제어)
psql -U postgres -d welfare_trends -f lib/db-schema.sql
```

### 3. 환경 변수 설정 (`.env.local`)

```bash
# 데이터베이스 연결
DATABASE_URL=postgresql://postgres:password@localhost:5432/welfare_trends

# JWT 시크릿 키 (반드시 변경!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# GenSpark AI API (선택)
OPENAI_API_KEY=your-api-key
OPENAI_BASE_URL=https://api.openai.com/v1
```

### 4. 콘텐츠 테이블 구조

```sql
CREATE TABLE contents (
  id UUID PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  summary TEXT,
  full_content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,  -- 'elder-protection' 추가
  
  -- 접근 제어 필드
  access_level VARCHAR(50) DEFAULT 'public',  -- 'public' | 'department_only'
  allowed_departments TEXT[],                  -- ['경기북서부노인보호전문기관']
  
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  -- ... 기타 필드
);
```

---

## API 사용법

### 1. 로그인 API

**Endpoint**: `POST /api/auth/login`

**Request**:
```json
{
  "email": "hong.gildong@gg.pass.or.kr"
}
```

**Response** (성공):
```json
{
  "success": true,
  "message": "로그인 성공",
  "user": {
    "id": "uuid",
    "email": "hong.gildong@gg.pass.or.kr",
    "role": "user",
    "status": "approved",
    "department_id": "uuid",
    "department_name": "경기북서부노인보호전문기관"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (실패 - 승인 대기):
```json
{
  "success": false,
  "message": "관리자 승인 대기 중입니다."
}
```

### 2. 노인보호전문기관 게시판 API

**Endpoint**: `GET /api/elder-protection`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response** (성공 - 경기북서부노인보호전문기관 직원):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "경기북서부노인보호전문기관 2025년 1월 업무 보고",
      "summary": "2025년 1월 주요 업무 진행 사항",
      "category": "elder-protection",
      "access_level": "department_only",
      "allowed_departments": ["경기북서부노인보호전문기관"],
      "published_at": "2025-01-15T09:00:00Z"
    }
  ],
  "user": {
    "email": "hong.gildong@gg.pass.or.kr",
    "department": "경기북서부노인보호전문기관",
    "role": "user"
  }
}
```

**Response** (실패 - 다른 부서 직원):
```json
{
  "success": false,
  "message": "경기북서부노인보호전문기관 직원만 접근 가능합니다."
}
```

**Response** (실패 - 로그인 필요):
```json
{
  "success": false,
  "message": "로그인이 필요합니다."
}
```

---

## 프론트엔드 연동

### 1. 로그인 후 토큰 저장

```typescript
// app/auth/login/page.tsx
const handleLogin = async (email: string) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const result = await response.json();

  if (result.success) {
    // 사용자 정보 및 토큰 저장
    localStorage.setItem('user', JSON.stringify(result.user));
    localStorage.setItem('token', result.token);
    
    // 페이지 이동
    router.push('/');
  }
};
```

### 2. 보호된 페이지 접근

```typescript
// app/elder-protection/page.tsx
const fetchContents = async () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    setError('로그인이 필요합니다.');
    return;
  }

  const response = await fetch('/api/elder-protection', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!result.success) {
    setError(result.message);
    return;
  }

  setContents(result.data);
};
```

### 3. 네비게이션 메뉴에서 조건부 표시

```typescript
// components/Navigation.tsx
const user = JSON.parse(localStorage.getItem('user') || '{}');
const canAccessElderProtection = 
  user.department_name === '경기북서부노인보호전문기관' || 
  user.role === 'admin';

{canAccessElderProtection && (
  <Link href="/elder-protection">
    🔒 노인보호전문기관
  </Link>
)}
```

---

## 테스트 시나리오

### ✅ 시나리오 1: 경기북서부노인보호전문기관 직원 접근

1. **회원가입**
   ```
   이메일: kim.worker@gg.pass.or.kr
   ```

2. **관리자 승인**
   - 관리자 페이지에서 부서 지정: `경기북서부노인보호전문기관`
   - 상태 변경: `pending` → `approved`

3. **로그인**
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"kim.worker@gg.pass.or.kr"}'
   ```

4. **게시판 접근**
   ```bash
   curl http://localhost:3000/api/elder-protection \
     -H "Authorization: Bearer <토큰>"
   ```

   **예상 결과**: ✅ 성공 (콘텐츠 목록 반환)

---

### ❌ 시나리오 2: 다른 부서 직원 접근 (경기북부노인보호전문기관)

1. **회원가입**
   ```
   이메일: lee.worker@gg.pass.or.kr
   ```

2. **관리자 승인**
   - 부서: `경기북부노인보호전문기관`
   - 상태: `approved`

3. **로그인**
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"lee.worker@gg.pass.or.kr"}'
   ```

4. **게시판 접근 시도**
   ```bash
   curl http://localhost:3000/api/elder-protection \
     -H "Authorization: Bearer <토큰>"
   ```

   **예상 결과**: ❌ 403 Forbidden
   ```json
   {
     "success": false,
     "message": "경기북서부노인보호전문기관 직원만 접근 가능합니다."
   }
   ```

---

### ✅ 시나리오 3: 관리자 전체 접근

1. **관리자 로그인**
   ```
   이메일: admin@gg.pass.or.kr
   부서: 기획예산팀
   역할: admin
   ```

2. **게시판 접근**
   ```bash
   curl http://localhost:3000/api/elder-protection \
     -H "Authorization: Bearer <관리자_토큰>"
   ```

   **예상 결과**: ✅ 성공 (관리자는 모든 게시판 접근 가능)

---

## 추가 기능 확장

### 1. 다른 노인보호전문기관 게시판 추가

각 노인보호전문기관별 전용 게시판을 추가하려면:

```typescript
// 경기북부노인보호전문기관 게시판 API
export function requireGyeonggiNorthElderProtection(request: NextRequest) {
  const { user, error } = requireAuth(request);
  
  if (error) return { user: null, error };
  
  const ALLOWED_DEPARTMENT = '경기북부노인보호전문기관';
  
  if (user.role !== 'admin' && user.department_name !== ALLOWED_DEPARTMENT) {
    return {
      user: null,
      error: {
        message: '경기북부노인보호전문기관 직원만 접근 가능합니다.',
        status: 403,
      },
    };
  }
  
  return { user, error: null };
}
```

### 2. 콘텐츠 생성 시 자동 접근 제한 설정

```typescript
// POST /api/elder-protection
const newContent = {
  // ... 기본 필드
  category: 'elder-protection',
  access_level: 'department_only',
  allowed_departments: ['경기북서부노인보호전문기관'],
};
```

### 3. 활동 로그 분석 대시보드

관리자 페이지에서 부서별 게시판 접근 통계 확인:

```sql
-- 부서별 게시판 접근 통계
SELECT 
  u.department_name,
  COUNT(*) as access_count,
  COUNT(DISTINCT ua.user_id) as unique_users
FROM user_activities ua
JOIN users u ON ua.user_id = u.id
WHERE ua.activity_type = 'view_elder_protection'
  AND ua.created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY u.department_name;
```

---

## 🔒 보안 권장사항

1. **JWT_SECRET 보호**
   - 프로덕션 환경에서는 강력한 시크릿 키 사용
   - 환경 변수로 관리, 절대 코드에 하드코딩 금지

2. **HTTPS 사용**
   - 프로덕션 환경에서는 반드시 HTTPS 사용
   - JWT 토큰은 네트워크 상에서 암호화되어 전송되어야 함

3. **토큰 만료 시간**
   - 기본 7일 설정
   - 필요시 더 짧게 조정 가능

4. **활동 로그 보관**
   - 모든 접근 및 활동 자동 기록
   - 보안 감사 및 문제 추적 가능

---

## 문의 및 지원

시스템 관련 문의사항은 관리자에게 연락하세요.

**버전**: 1.0.0  
**최종 업데이트**: 2025-12-25
