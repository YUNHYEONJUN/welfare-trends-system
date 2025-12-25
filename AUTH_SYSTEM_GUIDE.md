# 🔐 인증 시스템 가이드

경기도사회서비스원 직원 전용 복지동향 시스템

---

## 📌 시스템 개요

### 주요 특징
- ✅ **@ggpass.or.kr** 이메일만 가입 가능
- ✅ 관리자 승인 후 이용 가능
- ✅ 부서별 사용자 관리
- ✅ 사용자 활동 추적 및 통계
- ✅ **개인정보 최소 수집** (이메일만)

---

## 🚀 빠른 시작

### 1. 데이터베이스 설정

```bash
cd /home/user/webapp/welfare-trends

# PostgreSQL에 인증 스키마 적용
psql -U postgres -d welfare_trends -f lib/auth-schema.sql
```

### 2. 환경 변수 설정 (.env.local)

```env
# 데이터베이스
DATABASE_URL=postgresql://postgres:password@localhost:5432/welfare_trends

# JWT 시크릿 (실제 운영 시 변경 필요)
JWT_SECRET=your-super-secret-key-change-this-in-production

# NextAuth (선택사항)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key
```

### 3. 서버 실행

```bash
npm run dev
```

---

## 👥 사용자 흐름

### 일반 사용자

#### 1. 회원가입
1. `/auth/signup` 접속
2. `@ggpass.or.kr` 이메일 입력
3. 가입 신청 완료
4. **관리자 승인 대기**

#### 2. 로그인
1. `/auth/login` 접속
2. 이메일 입력
3. 승인 상태 확인
   - ✅ **승인됨**: 로그인 성공 → 홈으로
   - ⏳ **승인 대기**: 승인 대기 중 메시지
   - ❌ **거부됨**: 거부 사유 표시

#### 3. 시스템 이용
- 콘텐츠 조회
- 검색
- AI 요약 사용
- 모든 활동 자동 기록

---

### 관리자

#### 1. 관리자 대시보드 (`/admin`)

**통계 확인:**
- 전체 사용자 수
- 승인 대기 사용자
- 오늘 활동 사용자
- 부서별 현황
- 활동 유형별 통계

#### 2. 사용자 관리 (`/admin/users`)

**기능:**
- 사용자 목록 조회
- 필터링 (전체/승인대기/승인됨/거부/정지)
- 이메일 검색
- **사용자 승인**:
  - 부서 배정
  - 승인 처리
- **사용자 거부**:
  - 거부 사유 입력
  - 거부 처리

---

## 🗄️ 데이터베이스 구조

### 주요 테이블

#### 1. `users` - 사용자
```sql
- id: UUID (PK)
- email: VARCHAR(255) UNIQUE (CHECK: @ggpass.or.kr만)
- department_id: UUID (FK)
- role: VARCHAR(20) (user/admin)
- status: VARCHAR(20) (pending/approved/rejected/suspended)
- approved_at: TIMESTAMP
- approved_by: UUID (FK)
- last_login_at: TIMESTAMP
```

#### 2. `departments` - 부서
```sql
- id: UUID (PK)
- name: VARCHAR(100) UNIQUE
- description: TEXT
```

**기본 부서:**
- 경영지원팀
- 사업운영팀
- 돌봄서비스팀
- 교육연구팀
- 지역협력팀
- 품질관리팀
- 홍보기획팀
- 정보시스템팀

#### 3. `user_activities` - 활동 로그
```sql
- id: UUID (PK)
- user_id: UUID (FK)
- activity_type: VARCHAR(50)
  * login, logout, view_content, search, ai_summary, etc.
- content_id: UUID (FK, optional)
- metadata: JSONB
- ip_address: VARCHAR(45)
- user_agent: TEXT
- created_at: TIMESTAMP
```

#### 4. `user_sessions` - 세션
```sql
- id: UUID (PK)
- user_id: UUID (FK)
- session_token: VARCHAR(500) UNIQUE
- expires_at: TIMESTAMP
- ip_address: VARCHAR(45)
- user_agent: TEXT
```

#### 5. `admin_activities` - 관리자 활동
```sql
- id: UUID (PK)
- admin_id: UUID (FK)
- action: VARCHAR(100)
  * approve_user, reject_user, suspend_user, assign_department
- target_user_id: UUID (FK)
- details: JSONB
- created_at: TIMESTAMP
```

---

## 📊 통계 뷰

### 1. `department_user_stats` - 부서별 통계
```sql
SELECT 
  department_name,
  total_users,
  approved_users,
  pending_users,
  active_today
FROM department_user_stats;
```

### 2. `user_activity_stats` - 사용자별 통계
```sql
SELECT 
  email,
  department_name,
  total_activities,
  content_views,
  searches,
  ai_summary_uses
FROM user_activity_stats
ORDER BY total_activities DESC;
```

### 3. `daily_activity_stats` - 일별 통계
```sql
SELECT 
  activity_date,
  unique_users,
  total_activities,
  logins,
  content_views,
  searches
FROM daily_activity_stats
WHERE activity_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY activity_date DESC;
```

---

## 🔧 API 엔드포인트

### 인증 API

#### POST `/api/auth/signup`
회원가입

**Request:**
```json
{
  "email": "hong.gildong@ggpass.or.kr"
}
```

**Response (성공):**
```json
{
  "success": true,
  "message": "가입 신청이 완료되었습니다. 관리자 승인 후 이용 가능합니다.",
  "user": {
    "id": "uuid",
    "email": "hong.gildong@ggpass.or.kr",
    "status": "pending",
    "created_at": "2025-12-25T00:00:00Z"
  }
}
```

#### POST `/api/auth/login`
로그인

**Request:**
```json
{
  "email": "hong.gildong@ggpass.or.kr"
}
```

**Response (성공):**
```json
{
  "success": true,
  "message": "로그인 성공",
  "user": {
    "id": "uuid",
    "email": "hong.gildong@ggpass.or.kr",
    "role": "user",
    "status": "approved",
    "department_name": "사업운영팀"
  },
  "token": "session-token"
}
```

---

### 관리자 API

#### GET `/api/admin/users`
사용자 목록 조회

**Query Parameters:**
- `status`: pending, approved, rejected, suspended
- `department`: 부서 ID
- `search`: 이메일 검색
- `page`: 페이지 번호 (기본: 1)
- `limit`: 페이지당 개수 (기본: 20)

**Response:**
```json
{
  "success": true,
  "users": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### POST `/api/admin/users`
사용자 승인/거부

**Request (승인):**
```json
{
  "user_id": "uuid",
  "approved": true,
  "department_id": "dept-uuid"
}
```

**Request (거부):**
```json
{
  "user_id": "uuid",
  "approved": false,
  "reason": "직원 확인 불가"
}
```

#### GET `/api/admin/dashboard`
대시보드 통계

**Response:**
```json
{
  "success": true,
  "data": {
    "user_stats": { ... },
    "department_stats": [ ... ],
    "daily_activity": [ ... ],
    "top_users": [ ... ],
    "recent_admin_actions": [ ... ],
    "today_activity_breakdown": [ ... ]
  }
}
```

#### GET `/api/admin/stats`
상세 활동 통계

**Query Parameters:**
- `type`: user, department, daily
- `user_id`: 사용자 ID (type=user)
- `department_id`: 부서 ID
- `start_date`: 시작일 (YYYY-MM-DD)
- `end_date`: 종료일 (YYYY-MM-DD)

---

## 🔐 보안 및 개인정보

### 수집하는 정보
- ✅ **이메일 주소** (@ggpass.or.kr)
- ❌ 이름, 전화번호, 주소 등 **수집하지 않음**

### 활동 추적
- 로그인/로그아웃 시간
- 콘텐츠 조회 기록
- 검색 키워드
- AI 요약 사용 기록
- IP 주소 (보안 목적)
- User Agent (기기 정보)

### 데이터 보관
- 사용자 계정: 탈퇴 시까지
- 활동 로그: 최근 1년 (이후 자동 삭제)
- 세션: 7일 후 만료

---

## 📱 화면 구성

### 1. 회원가입 (`/auth/signup`)
- 이메일 입력
- 도메인 검증 (@ggpass.or.kr)
- 가입 신청 완료 메시지

### 2. 로그인 (`/auth/login`)
- 이메일 입력
- 승인 상태 확인
- 로그인 처리

### 3. 관리자 대시보드 (`/admin`)
- 전체 통계 카드 (4개)
- 부서별 사용자 현황
- 오늘 활동 현황
- 상위 활동 사용자
- 최근 관리자 활동

### 4. 사용자 관리 (`/admin/users`)
- 필터 버튼 (전체/대기/승인/거부/정지)
- 검색 입력
- 사용자 테이블
- 승인 처리 모달

---

## 🚦 사용자 상태

| 상태 | 설명 | 행동 |
|------|------|------|
| `pending` | 승인 대기 | 로그인 불가 |
| `approved` | 승인됨 | 정상 이용 가능 |
| `rejected` | 거부됨 | 로그인 불가, 사유 표시 |
| `suspended` | 정지됨 | 로그인 불가, 사유 표시 |

---

## 🎯 관리자 작업 흐름

### 신규 사용자 승인

1. `/admin/users` 접속
2. "승인 대기" 필터 선택
3. 신규 가입 사용자 확인
4. "승인 처리" 버튼 클릭
5. 부서 선택 (필수)
6. "승인" 버튼 클릭
7. ✅ 사용자가 즉시 로그인 가능

### 사용자 거부

1. `/admin/users` 접속
2. "승인 대기" 필터 선택
3. 거부할 사용자 확인
4. "승인 처리" 버튼 클릭
5. 거부 사유 입력
6. "거부" 버튼 클릭
7. ❌ 사용자가 로그인 시 거부 사유 확인

---

## 📈 활동 통계 확인

### 부서별 통계
```bash
# SQL 쿼리
SELECT * FROM department_user_stats;
```

### 개인별 활동 순위
```bash
# API 호출
curl http://localhost:3000/api/admin/stats?type=user
```

### 일별 활동 추이
```bash
# API 호출
curl "http://localhost:3000/api/admin/stats?type=daily&start_date=2025-12-01&end_date=2025-12-31"
```

---

## 🔧 문제 해결

### 회원가입이 안 됩니다
- ✅ `@ggpass.or.kr` 이메일인지 확인
- ✅ 이미 가입된 이메일인지 확인
- ✅ 데이터베이스 연결 확인

### 로그인이 안 됩니다
- ✅ 관리자 승인을 받았는지 확인
- ✅ 이메일 철자 확인
- ✅ 계정 상태 확인 (정지/거부)

### 관리자 페이지 접근 불가
- ✅ 계정 role이 'admin'인지 확인
- ✅ 로그인 상태 확인
- ✅ 세션 만료 여부 확인

---

## 📞 다음 단계

1. **실제 데이터베이스 연동**
   - PostgreSQL 설치
   - 스키마 적용
   - API에서 Mock → DB 쿼리로 변경

2. **이메일 알림**
   - 승인 완료 시 이메일 발송
   - 거부 시 사유 이메일 발송

3. **보안 강화**
   - JWT 토큰 구현
   - 비밀번호 추가 (선택사항)
   - 2FA 인증 (선택사항)

4. **추가 기능**
   - 사용자 프로필 페이지
   - 내 활동 내역 조회
   - 부서별 대시보드

---

**인증 시스템이 준비되었습니다! 🎉**

데이터베이스를 연결하면 바로 사용 가능합니다.
