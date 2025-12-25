# 🤖 크롤링 기능 사용법

경기북서부노인보호전문기관 복지동향 시스템의 크롤링 기능을 쉽게 사용하는 방법입니다.

---

## ⚡ 빠른 시작

### 1️⃣ 수동 크롤링 (내가 원할 때 실행)

```bash
cd /home/user/webapp/welfare-trends

# 전체 크롤링 (모든 소스)
npm run crawl:all

# 사회서비스원만
npm run crawl:social-service

# 메뉴에서 선택하기
npm run crawl:manual
```

### 2️⃣ 자동 크롤링 (매일 정해진 시간에 실행)

```bash
# 스케줄러 시작 (계속 실행됨)
npm run crawl:schedule

# 또는 PM2로 백그라운드 실행
pm2 start npm --name "복지동향-크롤러" -- run crawl:schedule
pm2 save
```

**기본 설정: 매일 오전 9시 자동 실행**

---

## 📋 명령어 목록

| 명령어 | 설명 | 실행 시간 |
|--------|------|-----------|
| `npm run crawl:all` | 모든 소스 크롤링 | ~3분 |
| `npm run crawl:social-service` | 사회서비스원 17개 지역 | ~2분 |
| `npm run crawl:manual` | 대화형 메뉴 (선택 가능) | - |
| `npm run crawl:schedule` | 스케줄러 시작 | 계속 실행 |
| `npm run crawl:once` | 한 번만 실행 (로그 저장) | ~3분 |

---

## ⚙️ 자동 크롤링 시간 변경

`.env.local` 파일 수정:

```env
# 매일 오후 2시 30분에 실행
CRAWL_HOUR=14
CRAWL_MINUTE=30
```

---

## 📁 수집되는 데이터

### 1. 사회서비스원 (17개 지역)
- ✅ 서울, 경기, 부산, 인천, 대구, 광주, 대전, 울산, 세종
- ✅ 강원, 충북, 충남, 전북, 전남, 경북, 경남, 제주

### 2. 기타 기관
- ✅ 보건복지부
- ✅ 경기도
- ✅ 경기도 31개 시군
- ✅ 기타 복지 관련 기관

---

## 🔄 Cron으로 자동화 (Linux/Mac)

매일 오전 9시에 자동 실행:

```bash
# crontab 열기
crontab -e

# 아래 줄 추가
0 9 * * * cd /home/user/webapp/welfare-trends && npm run crawl:once
```

**다양한 스케줄:**
- `0 9 * * *` - 매일 오전 9시
- `0 9,18 * * *` - 매일 오전 9시, 오후 6시
- `0 */6 * * *` - 매 6시간마다
- `0 9 * * 1-5` - 평일 오전 9시만

---

## 📊 로그 확인

크롤링 로그는 `logs/` 폴더에 자동 저장됩니다:

```bash
# 오늘 로그 보기
cat logs/crawl-2025-12-25.log

# 실시간 로그 보기
tail -f logs/crawl-$(date +%Y-%m-%d).log

# 모든 로그 목록
ls -lh logs/
```

---

## 🎯 사용 시나리오

### 시나리오 1: 개발 중
```bash
# 필요할 때만 수동 실행
npm run crawl:manual
```

### 시나리오 2: 프로덕션 서버
```bash
# PM2로 백그라운드 자동 실행
pm2 start npm --name "welfare-crawler" -- run crawl:schedule
pm2 save
pm2 startup  # 서버 재부팅 시 자동 시작
```

### 시나리오 3: 간단한 서버
```bash
# Cron으로 매일 실행
crontab -e
# 추가: 0 9 * * * cd /home/user/webapp/welfare-trends && npm run crawl:once
```

---

## ⚠️ 주의사항

1. **첫 실행 시**: 크롤링 소스 URL이 실제로 접근 가능한지 확인하세요
2. **네트워크**: 안정적인 인터넷 연결 필요
3. **로봇 정책**: 각 사이트의 robots.txt 준수
4. **API 부하**: 크롤링 간 1초 딜레이 자동 적용

---

## 🛠️ 문제 해결

### 크롤링이 안 되는 경우

```bash
# 1. 네트워크 확인
ping google.com

# 2. Node.js 버전 확인 (18 이상 필요)
node --version

# 3. 의존성 재설치
npm install

# 4. 로그 확인
cat logs/crawl-$(date +%Y-%m-%d).log
```

### PM2가 없는 경우

```bash
# 전역 설치
npm install -g pm2

# 확인
pm2 --version
```

---

## 📞 더 자세한 가이드

자세한 설정 및 고급 기능은 [CRAWLING_GUIDE.md](./CRAWLING_GUIDE.md)를 참고하세요.

---

## ✅ 체크리스트

실행하기 전에 확인하세요:

- [ ] Node.js 설치됨 (v18+)
- [ ] `npm install` 완료
- [ ] `.env.local` 파일 존재
- [ ] 인터넷 연결 정상
- [ ] (선택) PostgreSQL 설치 및 DATABASE_URL 설정

---

**이제 크롤링을 시작하세요! 🚀**

```bash
npm run crawl:all
```
