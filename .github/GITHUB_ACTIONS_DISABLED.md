# GitHub Actions 비활성화 안내

## 📌 중요

**모든 GitHub Actions 워크플로우가 비활성화되었습니다.**

이유:
- Vercel이 GitHub과 자동으로 연동되어 있어 수동 배포가 불필요합니다
- Vercel Cron Jobs가 크롤링/큐레이션을 자동으로 실행합니다
- GitHub Secrets 설정이 불필요합니다

## 🚫 비활성화된 워크플로우

### 1. `deploy.yml.disabled`
- **목적**: Production 배포
- **비활성화 이유**: Vercel이 `main` 브랜치 푸시 시 자동 배포
- **대체 방법**: Vercel 자동 배포

### 2. `crawl-and-curate.yml.disabled`
- **목적**: 매일 크롤링 및 큐레이션 실행
- **비활성화 이유**: Vercel Cron Jobs가 동일한 기능 제공
- **대체 방법**: Vercel Cron (`vercel.json` 설정)

## ✅ 현재 사용 중인 자동화

### Vercel 자동 배포
- **트리거**: `main` 브랜치에 푸시
- **동작**: 자동으로 빌드 및 배포
- **설정 위치**: Vercel Dashboard → Settings → Git

### Vercel Cron Jobs
- **크롤링**: 매일 UTC 18:00 (한국시간 오전 3:00)
- **큐레이션**: 매일 UTC 18:30 (한국시간 오전 3:30)
- **설정 위치**: `vercel.json`
- **가이드**: `VERCEL_CRON_SETUP.md` 참고

## 🔄 GitHub Actions 재활성화 방법

만약 GitHub Actions를 다시 활성화해야 한다면:

```bash
# 워크플로우 재활성화
mv .github/workflows/deploy.yml.disabled .github/workflows/deploy.yml
mv .github/workflows/crawl-and-curate.yml.disabled .github/workflows/crawl-and-curate.yml

# GitHub Secrets 설정 필요
# Settings → Secrets and variables → Actions
# - VERCEL_TOKEN
# - VERCEL_ORG_ID
# - VERCEL_PROJECT_ID
# - DATABASE_URL
# - OPENAI_API_KEY
# - OPENAI_BASE_URL
# - JWT_SECRET
# - NEXTAUTH_URL
# - NEXTAUTH_SECRET
# - CRON_SECRET
```

## 📚 관련 문서

- **Vercel 배포**: 자동으로 작동 (설정 불필요)
- **Vercel Cron**: `VERCEL_CRON_SETUP.md`
- **환경 변수**: Vercel Dashboard → Settings → Environment Variables

---

**결론**: GitHub Actions 설정이나 관리가 필요 없습니다. Vercel이 모든 것을 자동으로 처리합니다! 🚀
