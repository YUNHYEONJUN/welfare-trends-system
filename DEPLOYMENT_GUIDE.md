# 🚀 복지동향 시스템 배포 가이드

## 📋 목차
1. [배포 옵션 비교](#배포-옵션-비교)
2. [Vercel 배포 (추천)](#1-vercel-배포-추천)
3. [자체 서버 배포 (VPS)](#2-자체-서버-배포-vps)
4. [Docker 배포](#3-docker-배포)
5. [환경 변수 설정](#환경-변수-설정)
6. [데이터베이스 설정](#데이터베이스-설정)
7. [크롤링 자동화](#크롤링-자동화)

---

## 배포 옵션 비교

| 옵션 | 난이도 | 비용 | 장점 | 단점 |
|------|--------|------|------|------|
| **Vercel** | ⭐ 쉬움 | 무료/유료 | 자동 배포, HTTPS, CDN | 백그라운드 작업 제한 |
| **VPS** | ⭐⭐⭐ 중간 | $5~20/월 | 완전한 제어, 크롤링 가능 | 서버 관리 필요 |
| **Docker** | ⭐⭐⭐⭐ 어려움 | 서버 비용 | 이식성, 확장성 | 초기 설정 복잡 |

---

## 1. Vercel 배포 (추천)

### ✅ 장점
- 가장 쉽고 빠름 (5분 이내 배포)
- GitHub 연동 시 자동 배포
- 무료 SSL/HTTPS 제공
- 글로벌 CDN

### ⚠️ 주의사항
- **크롤링/큐레이션 스크립트는 Vercel에서 실행 불가**
- 별도 서버에서 크롤링 실행 필요
- PostgreSQL은 외부 서비스 사용 (Supabase, Neon 등)

### 📝 배포 단계

#### Step 1: GitHub에 코드 푸시
```bash
cd /home/user/webapp/welfare-trends

# GitHub 리포지토리 생성 후
git remote add origin https://github.com/your-username/welfare-trends.git
git branch -M main
git push -u origin main
```

#### Step 2: Vercel 프로젝트 생성
1. https://vercel.com 접속 및 로그인
2. "New Project" 클릭
3. GitHub 리포지토리 선택
4. 프로젝트 설정:
   - Framework Preset: **Next.js**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

#### Step 3: 환경 변수 설정
Vercel 대시보드 → Settings → Environment Variables에 추가:

```
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-proj-...
JWT_SECRET=your-secret-key
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret
```

#### Step 4: PostgreSQL 데이터베이스 설정

##### 옵션 A: Vercel Postgres (추천)
```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 연결
vercel link

# Postgres 추가
vercel postgres create
```

##### 옵션 B: Supabase (무료)
1. https://supabase.com 가입
2. 새 프로젝트 생성
3. Database → Connection string 복사
4. Vercel 환경 변수에 `DATABASE_URL` 추가

##### 옵션 C: Neon (무료)
1. https://neon.tech 가입
2. 새 프로젝트 생성
3. Connection string 복사
4. Vercel 환경 변수에 `DATABASE_URL` 추가

#### Step 5: 데이터베이스 스키마 적용
```bash
# 로컬에서 원격 DB에 스키마 적용
psql "postgresql://..." -f lib/auth-schema.sql
psql "postgresql://..." -f lib/db-schema.sql
psql "postgresql://..." -f lib/curation-schema.sql
psql "postgresql://..." -f add_password_field.sql
```

#### Step 6: 배포 확인
- Vercel이 자동으로 빌드 및 배포
- 배포 완료 후 URL 확인: `https://your-project.vercel.app`

### 🔄 크롤링 자동화 (별도 서버 필요)

Vercel은 백그라운드 작업이 제한되므로, 크롤링은 다음 방법 중 하나 선택:

#### 방법 1: GitHub Actions (추천)
```yaml
# .github/workflows/crawl.yml
name: Daily Crawl and Curate

on:
  schedule:
    - cron: '0 3 * * *'  # 매일 오전 3시 (UTC)
  workflow_dispatch:  # 수동 실행 가능

jobs:
  crawl:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run crawling
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: npm run crawl:all
      
      - name: Run curation
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        run: npm run curate
```

#### 방법 2: Vercel Cron Jobs (Pro 플랜)
```javascript
// vercel.json
{
  "crons": [{
    "path": "/api/cron/crawl",
    "schedule": "0 3 * * *"
  }]
}
```

#### 방법 3: 별도 서버 (저렴한 VPS)
- DigitalOcean Droplet ($4/월)
- Vultr ($2.5/월)
- Cron Job으로 크롤링 실행

---

## 2. 자체 서버 배포 (VPS)

### ✅ 장점
- 완전한 제어권
- 크롤링/큐레이션 자동화 가능
- 커스터마이징 자유로움

### 📝 배포 단계

#### Step 1: VPS 서버 선택 및 생성
- **AWS EC2**: t2.micro (무료 티어)
- **DigitalOcean**: Droplet $4/월
- **Google Cloud**: e2-micro (무료 티어)
- **Vultr**: $2.5/월

권장 스펙:
- CPU: 1 vCPU 이상
- RAM: 1GB 이상 (권장 2GB)
- Storage: 25GB 이상
- OS: Ubuntu 22.04 LTS

#### Step 2: 서버 초기 설정
```bash
# SSH 접속
ssh root@your-server-ip

# 시스템 업데이트
apt update && apt upgrade -y

# 필수 패키지 설치
apt install -y curl git nginx certbot python3-certbot-nginx

# Node.js 설치 (v20)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# PM2 설치 (프로세스 관리자)
npm install -g pm2

# PostgreSQL 설치
apt install -y postgresql postgresql-contrib
```

#### Step 3: 데이터베이스 설정
```bash
# PostgreSQL 사용자 및 데이터베이스 생성
sudo -u postgres psql

# PostgreSQL 쉘에서:
CREATE DATABASE welfare_trends;
CREATE USER welfare_user WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE welfare_trends TO welfare_user;
\q
```

#### Step 4: 프로젝트 배포
```bash
# 프로젝트 디렉토리 생성
mkdir -p /var/www/welfare-trends
cd /var/www/welfare-trends

# Git 클론
git clone https://github.com/your-username/welfare-trends.git .

# 의존성 설치
npm install

# 환경 변수 설정
nano .env.local
```

`.env.local` 내용:
```
DATABASE_URL=postgresql://welfare_user:your-secure-password@localhost:5432/welfare_trends
OPENAI_API_KEY=sk-proj-...
JWT_SECRET=your-jwt-secret
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-nextauth-secret
NODE_ENV=production
```

#### Step 5: 데이터베이스 스키마 적용
```bash
psql -U welfare_user -d welfare_trends -f lib/auth-schema.sql
psql -U welfare_user -d welfare_trends -f lib/db-schema.sql
psql -U welfare_user -d welfare_trends -f lib/curation-schema.sql
psql -U welfare_user -d welfare_trends -f add_password_field.sql
```

#### Step 6: Next.js 빌드 및 실행
```bash
# 프로덕션 빌드
npm run build

# PM2로 실행
pm2 start npm --name "welfare-trends" -- start

# 부팅 시 자동 시작 설정
pm2 startup
pm2 save
```

#### Step 7: Nginx 리버스 프록시 설정
```bash
nano /etc/nginx/sites-available/welfare-trends
```

Nginx 설정:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 설정 활성화
ln -s /etc/nginx/sites-available/welfare-trends /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

#### Step 8: SSL/HTTPS 설정 (Let's Encrypt)
```bash
certbot --nginx -d your-domain.com
```

#### Step 9: 크롤링 자동화 (Cron Job)
```bash
crontab -e
```

Cron 설정:
```
# 매일 오전 3시 크롤링
0 3 * * * cd /var/www/welfare-trends && npm run crawl:all >> /var/log/crawl.log 2>&1

# 매일 오전 4시 큐레이션
0 4 * * * cd /var/www/welfare-trends && npm run curate >> /var/log/curate.log 2>&1

# 매주 일요일 오전 2시 데이터베이스 백업
0 2 * * 0 pg_dump welfare_trends > /var/backups/welfare_trends_$(date +\%Y\%m\%d).sql
```

#### Step 10: 모니터링 설정
```bash
# PM2 모니터링
pm2 monit

# 로그 확인
pm2 logs welfare-trends

# 서버 상태 확인
pm2 status
```

---

## 3. Docker 배포

### 📝 배포 파일 생성

#### `Dockerfile`
```dockerfile
FROM node:20-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### `docker-compose.yml`
```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: welfare-trends-db
    environment:
      POSTGRES_DB: welfare_trends
      POSTGRES_USER: welfare_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./lib/auth-schema.sql:/docker-entrypoint-initdb.d/1-auth-schema.sql
      - ./lib/db-schema.sql:/docker-entrypoint-initdb.d/2-db-schema.sql
      - ./lib/curation-schema.sql:/docker-entrypoint-initdb.d/3-curation-schema.sql
      - ./add_password_field.sql:/docker-entrypoint-initdb.d/4-add-password.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U welfare_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Next.js Application
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: welfare-trends-app
    environment:
      DATABASE_URL: postgresql://welfare_user:${DB_PASSWORD}@postgres:5432/welfare_trends
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      JWT_SECRET: ${JWT_SECRET}
      NEXTAUTH_URL: ${NEXTAUTH_URL}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

  # Crawler Scheduler (Optional)
  crawler:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: welfare-trends-crawler
    environment:
      DATABASE_URL: postgresql://welfare_user:${DB_PASSWORD}@postgres:5432/welfare_trends
      OPENAI_API_KEY: ${OPENAI_API_KEY}
    command: ["sh", "-c", "while true; do npm run crawl:all && npm run curate && sleep 86400; done"]
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

volumes:
  postgres_data:
```

#### `.dockerignore`
```
node_modules
.next
.git
.env.local
*.log
```

### 🚀 Docker 배포 실행
```bash
# .env 파일 생성
cat > .env << EOF
DB_PASSWORD=your-secure-password
OPENAI_API_KEY=sk-proj-...
JWT_SECRET=your-jwt-secret
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-nextauth-secret
EOF

# Docker Compose 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 상태 확인
docker-compose ps
```

---

## 환경 변수 설정

### 필수 환경 변수
```bash
# 데이터베이스
DATABASE_URL=postgresql://user:password@host:5432/database

# OpenAI API
OPENAI_API_KEY=sk-proj-...
OPENAI_BASE_URL=https://api.openai.com/v1  # Optional

# 인증
JWT_SECRET=your-secret-key-min-32-chars
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-nextauth-secret

# 환경
NODE_ENV=production
```

### 선택적 환경 변수
```bash
# 크롤링 설정
CRAWL_FREQUENCY=24  # 시간 단위

# 큐레이션 설정
CURATION_SIMILARITY_THRESHOLD=0.85
CURATION_MIN_IMPORTANCE=5
```

---

## 데이터베이스 설정

### 프로덕션 DB 설정 체크리스트
- [ ] 백업 자동화
- [ ] SSL/TLS 연결
- [ ] 접근 제어 (방화벽)
- [ ] 모니터링 설정
- [ ] 인덱스 최적화

### 백업 스크립트
```bash
#!/bin/bash
# backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/welfare-trends"
mkdir -p $BACKUP_DIR

pg_dump welfare_trends > $BACKUP_DIR/backup_$DATE.sql

# 7일 이상 오래된 백업 삭제
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete

echo "Backup completed: backup_$DATE.sql"
```

---

## 크롤링 자동화

### PM2 Ecosystem 설정
```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'welfare-trends',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'crawler',
      script: 'lib/scripts/crawl-scheduler.ts',
      interpreter: 'node_modules/.bin/tsx',
      cron_restart: '0 3 * * *',  // 매일 오전 3시
      autorestart: false
    },
    {
      name: 'curator',
      script: 'lib/scripts/run-curation.ts',
      interpreter: 'node_modules/.bin/tsx',
      cron_restart: '0 4 * * *',  // 매일 오전 4시
      autorestart: false
    }
  ]
};
```

```bash
# PM2로 실행
pm2 start ecosystem.config.js
```

---

## 모니터링 및 로깅

### 로그 설정
```javascript
// lib/logger.ts
import fs from 'fs';
import path from 'path';

const LOG_DIR = '/var/log/welfare-trends';

export function log(level: string, message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message} ${data ? JSON.stringify(data) : ''}`;
  
  console.log(logMessage);
  
  // 파일에도 기록
  const logFile = path.join(LOG_DIR, `${level}.log`);
  fs.appendFileSync(logFile, logMessage + '\n');
}
```

### PM2 모니터링
```bash
# 대시보드
pm2 monit

# 로그 보기
pm2 logs

# 상태 확인
pm2 status
```

---

## 성능 최적화

### Next.js 최적화
```javascript
// next.config.js
module.exports = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  
  // 이미지 최적화
  images: {
    domains: ['sspark.genspark.ai', 'edu.welfare.pe.kr'],
    formats: ['image/avif', 'image/webp'],
  },
  
  // 정적 페이지 재검증
  experimental: {
    isrMemoryCacheSize: 0,
  },
};
```

### PostgreSQL 최적화
```sql
-- 인덱스 확인
\di

-- 쿼리 성능 분석
EXPLAIN ANALYZE SELECT * FROM contents WHERE is_curated = TRUE;

-- 자동 VACUUM 설정
ALTER TABLE contents SET (autovacuum_enabled = true);
```

---

## 보안 체크리스트

- [ ] 환경 변수 파일 (.env) Git에 커밋하지 않기
- [ ] 데이터베이스 비밀번호 강력하게 설정
- [ ] JWT_SECRET 안전하게 생성 및 보관
- [ ] PostgreSQL 외부 접근 제한 (방화벽)
- [ ] SSL/HTTPS 적용
- [ ] 정기적인 보안 업데이트
- [ ] 백업 자동화
- [ ] 로그 모니터링

---

## 트러블슈팅

### 빌드 실패
```bash
# 캐시 삭제 후 재빌드
rm -rf .next node_modules
npm install
npm run build
```

### 데이터베이스 연결 오류
```bash
# PostgreSQL 상태 확인
sudo systemctl status postgresql

# 연결 테스트
psql "postgresql://user:password@host:5432/database"
```

### Puppeteer 오류 (크롤링)
```bash
# 필수 라이브러리 설치 (Ubuntu)
apt install -y chromium-browser chromium-chromedriver
```

---

## 추천 배포 방법

### 💰 예산별 추천
- **무료**: Vercel (프론트엔드) + Supabase (DB) + GitHub Actions (크롤링)
- **저예산 ($5~10/월)**: DigitalOcean Droplet (모든 것)
- **중간 예산 ($20~50/월)**: Vercel Pro + Managed PostgreSQL
- **고급**: AWS/GCP (완전 관리형)

### 🎯 상황별 추천
- **빠른 테스트**: Vercel
- **완전한 제어**: 자체 VPS
- **확장성**: Docker + Kubernetes
- **간편함**: Vercel + Supabase

---

**작성일**: 2025-12-25  
**버전**: 1.0.0  
**작성자**: Genspark AI Developer
