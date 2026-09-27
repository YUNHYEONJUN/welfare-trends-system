# 🚀 Vercel Pro 배포 가이드

## ✅ Vercel Pro 장점

Vercel Pro 플랜을 사용하시면 다음 기능들을 모두 활용할 수 있습니다:

- ✅ **Vercel Postgres**: 관리형 PostgreSQL 데이터베이스
- ✅ **Vercel Cron Jobs**: 서버리스 크롤링 자동화
- ✅ **Unlimited Bandwidth**: 무제한 트래픽
- ✅ **Advanced Analytics**: 상세 분석
- ✅ **Team Collaboration**: 팀 협업
- ✅ **Priority Support**: 우선 지원

---

## 📋 배포 단계 (10분)

### Step 1: GitHub 리포지토리 준비

```bash
cd /home/user/webapp/welfare-trends

# main 브랜치로 푸시
git checkout main  # 또는 master
git push origin main
```

---

### Step 2: Vercel 프로젝트 생성

1. **Vercel 대시보드 접속**
   - https://vercel.com/dashboard

2. **New Project 클릭**
   - "Add New..." → "Project"

3. **GitHub 리포지토리 Import**
   - "Import Git Repository"
   - `welfare-trends` 선택
   - "Import" 클릭

4. **프로젝트 설정**
   ```
   Framework Preset: Next.js
   Root Directory: ./
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

5. **배포 설정**
   - "Deploy" 버튼 클릭하지 말고 먼저 환경 변수 설정!

---

### Step 3: Vercel Postgres 데이터베이스 생성

1. **Storage 탭으로 이동**
   - 프로젝트 대시보드 → "Storage" 탭

2. **Create Database**
   - "Create Database" 클릭
   - "Postgres" 선택
   - Database Name: `welfare-trends-db`
   - Region: `iad1` (Washington, D.C., USA) 또는 가까운 지역

3. **데이터베이스 생성 완료**
   - 자동으로 환경 변수 연결됨
   - `POSTGRES_URL`, `POSTGRES_PRISMA_URL` 등 자동 생성

---

### Step 4: 환경 변수 설정

1. **프로젝트 설정으로 이동**
   - Settings → Environment Variables

2. **필수 환경 변수 추가**

```bash
# OpenAI API (필수)
OPENAI_API_KEY=sk-proj-your-actual-key-here
OPENAI_BASE_URL=https://api.openai.com/v1

# 인증 (필수)
JWT_SECRET=your-secret-key-min-32-characters-long
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret-key-32-chars

# 데이터베이스 (Vercel Postgres 생성 시 자동)
# DATABASE_URL은 자동으로 설정됨

# 환경 (선택)
NODE_ENV=production
```

3. **Environment 선택**
   - Production, Preview, Development 모두 체크

4. **Save** 클릭

---

### Step 5: 데이터베이스 스키마 적용

Vercel Postgres에 스키마를 적용해야 합니다.

#### 방법 1: Vercel CLI 사용 (추천)

```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 프로젝트 연결
cd /home/user/webapp/welfare-trends
vercel link

# 환경 변수 가져오기
vercel env pull .env.local

# 데이터베이스 스키마 적용
psql "$(grep POSTGRES_URL .env.local | cut -d '=' -f2-)" -f lib/auth-schema.sql
psql "$(grep POSTGRES_URL .env.local | cut -d '=' -f2-)" -f lib/db-schema.sql
psql "$(grep POSTGRES_URL .env.local | cut -d '=' -f2-)" -f lib/curation-schema.sql
psql "$(grep POSTGRES_URL .env.local | cut -d '=' -f2-)" -f add_password_field.sql
```

#### 방법 2: Vercel Dashboard에서 직접

1. **Storage → Postgres → Data 탭**
2. **Query** 버튼 클릭
3. 각 SQL 파일 내용을 복사하여 실행:
   - `lib/auth-schema.sql`
   - `lib/db-schema.sql`
   - `lib/curation-schema.sql`
   - `add_password_field.sql`

---

### Step 6: 첫 배포 실행

1. **Deployments 탭으로 이동**
2. **"Redeploy" 클릭** (환경 변수 적용을 위해)
3. 배포 완료 대기 (약 2-3분)
4. 배포 성공 확인!

**배포 URL**: `https://your-project.vercel.app`

---

### Step 7: 관리자 계정 생성

배포 완료 후 관리자 계정을 DB에 직접 생성:

```bash
# Vercel Postgres에 접속
psql "$(grep POSTGRES_URL .env.local | cut -d '=' -f2-)"

# 또는 Vercel Dashboard → Storage → Query에서 실행:
```

```sql
-- 관리자 계정 생성
INSERT INTO departments (id, name, description)
VALUES (gen_random_uuid(), '기획예산팀', '기획예산팀')
ON CONFLICT DO NOTHING;

-- yoonhj79@gmail.com 계정 (비밀번호: YOUR_ADMIN_PASSWORD)
INSERT INTO users (
  email,
  password_hash,
  name,
  department_id,
  role,
  status,
  approved_at
)
VALUES (
  'yoonhj79@gmail.com',
  '$2a$10$YourHashedPasswordHere',  -- bcrypt hash of 'YOUR_ADMIN_PASSWORD'
  '관리자',
  (SELECT id FROM departments WHERE name = '기획예산팀' LIMIT 1),
  'admin',
  'approved',
  NOW()
)
ON CONFLICT (email) DO UPDATE
SET role = 'admin', status = 'approved';
```

**비밀번호 해시 생성:**
```bash
# Node.js로 bcrypt 해시 생성
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('YOUR_ADMIN_PASSWORD', 10));"
```

---

### Step 8: Vercel Cron Jobs 설정 (크롤링 자동화)

Vercel Pro는 Cron Jobs를 지원합니다!

#### 1. Cron API 엔드포인트 생성

```bash
# app/api/cron/crawl/route.ts 파일 생성
mkdir -p app/api/cron/crawl
```

`app/api/cron/crawl/route.ts` 파일 내용:

```typescript
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export const maxDuration = 300; // 5분 타임아웃

export async function GET(request: Request) {
  // Vercel Cron 인증 확인
  const authHeader = headers().get('authorization');
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('[Cron] Starting crawl and curation...');
    
    // 여기서 크롤링 로직 실행
    // 실제 구현은 lib/scripts의 크롤링 함수 import하여 실행
    
    return NextResponse.json({
      success: true,
      message: 'Crawl and curation completed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Cron] Error:', error);
    return NextResponse.json(
      { error: 'Cron job failed', details: error.message },
      { status: 500 }
    );
  }
}
```

#### 2. `vercel.json` 파일 생성

```json
{
  "crons": [
    {
      "path": "/api/cron/crawl",
      "schedule": "0 18 * * *"
    }
  ]
}
```

**Schedule 설명:**
- `0 18 * * *`: 매일 UTC 18:00 (한국 시간 오전 3시)
- Cron 표현식: 분 시 일 월 요일

#### 3. CRON_SECRET 환경 변수 추가

```bash
# 랜덤 시크릿 생성
openssl rand -base64 32

# Vercel 환경 변수에 추가
# CRON_SECRET=generated-secret-here
```

#### 4. 배포 후 Cron 확인

- Vercel Dashboard → Settings → Cron Jobs
- 설정된 Cron 확인
- "Run Now" 버튼으로 수동 실행 가능

---

## 🎯 배포 완료 체크리스트

- [ ] GitHub에 코드 푸시
- [ ] Vercel 프로젝트 생성
- [ ] Vercel Postgres 데이터베이스 생성
- [ ] 환경 변수 설정 (OPENAI_API_KEY, JWT_SECRET 등)
- [ ] 데이터베이스 스키마 적용
- [ ] 첫 배포 완료
- [ ] 관리자 계정 생성
- [ ] 로그인 테스트
- [ ] Vercel Cron Jobs 설정
- [ ] 크롤링 자동화 확인

---

## 🔍 배포 후 확인

### 1. 웹사이트 접속
```
https://your-project.vercel.app
```

### 2. 로그인 테스트
```
이메일: yoonhj79@gmail.com
비밀번호: YOUR_ADMIN_PASSWORD
```

### 3. API 테스트
```bash
curl https://your-project.vercel.app/api/contents
```

### 4. 데이터베이스 연결 확인
```bash
# Vercel CLI로 확인
vercel env pull .env.local
psql "$(grep POSTGRES_URL .env.local | cut -d '=' -f2-)" -c "\dt"
```

### 5. Cron Job 수동 실행
- Vercel Dashboard → Settings → Cron Jobs
- "Run Now" 클릭

---

## 🔄 업데이트 및 재배포

### Git Push 시 자동 배포
```bash
git add .
git commit -m "Update features"
git push origin main

# Vercel이 자동으로 감지하고 배포 시작
```

### 수동 재배포
```bash
# Vercel CLI 사용
vercel --prod

# 또는 Vercel Dashboard에서
# Deployments → 최신 배포 → "Redeploy" 클릭
```

---

## 💾 데이터베이스 백업

### Vercel Postgres 백업

```bash
# 백업 생성
vercel postgres backup create welfare-trends-db

# 백업 목록 확인
vercel postgres backup list welfare-trends-db

# 백업 다운로드
pg_dump "$(vercel env pull .env.local && grep POSTGRES_URL .env.local | cut -d '=' -f2-)" > backup_$(date +%Y%m%d).sql
```

### 자동 백업 설정

Vercel Postgres는 자동 일일 백업을 제공합니다 (Pro 플랜).

---

## 📊 모니터링 및 분석

### Vercel Analytics
- 프로젝트 대시보드 → Analytics
- 실시간 트래픽, 페이지 뷰, 성능 확인

### Vercel Logs
- 프로젝트 대시보드 → Logs
- 실시간 로그 확인
- 에러 추적

### Vercel Speed Insights
- 프로젝트 대시보드 → Speed Insights
- Core Web Vitals 확인
- 성능 최적화 제안

---

## 🛠️ 트러블슈팅

### 빌드 실패

**문제:** Build failed
```bash
# 로컬에서 빌드 테스트
npm run build

# 캐시 삭제 후 재배포
# Vercel Dashboard → Settings → General → "Clear Build Cache & Deploy"
```

### 데이터베이스 연결 오류

**문제:** Unable to connect to database
```bash
# 환경 변수 확인
vercel env pull .env.local
cat .env.local | grep POSTGRES

# 데이터베이스 상태 확인
# Vercel Dashboard → Storage → Postgres → Monitoring
```

### Cron Job 실행 안 됨

**문제:** Cron job not running
```bash
# vercel.json 확인
cat vercel.json

# CRON_SECRET 환경 변수 확인
# Vercel Dashboard → Settings → Environment Variables

# 로그 확인
# Vercel Dashboard → Logs → Filter by "/api/cron"
```

### OpenAI API 에러

**문제:** OpenAI API rate limit
```bash
# API 키 확인
echo $OPENAI_API_KEY

# Rate limit 확인
# https://platform.openai.com/account/rate-limits

# Vercel Function 타임아웃 확인
# maxDuration을 300으로 설정 (5분)
```

---

## 💰 Vercel Pro 비용 최적화

### 함수 실행 시간 최적화
```typescript
// API 라우트에서
export const maxDuration = 60; // 필요한 만큼만 설정
```

### 이미지 최적화
```javascript
// next.config.js
module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
};
```

### 정적 페이지 생성
```typescript
// ISR (Incremental Static Regeneration)
export const revalidate = 3600; // 1시간마다 재생성
```

---

## 🔐 보안 설정

### 환경 변수 보안
- ✅ `.env.local`은 `.gitignore`에 포함
- ✅ GitHub에 시크릿 절대 커밋하지 않기
- ✅ Vercel 환경 변수로만 관리

### CORS 설정
```typescript
// middleware.ts
export function middleware(request: Request) {
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', 'https://your-domain.com');
  return response;
}
```

### Rate Limiting
```typescript
// app/api/[...]/route.ts
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});
```

---

## 🚀 다음 단계

1. **커스텀 도메인 연결**
   - Vercel Dashboard → Settings → Domains
   - 도메인 추가 및 DNS 설정

2. **팀원 초대**
   - Settings → Team → Invite Members

3. **프로덕션 모니터링 설정**
   - Analytics 활성화
   - Error Tracking 설정
   - Performance Monitoring

4. **CI/CD 파이프라인 구축**
   - Preview 배포 활용
   - Staging 환경 설정

---

## 📞 지원

- **Vercel 문서**: https://vercel.com/docs
- **Vercel Support**: https://vercel.com/support
- **Next.js 문서**: https://nextjs.org/docs

---

**작성일**: 2025-12-25  
**버전**: 1.0.0  
**Vercel Pro 플랜 최적화**
