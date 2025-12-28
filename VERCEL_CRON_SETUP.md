# Vercel Cron 설정 가이드

## 📋 개요

이 프로젝트는 **Vercel Cron Jobs**를 사용하여 매일 자동으로 크롤링과 AI 큐레이션을 실행합니다.

## ⏰ 스케줄

- **크롤링**: 매일 UTC 18:00 (한국 시간 오전 3:00)
- **큐레이션**: 매일 UTC 18:30 (한국 시간 오전 3:30)

## 🔧 설정 확인

### 1. Vercel Cron 활성화 확인

Vercel 프로젝트 대시보드에서:

1. **Settings** → **Cron Jobs** 탭으로 이동
2. 다음 2개의 Cron Job이 활성화되어 있는지 확인:
   - `/api/cron/crawl` - `0 18 * * *`
   - `/api/cron/curate` - `30 18 * * *`

### 2. 환경 변수 확인

**Settings** → **Environment Variables**에서 다음 변수들이 설정되어 있는지 확인:

#### 필수 환경 변수

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `DATABASE_URL` | Neon PostgreSQL 연결 문자열 | `postgresql://...` |
| `OPENAI_API_KEY` | OpenAI API 키 | `sk-proj-...` |
| `OPENAI_BASE_URL` | OpenAI API 베이스 URL | `https://api.openai.com/v1` |
| `CRON_SECRET` | Cron 인증용 시크릿 키 | `DVOKqd8p1BVUcLXisj7l4jnMZBZ/2Xe/aho2QGVCO8k=` |

#### 기타 환경 변수

| 변수명 | 값 |
|--------|-----|
| `JWT_SECRET` | `dXpUR+oiq3+xeDuF3QHQlYxVU1mxwl/+FfBt/XUIwns=` |
| `NEXTAUTH_URL` | `https://welfare-trends-system.vercel.app` |
| `NEXTAUTH_SECRET` | `8f7MnS6RwVF5QNuR+IyWbHMlLktMI6f82X+3mX+YaGk=` |
| `NODE_ENV` | `production` |

### 3. CRON_SECRET 확인

현재 설정된 CRON_SECRET:
```
DVOKqd8p1BVUcLXisj7l4jnMZBZ/2Xe/aho2QGVCO8k=
```

이 값이 Vercel 환경 변수에 정확히 설정되어 있어야 합니다.

## 🧪 수동 테스트

### 로컬에서 테스트

1. **크롤링 테스트**:
   ```bash
   curl -X POST https://welfare-trends-system.vercel.app/api/cron/crawl \
     -H "Authorization: Bearer DVOKqd8p1BVUcLXisj7l4jnMZBZ/2Xe/aho2QGVCO8k="
   ```

2. **큐레이션 테스트**:
   ```bash
   curl -X POST https://welfare-trends-system.vercel.app/api/cron/curate \
     -H "Authorization: Bearer DVOKqd8p1BVUcLXisj7l4jnMZBZ/2Xe/aho2QGVCO8k="
   ```

### Vercel 대시보드에서 테스트

1. **Functions** 탭으로 이동
2. 각 Cron 함수 클릭
3. **Logs** 탭에서 실행 로그 확인

## 📊 모니터링

### Vercel Logs

1. Vercel 대시보드 → **Functions** 탭
2. `/api/cron/crawl` 또는 `/api/cron/curate` 클릭
3. **Logs** 탭에서 실행 기록 확인

### 성공 로그 예시

```
✓ Crawl completed successfully
✓ Curation completed successfully
Elapsed: 234567ms
```

### 오류 로그 예시

```
❌ Error: Unauthorized
❌ Error: DATABASE_URL is not defined
❌ Error: OpenAI API key not found
```

## 🚨 문제 해결

### 1. 401 Unauthorized

**원인**: CRON_SECRET이 잘못되었거나 설정되지 않음

**해결**:
1. Vercel Settings → Environment Variables
2. `CRON_SECRET` 값 확인
3. 정확한 값: `DVOKqd8p1BVUcLXisj7l4jnMZBZ/2Xe/aho2QGVCO8k=`

### 2. DATABASE_URL is not defined

**원인**: 데이터베이스 환경 변수가 설정되지 않음

**해결**:
1. Vercel Settings → Environment Variables
2. `DATABASE_URL` 추가
3. Neon PostgreSQL 연결 문자열 입력

### 3. OpenAI API Error

**원인**: OpenAI API 키가 없거나 잘못됨

**해결**:
1. Vercel Settings → Environment Variables
2. `OPENAI_API_KEY` 확인
3. `OPENAI_BASE_URL` 확인

### 4. 크롤링이 실행되지 않음

**원인**: Vercel Cron이 활성화되지 않음

**해결**:
1. Vercel Settings → Cron Jobs
2. 2개의 Cron Job이 모두 활성화되어 있는지 확인
3. 비활성화되어 있다면 `vercel.json` 파일 확인 후 재배포

## 📝 참고

### vercel.json 설정

```json
{
  "crons": [
    {
      "path": "/api/cron/crawl",
      "schedule": "0 18 * * *"
    },
    {
      "path": "/api/cron/curate",
      "schedule": "30 18 * * *"
    }
  ],
  "functions": {
    "app/api/cron/**": {
      "maxDuration": 300
    }
  }
}
```

### 실행 시간

- **크롤링**: 약 2-5분
- **큐레이션**: 약 3-10분 (콘텐츠 양에 따라 다름)
- **최대 실행 시간**: 5분 (Vercel Pro 제한)

### 비용

- **Vercel Pro**: $20/월
- **OpenAI API**: 약 $0.33 - $1.32/월
  - text-embedding-3-small: $0.02 / 1M tokens
  - gpt-4o-mini: $0.15 / 1M input tokens

## 🔄 GitHub Actions 비활성화

GitHub Actions의 중복 실행을 방지하기 위해 워크플로우가 비활성화되었습니다:

- 파일: `.github/workflows/crawl-and-curate.yml.disabled`

Vercel Cron을 사용하는 것이 더 안정적이고 효율적입니다.

## 📞 지원

문제가 발생하면 다음을 확인하세요:

1. Vercel 환경 변수가 모두 설정되어 있는지
2. Neon 데이터베이스가 정상 작동하는지
3. OpenAI API 키가 유효한지
4. Vercel Logs에서 오류 메시지 확인

---

**마지막 업데이트**: 2024-12-25
