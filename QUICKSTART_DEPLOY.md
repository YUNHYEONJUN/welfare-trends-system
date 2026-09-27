# 🚀 복지동향 시스템 - 빠른 배포 가이드

## 📋 3가지 배포 방법 요약

### 1️⃣ Vercel 배포 (가장 쉬움, 5분) ⭐ 추천

```bash
# 1. GitHub에 푸시
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. Vercel 접속 및 배포
# https://vercel.com → Import Project → GitHub 연동
# 환경 변수 설정 후 배포 완료!

# 3. 크롤링은 GitHub Actions 사용
# .github/workflows/crawl-and-curate.yml 파일 확인
```

**장점**: 자동 배포, HTTPS, 무료  
**단점**: 크롤링은 별도 설정 필요  
**비용**: 무료 (취미 플랜)

---

### 2️⃣ Docker 배포 (중급, 10분)

```bash
# 1. 환경 변수 설정
cp .env.example .env
nano .env  # 환경 변수 편집

# 2. Docker Compose 실행
docker-compose up -d

# 3. 접속
# http://localhost:3000
```

**장점**: 모든 것이 포함됨 (DB + 앱 + 크롤러)  
**단점**: Docker 지식 필요  
**비용**: 서버 비용만 ($5~20/월)

---

### 3️⃣ VPS 직접 배포 (고급, 30분)

```bash
# 1. VPS 서버 생성 (DigitalOcean, AWS, etc.)

# 2. 서버 접속 및 설치
ssh root@your-server-ip
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
apt install -y postgresql nginx

# 3. 프로젝트 배포
git clone https://github.com/your-username/welfare-trends.git
cd welfare-trends
npm install
npm run build

# 4. PM2로 실행
pm2 start ecosystem.config.js
pm2 save
```

**장점**: 완전한 제어, 커스터마이징  
**단점**: 서버 관리 필요  
**비용**: $5~20/월

---

## 🎯 상황별 추천

| 상황 | 추천 방법 | 이유 |
|------|----------|------|
| 빠르게 테스트 | Vercel | 가장 쉽고 빠름 |
| 예산 $0 | Vercel + Supabase + GitHub Actions | 모두 무료 |
| 크롤링 중요 | VPS 또는 Docker | 백그라운드 작업 가능 |
| 확장성 필요 | Docker | 이식성 좋음 |

---

## 🔧 공통: 필수 환경 변수

모든 배포 방법에서 다음 환경 변수가 필요합니다:

```bash
# 데이터베이스
DATABASE_URL=postgresql://user:password@host:5432/database

# OpenAI API
OPENAI_API_KEY=sk-proj-your-key-here

# 인증
JWT_SECRET=your-secret-min-32-chars
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-nextauth-secret
```

### OpenAI API 키 발급
1. https://platform.openai.com 접속
2. API Keys → Create new secret key
3. 키 복사 및 환경 변수에 설정

### JWT Secret 생성
```bash
# 랜덤 시크릿 생성
openssl rand -base64 32
```

---

## 🗄️ 데이터베이스 설정

### Vercel 배포 시
- **Vercel Postgres** (권장)
- **Supabase** (무료)
- **Neon** (무료)

### Docker 배포 시
- docker-compose.yml에 PostgreSQL 포함됨

### VPS 배포 시
```bash
# PostgreSQL 설치 및 설정
sudo -u postgres createdb welfare_trends
psql -d welfare_trends -f lib/auth-schema.sql
psql -d welfare_trends -f lib/db-schema.sql
psql -d welfare_trends -f lib/curation-schema.sql
psql -d welfare_trends -f add_password_field.sql
```

---

## 📊 배포 후 확인사항

### 1. 웹사이트 접속 확인
```
https://your-domain.com
```

### 2. 로그인 테스트
```
이메일: yoonhj79@gmail.com
비밀번호: YOUR_ADMIN_PASSWORD
```

### 3. 데이터베이스 연결 확인
```bash
# API 테스트
curl https://your-domain.com/api/contents
```

### 4. 크롤링 테스트
```bash
# 로컬에서 테스트
npm run crawl:manual

# 또는 API 호출
curl -X POST https://your-domain.com/api/crawl
```

### 5. AI 큐레이션 테스트
```bash
# 샘플 데이터 생성
npm run seed:sample

# 큐레이션 실행
npm run curate:test
```

---

## 🔄 크롤링 자동화

### Vercel + GitHub Actions (무료)
1. GitHub Secrets 설정:
   - `DATABASE_URL`
   - `OPENAI_API_KEY`

2. GitHub Actions 자동 실행:
   - 매일 UTC 18:00 (한국 시간 오전 3시)
   - `.github/workflows/crawl-and-curate.yml` 참고

### VPS 또는 Docker (Cron Job)
```bash
# PM2 사용
pm2 start ecosystem.config.js

# 또는 Cron Job
crontab -e
# 매일 오전 3시 크롤링
0 3 * * * cd /var/www/welfare-trends && npm run crawl:all
# 매일 오전 4시 큐레이션
0 4 * * * cd /var/www/welfare-trends && npm run curate
```

---

## 💰 예상 비용

### 무료 옵션
```
Vercel (무료 플랜)        $0
+ Supabase (무료 플랜)    $0
+ GitHub Actions          $0
= 총 비용                 $0/월
```

### 저예산 옵션
```
DigitalOcean Droplet      $6/월
(모든 것 포함: DB + 앱 + 크롤러)
```

### 중간 예산 옵션
```
Vercel Pro                $20/월
+ Vercel Postgres         $10/월
+ Vercel Cron Jobs        포함
= 총 비용                 $30/월
```

---

## 🆘 트러블슈팅

### 빌드 실패
```bash
rm -rf .next node_modules
npm install
npm run build
```

### 데이터베이스 연결 오류
```bash
# 연결 문자열 확인
echo $DATABASE_URL

# PostgreSQL 접속 테스트
psql "$DATABASE_URL"
```

### OpenAI API 오류
```bash
# API 키 확인
echo $OPENAI_API_KEY

# API 테스트
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Puppeteer 오류 (크롤링)
```bash
# Chromium 설치
apt install -y chromium-browser chromium-chromedriver
```

---

## 📚 상세 문서

더 자세한 내용은 다음 문서를 참고하세요:

- **DEPLOYMENT_GUIDE.md** - 전체 배포 가이드 (상세)
- **CURATION_SETUP_GUIDE.md** - AI 큐레이션 설정
- **README.md** - 프로젝트 개요

---

## 🎉 다음 단계

배포 완료 후:

1. ✅ 도메인 연결 (선택사항)
2. ✅ SSL/HTTPS 설정
3. ✅ 모니터링 설정
4. ✅ 백업 자동화
5. ✅ 크롤링 스케줄 확인

---

**작성일**: 2025-12-25  
**버전**: 1.0.0  
**작성자**: Genspark AI Developer

**질문이나 문제가 있으시면 이슈를 등록해주세요!**
