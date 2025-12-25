# ✅ Vercel Pro 배포 체크리스트

## 📋 배포 전 준비

### 1. 코드 준비
- [ ] 모든 변경사항 커밋
- [ ] main 브랜치로 푸시
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 2. 환경 변수 준비
다음 값들을 미리 준비하세요:

```bash
# OpenAI API 키 (필수)
OPENAI_API_KEY=sk-proj-...

# JWT 시크릿 생성
openssl rand -base64 32
# → JWT_SECRET에 사용

# NextAuth 시크릿 생성
openssl rand -base64 32
# → NEXTAUTH_SECRET에 사용

# Cron 시크릿 생성
openssl rand -base64 32
# → CRON_SECRET에 사용
```

---

## 🚀 Vercel 배포 (10분)

### Step 1: 프로젝트 생성 (2분)
- [ ] https://vercel.com/dashboard 접속
- [ ] "Add New..." → "Project" 클릭
- [ ] GitHub 리포지토리 `welfare-trends` 선택
- [ ] "Import" 클릭

### Step 2: 프로젝트 설정 (1분)
- [ ] Framework Preset: **Next.js** (자동 감지)
- [ ] Root Directory: `./`
- [ ] **아직 Deploy 클릭하지 말 것!**

### Step 3: Vercel Postgres 생성 (2분)
- [ ] "Storage" 탭 클릭
- [ ] "Create Database" → "Postgres" 선택
- [ ] Database Name: `welfare-trends-db`
- [ ] Region: 가까운 지역 선택 (예: `iad1`)
- [ ] "Create" 클릭
- [ ] 자동으로 환경 변수 연결됨 확인

### Step 4: 환경 변수 설정 (3분)
- [ ] "Settings" → "Environment Variables" 이동
- [ ] 다음 변수들 추가:

```bash
# OpenAI API (필수)
OPENAI_API_KEY=sk-proj-your-actual-key-here
OPENAI_BASE_URL=https://api.openai.com/v1

# 인증 (필수)
JWT_SECRET=your-generated-32-char-secret
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=your-generated-32-char-secret

# Cron Job 인증 (필수)
CRON_SECRET=your-generated-32-char-secret

# 환경
NODE_ENV=production
```

- [ ] Environment: **Production, Preview, Development** 모두 체크
- [ ] "Save" 클릭

### Step 5: 첫 배포 (2분)
- [ ] "Deployments" 탭 이동
- [ ] "Redeploy" 또는 "Deploy" 클릭
- [ ] 배포 완료 대기 (약 2-3분)
- [ ] ✅ 배포 성공 확인!

**배포 URL**: `https://your-project.vercel.app`

---

## 🗄️ 데이터베이스 설정 (5분)

### Vercel CLI 설치 및 연결
```bash
# CLI 설치
npm i -g vercel

# 로그인
vercel login

# 프로젝트 연결
cd /home/user/webapp/welfare-trends
vercel link

# 환경 변수 다운로드
vercel env pull .env.local
```

### 스키마 적용
```bash
# 데이터베이스 URL 추출
DB_URL=$(grep POSTGRES_URL .env.local | cut -d '=' -f2-)

# 스키마 적용
psql "$DB_URL" -f lib/auth-schema.sql
psql "$DB_URL" -f lib/db-schema.sql
psql "$DB_URL" -f lib/curation-schema.sql
psql "$DB_URL" -f add_password_field.sql
```

### 관리자 계정 생성
```bash
# 비밀번호 해시 생성 (welcome123)
node -e "console.log(require('bcryptjs').hashSync('welcome123', 10))"
# 출력된 해시를 복사

# PostgreSQL 접속
psql "$DB_URL"
```

```sql
-- 부서 생성
INSERT INTO departments (id, name, description)
VALUES (gen_random_uuid(), '기획예산팀', '기획예산팀')
ON CONFLICT DO NOTHING;

-- 관리자 계정 생성
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
  '여기에_위에서_생성한_해시_붙여넣기',
  '관리자',
  (SELECT id FROM departments WHERE name = '기획예산팀' LIMIT 1),
  'admin',
  'approved',
  NOW()
)
ON CONFLICT (email) DO UPDATE
SET role = 'admin', status = 'approved', password_hash = EXCLUDED.password_hash;

-- 확인
SELECT email, role, status FROM users WHERE email = 'yoonhj79@gmail.com';

-- 종료
\q
```

---

## 🔄 Cron Jobs 설정 (2분)

### 확인 사항
- [ ] `vercel.json` 파일 존재 확인
- [ ] `app/api/cron/crawl/route.ts` 파일 존재 확인
- [ ] `app/api/cron/curate/route.ts` 파일 존재 확인
- [ ] `CRON_SECRET` 환경 변수 설정 완료

### Vercel Dashboard 확인
- [ ] Settings → Cron Jobs 탭 이동
- [ ] 2개의 Cron Job 표시 확인:
  - `/api/cron/crawl` - 매일 UTC 18:00 (한국 시간 오전 3시)
  - `/api/cron/curate` - 매일 UTC 18:30 (한국 시간 오전 3시 30분)
- [ ] "Run Now" 버튼으로 수동 실행 테스트

---

## ✅ 배포 후 테스트

### 1. 웹사이트 접속
```bash
# 브라우저에서 열기
open https://your-project.vercel.app
```
- [ ] 메인 페이지 로딩 확인
- [ ] 404 에러 없음

### 2. 로그인 테스트
```
이메일: yoonhj79@gmail.com
비밀번호: welcome123
```
- [ ] 로그인 성공
- [ ] 관리자 권한 확인
- [ ] 대시보드 접근 가능

### 3. API 테스트
```bash
# Contents API
curl https://your-project.vercel.app/api/contents

# Auth API
curl -X POST https://your-project.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"yoonhj79@gmail.com","password":"welcome123"}'
```
- [ ] API 응답 정상
- [ ] 데이터베이스 연결 확인

### 4. Cron Job 수동 실행
```bash
# Crawl 실행
curl -X GET https://your-project.vercel.app/api/cron/crawl \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Curate 실행
curl -X GET https://your-project.vercel.app/api/cron/curate \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```
- [ ] Cron API 응답 정상
- [ ] Vercel Logs에서 실행 확인

---

## 📊 모니터링 설정

### Vercel Dashboard
- [ ] Analytics 활성화 확인
- [ ] Logs 탭에서 실시간 로그 확인
- [ ] Speed Insights 확인

### 알림 설정
- [ ] Settings → Notifications
- [ ] Deployment 성공/실패 알림 활성화
- [ ] Error 알림 활성화

---

## 🎯 선택 사항

### 커스텀 도메인 연결
- [ ] Settings → Domains
- [ ] 도메인 추가
- [ ] DNS 설정 (A/CNAME 레코드)
- [ ] SSL 인증서 자동 발급 확인

### Git 통합
- [ ] Settings → Git
- [ ] Auto-deploy: **Enabled**
- [ ] Production Branch: `main`
- [ ] Preview Branch: `develop` (선택)

### 보안 설정
- [ ] Settings → Security
- [ ] Authentication 설정
- [ ] Rate Limiting 고려

---

## 🔧 트러블슈팅

### 빌드 실패 시
```bash
# 로컬에서 테스트
npm run build

# 캐시 클리어 후 재배포
# Vercel Dashboard → Settings → General → "Clear Build Cache & Deploy"
```

### 데이터베이스 연결 오류 시
```bash
# 환경 변수 확인
vercel env pull .env.local
cat .env.local | grep POSTGRES

# 데이터베이스 상태 확인
# Vercel Dashboard → Storage → Postgres → Monitoring
```

### Cron Job 실행 안 될 시
```bash
# CRON_SECRET 확인
vercel env ls

# 로그 확인
# Vercel Dashboard → Logs → Filter: "/api/cron"

# 수동 실행으로 디버깅
curl -X GET https://your-project.vercel.app/api/cron/crawl \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -v
```

---

## 💾 백업

### 데이터베이스 백업
```bash
# 수동 백업
pg_dump "$(grep POSTGRES_URL .env.local | cut -d '=' -f2-)" > backup_$(date +%Y%m%d).sql

# Vercel Postgres 자동 백업 확인
# Dashboard → Storage → Postgres → Backups
```

---

## ✅ 최종 체크리스트

- [ ] ✅ Vercel 프로젝트 생성
- [ ] ✅ Vercel Postgres 데이터베이스 생성
- [ ] ✅ 환경 변수 설정 (7개)
- [ ] ✅ 첫 배포 완료
- [ ] ✅ 데이터베이스 스키마 적용
- [ ] ✅ 관리자 계정 생성
- [ ] ✅ 로그인 테스트 성공
- [ ] ✅ API 테스트 성공
- [ ] ✅ Cron Jobs 설정 확인
- [ ] ✅ 모니터링 설정
- [ ] ✅ (선택) 커스텀 도메인 연결

---

## 🎉 배포 완료!

모든 체크리스트를 완료하셨다면 축하합니다! 🎊

**다음 단계:**
1. 팀원들과 URL 공유
2. 크롤링 자동화 모니터링
3. 사용자 피드백 수집
4. 성능 최적화

---

**작성일**: 2025-12-25  
**예상 소요 시간**: 20-30분  
**난이도**: ⭐⭐ (쉬움)
