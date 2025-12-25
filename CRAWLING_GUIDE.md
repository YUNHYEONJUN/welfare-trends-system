# 크롤링 가이드

경기북서부노인보호전문기관 복지동향 시스템의 크롤링 기능 사용 가이드입니다.

## 📋 목차

1. [수동 크롤링](#1-수동-크롤링)
2. [자동 크롤링 (스케줄러)](#2-자동-크롤링-스케줄러)
3. [고급 설정](#3-고급-설정)
4. [트러블슈팅](#4-트러블슈팅)

---

## 1. 수동 크롤링

### 1.1 전체 크롤링 (모든 소스)

```bash
cd /home/user/webapp/welfare-trends
npm run crawl:all
```

**수집 대상:**
- ✅ 보건복지부
- ✅ 경기도
- ✅ 경기도 31개 시군
- ✅ 전국 17개 사회서비스원

**예상 실행 시간:** 약 2-5분

---

### 1.2 사회서비스원만 크롤링

```bash
cd /home/user/webapp/welfare-trends
npm run crawl:social-service
```

**수집 대상:**
- 서울특별시사회서비스원
- 경기도사회서비스원
- 부산광역시사회서비스원
- 인천광역시사회서비스원
- 대구광역시사회서비스원
- 광주광역시사회서비스원
- 대전광역시사회서비스원
- 울산광역시사회서비스원
- 세종특별자치시사회서비스원
- 강원특별자치도사회서비스원
- 충청북도사회서비스원
- 충청남도사회서비스원
- 전북특별자치도사회서비스원
- 전라남도사회서비스원
- 경상북도사회서비스원
- 경상남도사회서비스원
- 제주특별자치도사회서비스원

**예상 실행 시간:** 약 1-2분

---

### 1.3 특정 지역만 크롤링

```bash
# 경기도 사회서비스원만
npm run crawl:social-service -- --region=경기도

# 서울 사회서비스원만
npm run crawl:social-service -- --region=서울특별시
```

---

### 1.4 대화형 수동 크롤링

메뉴 기반으로 원하는 소스만 선택해서 크롤링:

```bash
npm run crawl:manual
```

**기능:**
- 전체 크롤링
- 사회서비스원만
- 카테고리별 크롤링 (정책/학술/짧은생각)
- 개별 소스 선택
- 특정 지역 선택

---

## 2. 자동 크롤링 (스케줄러)

### 2.1 스케줄러 시작 (계속 실행)

```bash
cd /home/user/webapp/welfare-trends
npm run crawl:schedule
```

**동작 방식:**
- 매일 정해진 시간에 자동으로 크롤링 실행
- 기본값: **매일 오전 9시**
- 크롤링 로그 자동 저장 (`logs/` 디렉토리)
- 프로세스가 종료될 때까지 계속 실행

---

### 2.2 단발성 자동 크롤링 (한 번만 실행)

```bash
npm run crawl:once
```

**용도:**
- 스케줄러 로직 테스트
- 수동으로 전체 크롤링 + 로그 저장
- cron job에서 호출

---

### 2.3 Cron 등록 (Linux/Mac)

#### 방법 1: Crontab 사용

```bash
# crontab 편집
crontab -e

# 매일 오전 9시에 실행
0 9 * * * cd /home/user/webapp/welfare-trends && npm run crawl:once

# 매일 오전 9시, 오후 6시에 실행
0 9,18 * * * cd /home/user/webapp/welfare-trends && npm run crawl:once

# 매 6시간마다 실행 (0시, 6시, 12시, 18시)
0 */6 * * * cd /home/user/webapp/welfare-trends && npm run crawl:once
```

#### 방법 2: systemd 타이머 (권장)

**서비스 파일 생성:** `/etc/systemd/system/welfare-crawl.service`

```ini
[Unit]
Description=Welfare Trends Crawler
After=network.target

[Service]
Type=oneshot
User=your-username
WorkingDirectory=/home/user/webapp/welfare-trends
ExecStart=/usr/bin/npm run crawl:once
Environment="NODE_ENV=production"

[Install]
WantedBy=multi-user.target
```

**타이머 파일 생성:** `/etc/systemd/system/welfare-crawl.timer`

```ini
[Unit]
Description=Run Welfare Crawler Daily

[Timer]
OnCalendar=daily
OnCalendar=*-*-* 09:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

**활성화:**

```bash
sudo systemctl daemon-reload
sudo systemctl enable welfare-crawl.timer
sudo systemctl start welfare-crawl.timer

# 상태 확인
sudo systemctl status welfare-crawl.timer
sudo systemctl list-timers
```

---

### 2.4 PM2로 스케줄러 관리 (Node.js)

#### PM2 설치

```bash
npm install -g pm2
```

#### 스케줄러 시작

```bash
cd /home/user/webapp/welfare-trends
pm2 start npm --name "welfare-scheduler" -- run crawl:schedule
```

#### 관리 명령어

```bash
# 상태 확인
pm2 status

# 로그 확인
pm2 logs welfare-scheduler

# 재시작
pm2 restart welfare-scheduler

# 중지
pm2 stop welfare-scheduler

# 삭제
pm2 delete welfare-scheduler

# 부팅 시 자동 시작 설정
pm2 startup
pm2 save
```

---

## 3. 고급 설정

### 3.1 크롤링 시간 변경

`.env.local` 파일 수정:

```env
# 매일 오후 2시 30분에 실행
CRAWL_HOUR=14
CRAWL_MINUTE=30

# 스케줄러 시작 시 즉시 한 번 실행
CRAWL_RUN_IMMEDIATELY=true
```

---

### 3.2 로그 확인

크롤링 로그는 자동으로 저장됩니다:

```bash
# 오늘 로그 확인
cat logs/crawl-2025-12-25.log

# 최근 로그 확인
tail -f logs/crawl-$(date +%Y-%m-%d).log

# 전체 로그 목록
ls -lh logs/
```

---

### 3.3 크롤링 소스 추가

`lib/crawler.ts` 파일의 `crawlerConfigs` 배열에 추가:

```typescript
export const crawlerConfigs: CrawlerConfig[] = [
  // ... 기존 설정들 ...
  
  // 새로운 소스 추가
  {
    url: 'https://example.com/notice',
    category: 'policy',
    source: '새로운 기관',
    selector: {
      container: '.board-list tr',
      title: '.title',
      link: 'a',
      date: '.date',
      summary: '.summary',  // 선택사항
    },
  },
];
```

---

### 3.4 에러 핸들링

크롤링 중 일부 소스가 실패해도 전체 작업은 계속됩니다:

```bash
[1/50] ✓ 보건복지부 - 15개 수집
[2/50] ✗ 경기도 - 오류 발생
[3/50] ✓ 수원시 - 8개 수집
...
```

---

## 4. 트러블슈팅

### 4.1 크롤링이 실패하는 경우

**원인:**
- 네트워크 연결 문제
- 대상 웹사이트 구조 변경
- Timeout 발생

**해결:**
1. 인터넷 연결 확인
2. 대상 사이트가 접속 가능한지 확인
3. `lib/crawler.ts`의 selector 확인

---

### 4.2 스케줄러가 실행되지 않는 경우

**확인 사항:**
1. `.env.local` 파일 존재 여부
2. `CRAWL_HOUR`, `CRAWL_MINUTE` 값 확인
3. 프로세스가 실행 중인지 확인 (`pm2 status` 또는 `ps aux | grep node`)

---

### 4.3 로그가 저장되지 않는 경우

```bash
# logs 디렉토리 생성
mkdir -p /home/user/webapp/welfare-trends/logs

# 권한 확인
ls -ld logs/
chmod 755 logs/
```

---

### 4.4 메모리 부족

크롤링이 많은 메모리를 사용할 경우:

```bash
# Node.js 메모리 제한 늘리기
NODE_OPTIONS="--max-old-space-size=4096" npm run crawl:all
```

---

## 5. 권장 설정

### 일반적인 사용 시나리오

**시나리오 1: 개발/테스트 환경**
```bash
# 수동으로 필요할 때만 실행
npm run crawl:manual
```

**시나리오 2: 프로덕션 환경 (서버)**
```bash
# PM2로 스케줄러 실행 (매일 자동)
pm2 start npm --name "welfare-scheduler" -- run crawl:schedule
pm2 save
```

**시나리오 3: Cron Job (간단한 서버)**
```bash
# crontab에 등록 (매일 오전 9시)
0 9 * * * cd /home/user/webapp/welfare-trends && npm run crawl:once >> logs/cron.log 2>&1
```

---

## 6. 성능 최적화

### 6.1 병렬 처리 (고급)

현재는 순차적으로 크롤링하지만, 병렬 처리로 속도 향상 가능:

```typescript
// lib/scripts/crawl-all.ts 수정 예시
const CONCURRENT_LIMIT = 5; // 동시 5개까지

const chunks = [];
for (let i = 0; i < crawlerConfigs.length; i += CONCURRENT_LIMIT) {
  chunks.push(crawlerConfigs.slice(i, i + CONCURRENT_LIMIT));
}

for (const chunk of chunks) {
  await Promise.all(chunk.map(config => crawlConfig(config)));
}
```

---

## 📞 문의

크롤링 관련 문제나 추가 기능이 필요하시면 문의해주세요!

- 이메일: admin@example.com
- GitHub: https://github.com/your-repo
