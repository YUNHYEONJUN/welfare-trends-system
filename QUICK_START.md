# 🚀 빠른 시작 가이드

경기북서부노인보호전문기관 복지동향 시스템 크롤링 기능

---

## 📌 두 가지 크롤링 방법

### 1️⃣ 수동 크롤링 (내가 원할 때)

```bash
cd /home/user/webapp/welfare-trends

# 전체 크롤링
npm run crawl:all

# 사회서비스원만
npm run crawl:social-service

# 메뉴에서 선택
npm run crawl:manual
```

### 2️⃣ 자동 크롤링 (매일 자동)

```bash
# 스케줄러 시작 (기본: 매일 오전 9시)
npm run crawl:schedule

# 또는 PM2로 백그라운드 실행
npm install -g pm2
pm2 start npm --name "복지동향-크롤러" -- run crawl:schedule
pm2 save
```

---

## ⏰ 자동 크롤링 시간 설정

`.env.local` 파일 수정:

```env
CRAWL_HOUR=9      # 시 (0-23)
CRAWL_MINUTE=0    # 분 (0-59)
```

예시:
- 오전 9시: `CRAWL_HOUR=9, CRAWL_MINUTE=0`
- 오후 2시 30분: `CRAWL_HOUR=14, CRAWL_MINUTE=30`
- 자정: `CRAWL_HOUR=0, CRAWL_MINUTE=0`

---

## 🔄 Cron으로 자동화

```bash
crontab -e

# 매일 오전 9시
0 9 * * * cd /home/user/webapp/welfare-trends && npm run crawl:once

# 매일 오전 9시, 오후 6시
0 9,18 * * * cd /home/user/webapp/welfare-trends && npm run crawl:once
```

---

## 📊 로그 확인

```bash
# 오늘 로그
cat logs/crawl-$(date +%Y-%m-%d).log

# 실시간 로그
tail -f logs/crawl-$(date +%Y-%m-%d).log
```

---

## 🎯 권장 설정

| 환경 | 방법 | 명령어 |
|------|------|--------|
| **개발/테스트** | 수동 실행 | `npm run crawl:manual` |
| **프로덕션 서버** | PM2 백그라운드 | `pm2 start npm --name crawler -- run crawl:schedule` |
| **간단한 서버** | Cron Job | `crontab -e` 후 추가 |

---

## 📞 더 알아보기

- 📖 [README_CRAWLING.md](./README_CRAWLING.md) - 사용법 요약
- 📘 [CRAWLING_GUIDE.md](./CRAWLING_GUIDE.md) - 전체 가이드

---

**지금 바로 시작하세요!**

```bash
npm run crawl:all
```
