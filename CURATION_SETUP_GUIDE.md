# 🤖 AI 콘텐츠 큐레이션 시스템 설치 및 사용 가이드

## 📋 목차
1. [시스템 개요](#시스템-개요)
2. [데이터베이스 설정](#데이터베이스-설정)
3. [환경 변수 설정](#환경-변수-설정)
4. [샘플 데이터 생성](#샘플-데이터-생성)
5. [큐레이션 실행](#큐레이션-실행)
6. [결과 확인](#결과-확인)
7. [자동화 설정](#자동화-설정)

---

## 시스템 개요

### 🎯 목적
- 크롤링된 대량의 콘텐츠를 AI로 분석하여 **유사한 것은 병합**하고 **중요한 것만 선별**
- 여러 출처의 정보를 하나의 **통합 요약**으로 제공
- 관련 자료를 자동으로 **링크**하여 정보 탐색 효율 극대화

### 🔄 워크플로우
```
크롤링 데이터 수집
    ↓
raw_crawled_contents 테이블 저장
    ↓
AI 큐레이션 파이프라인 실행
    ├─ OpenAI Embeddings로 유사도 계산
    ├─ 유사 콘텐츠 자동 그룹화
    ├─ GPT-4로 중요도 평가 (1-10점)
    ├─ 통합 요약 생성
    └─ 주요 포인트 추출
    ↓
curation_groups 테이블 저장
    ↓
contents 테이블에 최종 큐레이션 콘텐츠 저장
    ↓
사용자에게 표시
```

### 📊 예상 효과
- **100개 기사** → **15-20개 큐레이션 콘텐츠**
- 정보 탐색 시간 **80% 감소**
- 중복 제거 및 핵심 내용만 제공

---

## 데이터베이스 설정

### 1. 큐레이션 스키마 설치

```bash
# PostgreSQL 접속
psql -U postgres -d welfare_trends

# 큐레이션 스키마 실행
\i /home/user/webapp/welfare-trends/lib/curation-schema.sql
```

### 2. 생성되는 테이블

#### `curation_groups` (큐레이션 그룹)
```sql
CREATE TABLE curation_groups (
  id UUID PRIMARY KEY,
  title VARCHAR(500),           -- 그룹 대표 제목
  theme VARCHAR(200),            -- 주제
  category VARCHAR(50),          -- academy, policy, 등
  importance_score INTEGER,      -- 1-10 중요도
  ai_summary TEXT,               -- AI 통합 요약
  key_points TEXT[],             -- 주요 포인트
  content_count INTEGER,         -- 통합된 원본 수
  source_urls TEXT[],            -- 원본 URL들
  tags TEXT[],
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### `raw_crawled_contents` (원본 크롤링 데이터)
```sql
CREATE TABLE raw_crawled_contents (
  id UUID PRIMARY KEY,
  title VARCHAR(500),
  summary TEXT,
  full_content TEXT,
  category VARCHAR(50),
  source VARCHAR(100),
  source_url TEXT,
  published_at TIMESTAMP,
  crawled_at TIMESTAMP,
  tags TEXT[],
  is_processed BOOLEAN DEFAULT FALSE,  -- 큐레이션 처리 완료 여부
  curation_group_id UUID
);
```

#### `contents` 테이블 확장
```sql
-- 기존 테이블에 큐레이션 필드 추가
ALTER TABLE contents ADD COLUMN curation_group_id UUID;
ALTER TABLE contents ADD COLUMN importance_score INTEGER;
ALTER TABLE contents ADD COLUMN is_curated BOOLEAN DEFAULT FALSE;
ALTER TABLE contents ADD COLUMN ai_summary TEXT;
ALTER TABLE contents ADD COLUMN key_points TEXT[];
ALTER TABLE contents ADD COLUMN source_count INTEGER DEFAULT 1;
ALTER TABLE contents ADD COLUMN original_content_ids UUID[];
```

---

## 환경 변수 설정

### `.env.local` 파일 생성

```bash
# PostgreSQL 연결
DATABASE_URL=postgresql://postgres:password@localhost:5432/welfare_trends

# OpenAI API (필수)
OPENAI_API_KEY=sk-proj-...your-key...
OPENAI_BASE_URL=https://api.openai.com/v1

# JWT 시크릿
JWT_SECRET=your-jwt-secret-key-here
```

### OpenAI API 키 발급
1. https://platform.openai.com 접속
2. API Keys 메뉴에서 새 키 생성
3. `.env.local`에 `OPENAI_API_KEY` 설정

---

## 샘플 데이터 생성

### 테스트용 크롤링 데이터 삽입

```bash
cd /home/user/webapp/welfare-trends

# 샘플 데이터 생성 (10개 콘텐츠)
npm run seed:sample
```

### 샘플 데이터 내용
- **정책동향 - 기초연금 인상** 관련 5개 기사 (유사 콘텐츠)
- **정책동향 - 노인 돌봄 서비스** 관련 3개 기사 (유사 콘텐츠)
- **사회서비스원 - 경기도** 관련 2개 기사

---

## 큐레이션 실행

### 1. 전체 카테고리 큐레이션

```bash
cd /home/user/webapp/welfare-trends

# 모든 미처리 콘텐츠 큐레이션 (중요도 5점 이상)
npm run curate
```

### 2. 특정 카테고리만 처리

```bash
# 정책동향만 처리
npm run curate:policy

# 사회서비스원만 처리
npm run curate:social
```

### 3. 테스트 모드 (소량)

```bash
# 최근 20개만 처리
npm run curate:test
```

### 4. 고급 옵션

```bash
# 카테고리 지정
npm run curate -- --category=policy

# 처리 개수 제한
npm run curate -- --limit=50

# 유사도 임계값 조정 (0.0 ~ 1.0)
npm run curate -- --similarity=0.90

# 최소 중요도 설정
npm run curate -- --min-importance=7
```

---

## 결과 확인

### 1. 터미널 출력 예시

```
===========================================================
  🤖 AI Content Curation Pipeline
===========================================================

📊 Starting curation with options:
{
  "category": undefined,
  "limit": undefined,
  "similarityThreshold": 0.85,
  "minImportanceScore": 5
}

[DB Curator] Fetched 10 unprocessed contents
[Curator] Grouping 10 contents...
[Curator] Created 3 groups from 10 contents
[Curator] Processing group 1/3...
[Curator] Group 1 completed (importance: 9)
[Curator] Processing group 2/3...
[Curator] Group 2 completed (importance: 8)
[Curator] Processing group 3/3...
[Curator] Group 3 completed (importance: 7)
[Curator] Pipeline completed: 3 curated groups created

===========================================================
  ✅ Curation Completed
===========================================================

⏱️  Elapsed time: 45.3s
📥 Processed contents: 10
📦 Curated groups: 3
💾 Saved content IDs: 3

Saved Content IDs:
  - f47ac10b-58cc-4372-a567-0e02b2c3d479
  - 550e8400-e29b-41d4-a716-446655440000
  - 6ba7b810-9dad-11d1-80b4-00c04fd430c8

===========================================================
  📈 Curation Statistics
===========================================================

📊 Curation Groups by Category:

┌─────────┬──────────────┬────────────────┬───────────────────────┬───────────────────────────┬─────────────┬──────────────────────┐
│ (index) │   category   │ total_groups   │   avg_importance      │ total_source_contents     │ high_importance_count │    today_count       │
├─────────┼──────────────┼────────────────┼───────────────────────┼───────────────────────────┼───────────────────────┼──────────────────────┤
│    0    │  'policy'    │      '2'       │       '8.5'           │          '8'              │           '1'         │         '2'          │
│    1    │'social-service'│    '1'       │       '7.0'           │          '2'              │           '0'         │         '1'          │
└─────────┴──────────────┴────────────────┴───────────────────────┴───────────────────────────┴───────────────────────┴──────────────────────┘

📦 Raw Content Processing Status:

┌─────────┬──────────────┬───────────┬─────────────────┬───────────────┬──────────────────────┐
│ (index) │   category   │ total_raw │ processed_count │ pending_count │    last_crawled      │
├─────────┼──────────────┼───────────┼─────────────────┼───────────────┼──────────────────────┤
│    0    │  'policy'    │   '8'     │      '8'        │      '0'      │  '2025-12-25T...'    │
│    1    │'social-service'│ '2'     │      '2'        │      '0'      │  '2025-12-25T...'    │
└─────────┴──────────────┴───────────┴─────────────────┴───────────────┴──────────────────────┘
```

### 2. 데이터베이스에서 직접 확인

```sql
-- 큐레이션 그룹 조회
SELECT 
  id,
  title,
  category,
  importance_score,
  content_count,
  array_length(key_points, 1) as key_point_count,
  created_at
FROM curation_groups
ORDER BY importance_score DESC, created_at DESC;

-- 큐레이션된 최종 콘텐츠 조회
SELECT 
  id,
  title,
  importance_score,
  source_count,
  is_curated,
  created_at
FROM contents
WHERE is_curated = TRUE
ORDER BY importance_score DESC, created_at DESC;

-- 통계 뷰 조회
SELECT * FROM curation_stats;
```

### 3. API를 통한 조회

```bash
# 큐레이션된 콘텐츠 목록 조회
curl http://localhost:3000/api/contents?curated=true

# 특정 카테고리의 큐레이션 콘텐츠
curl http://localhost:3000/api/contents?category=policy&curated=true

# 중요도 높은 순으로 정렬
curl http://localhost:3000/api/contents?curated=true&sort=importance
```

---

## 자동화 설정

### 1. 크롤링 → 큐레이션 파이프라인

#### 방법 A: npm scripts 연결
```json
// package.json
{
  "scripts": {
    "pipeline": "npm run crawl:all && npm run curate"
  }
}
```

```bash
# 실행
npm run pipeline
```

#### 방법 B: Shell Script
```bash
#!/bin/bash
# pipeline.sh

echo "Starting crawl + curation pipeline..."

# 1. 크롤링
echo "Step 1: Crawling..."
npm run crawl:all

# 2. 큐레이션
echo "Step 2: Curation..."
npm run curate

echo "Pipeline completed!"
```

```bash
chmod +x pipeline.sh
./pipeline.sh
```

### 2. Cron Job 설정 (매일 자동 실행)

```bash
# crontab 편집
crontab -e

# 매일 오전 3시에 파이프라인 실행
0 3 * * * cd /home/user/webapp/welfare-trends && npm run pipeline >> /var/log/curation.log 2>&1

# 매일 오전 3시 크롤링, 오전 4시 큐레이션
0 3 * * * cd /home/user/webapp/welfare-trends && npm run crawl:all >> /var/log/crawl.log 2>&1
0 4 * * * cd /home/user/webapp/welfare-trends && npm run curate >> /var/log/curate.log 2>&1
```

### 3. Node.js 스케줄러 (node-cron)

```bash
npm install node-cron
```

```typescript
// lib/scripts/scheduler.ts
import cron from 'node-cron';
import { runCurationPipeline } from '../db-curator';

// 매일 오전 3시에 큐레이션 실행
cron.schedule('0 3 * * *', async () => {
  console.log('[Scheduler] Starting daily curation...');
  
  try {
    const result = await runCurationPipeline();
    console.log('[Scheduler] Curation completed:', result);
  } catch (error) {
    console.error('[Scheduler] Curation failed:', error);
  }
});

console.log('[Scheduler] Curation scheduler started');
```

---

## 📊 비용 예상

### OpenAI API 사용량 (예상)
- **Embeddings** (text-embedding-3-small)
  - 비용: $0.02 / 1M tokens
  - 100개 기사 × 500 tokens = 50,000 tokens
  - **월 비용: ~$1**

- **GPT-4o-mini** (요약 생성)
  - 비용: $0.15 / 1M input, $0.60 / 1M output
  - 20개 그룹 × (2,000 input + 500 output) = 50,000 tokens
  - **월 비용: ~$0.30**

### 총 예상 비용
- **일 1회 크롤링 기준**: **월 $1.3 ~ $2**
- **일 2회 크롤링 기준**: **월 $2.6 ~ $4**

---

## ✅ 체크리스트

- [ ] PostgreSQL 데이터베이스 생성
- [ ] `lib/curation-schema.sql` 실행
- [ ] `.env.local`에 `DATABASE_URL` 설정
- [ ] `.env.local`에 `OPENAI_API_KEY` 설정
- [ ] `npm run seed:sample` 실행 (샘플 데이터)
- [ ] `npm run curate:test` 실행 (테스트)
- [ ] 결과 확인 (터미널 및 DB)
- [ ] 실제 크롤링 데이터로 테스트
- [ ] Cron Job 또는 스케줄러 설정 (자동화)

---

## 🔧 트러블슈팅

### OpenAI API 오류
```
Error: Invalid API key
```
→ `.env.local`의 `OPENAI_API_KEY` 확인

### 데이터베이스 연결 오류
```
Error: connect ECONNREFUSED
```
→ PostgreSQL이 실행 중인지 확인: `sudo systemctl status postgresql`
→ `DATABASE_URL` 주소와 포트 확인

### 큐레이션 결과가 없음
```
Curation completed: 0 curated groups
```
→ `raw_crawled_contents` 테이블에 `is_processed = FALSE` 데이터가 있는지 확인
→ 중요도 임계값을 낮춰서 실행: `npm run curate -- --min-importance=3`

### 유사 콘텐츠가 너무 많이 묶임
→ 유사도 임계값을 높임: `npm run curate -- --similarity=0.90`

### 유사 콘텐츠가 전혀 묶이지 않음
→ 유사도 임계값을 낮춤: `npm run curate -- --similarity=0.75`

---

## 📚 참고 문서

- `CURATION_SYSTEM_PLAN.md` - 시스템 설계 문서
- `lib/ai-curator.ts` - 핵심 AI 로직
- `lib/db-curator.ts` - DB 연동 로직
- `lib/curation-schema.sql` - 데이터베이스 스키마

---

**작성일**: 2025-12-25  
**버전**: 1.0.0  
**작성자**: Genspark AI Developer
