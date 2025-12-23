# 경기북서부노인보호전문기관 복지동향 시스템

복지부, 경기도, 31개 시군의 사회복지 정책 및 소식을 자동으로 수집하고 가공하여 제공하는 시스템입니다.

## 🎯 주요 기능

### 1. 자동 크롤링
- 보건복지부, 경기도, 31개 시군 웹사이트 모니터링
- **전국 17개 지역 사회서비스원 실시간 모니터링** ⭐ NEW
- 정기적으로 신규 콘텐츠 자동 수집
- 중복 제거 및 데이터 정규화

### 2. AI 콘텐츠 가공
- 수집된 정보 자동 요약
- 핵심 키워드 추출
- 에디터 의견 자동 생성
- 카테고리 자동 분류
- **주요 기사 자동 하이라이트** ⭐ NEW

### 3. 카테고리별 분류
- **학술**: 국내외 논문 요약 및 분석
- **정책**: 복지부, 경기도 등 정책 동향
- **짧은생각**: 복지 현장의 단상과 인사이트
- **사회서비스원**: 전국 17개 지역 실시간 동향 ⭐ NEW

### 4. 사회서비스원 전용 기능 ⭐ NEW
- **17개 지역 통합 모니터링**: 전국 사회서비스원 소식 한눈에
- **주요 기사 하이라이트**: 중요 정책/제도 자동 강조
- **콘텐츠 타입별 분류**: 제도/정책, 주요 기사, 공지사항, 채용정보
- **타임라인 뷰**: 시간순 아카이빙
- **지역별 필터링**: 원하는 지역만 선택 조회
- **실시간 통계 대시보드**: 오늘 업데이트, 주요 기사 수 등

### 5. 검색 및 필터링
- 키워드 기반 전체 텍스트 검색
- 날짜, 카테고리, 출처별 필터링
- 지역별 필터링 (사회서비스원)
- 태그 기반 관련 콘텐츠 추천

### 6. 알림 시스템
- 신규 콘텐츠 업데이트 알림
- 중요 정책 변경 알림
- 주요 기사 하이라이트 알림
- 채용 정보 알림
- 이메일/푸시 알림 지원 (향후)

## 🚀 시작하기

### 필수 요구사항

- Node.js 18.x 이상
- npm 또는 yarn
- PostgreSQL 14.x 이상 (선택사항)

### 설치

```bash
# 저장소 클론
git clone <repository-url>
cd welfare-trends

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.local.example .env.local
# .env.local 파일을 편집하여 필요한 설정 추가

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 열기

## 📁 프로젝트 구조

```
welfare-trends/
├── app/                          # Next.js 앱 디렉토리
│   ├── academy/                 # 학술 페이지
│   ├── policy/                  # 정책 페이지
│   ├── thoughts/                # 짧은생각 페이지
│   ├── social-service/          # 사회서비스원 페이지 ⭐ NEW
│   ├── api/                     # API 라우트
│   │   └── social-service/     # 사회서비스원 API
│   ├── components/              # 공통 컴포넌트
│   ├── layout.tsx               # 루트 레이아웃
│   ├── page.tsx                 # 홈페이지
│   └── globals.css              # 전역 스타일
├── lib/                         # 유틸리티 및 라이브러리
│   ├── crawler.ts               # 웹 크롤링 시스템 (17개 지역 포함)
│   ├── ai-processor.ts          # AI 콘텐츠 가공
│   ├── types.ts                 # 타입 정의 (사회서비스원 포함)
│   ├── db-schema.sql            # 데이터베이스 스키마 (업데이트)
│   └── scripts/                 # 실행 스크립트
│       └── crawl-social-service.ts  # 사회서비스원 크롤링 ⭐ NEW
├── public/                      # 정적 파일
├── .env.local                   # 환경 변수 (로컬)
├── next.config.js               # Next.js 설정
├── tailwind.config.ts           # Tailwind CSS 설정
├── tsconfig.json                # TypeScript 설정
└── package.json                 # 프로젝트 설정
```

## 🔧 기술 스택

### 프론트엔드
- **Next.js 14**: React 프레임워크 (App Router)
- **TypeScript**: 타입 안정성
- **Tailwind CSS**: 유틸리티 우선 CSS 프레임워크
- **React**: UI 라이브러리

### 백엔드
- **Next.js API Routes**: 서버리스 API
- **PostgreSQL**: 관계형 데이터베이스
- **Node.js**: JavaScript 런타임

### 크롤링 & AI
- **Cheerio**: HTML 파싱
- **Axios**: HTTP 클라이언트
- **Puppeteer**: 동적 콘텐츠 크롤링
- **OpenAI API**: AI 콘텐츠 가공 (선택사항)

## 📊 데이터베이스 설정

### PostgreSQL 설치 및 설정

```bash
# PostgreSQL 설치 (Ubuntu/Debian)
sudo apt-get install postgresql postgresql-contrib

# 데이터베이스 생성
sudo -u postgres createdb welfare_trends

# 스키마 적용
psql -U postgres -d welfare_trends -f lib/db-schema.sql
```

### 환경 변수 설정

`.env.local` 파일에 데이터베이스 연결 정보 추가:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/welfare_trends
```

## 🤖 AI 콘텐츠 가공 설정

OpenAI API를 사용하여 자동 요약 및 에디터 의견을 생성할 수 있습니다.

1. OpenAI API 키 발급: https://platform.openai.com/api-keys
2. `.env.local`에 API 키 추가:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

**참고**: AI 기능은 선택사항입니다. API 키가 없어도 기본 요약 기능을 사용할 수 있습니다.

## 🔄 크롤링 실행

### 전체 크롤링

```bash
npm run crawl
```

### 사회서비스원만 크롤링 ⭐ NEW

```bash
# 전국 17개 지역 전체
npm run crawl:social-service

# 특정 지역만
npm run crawl:social-service -- --region=경기도
npm run crawl:social-service -- --region=서울특별시
```

### 자동 크롤링 (주기적)

크롤링 주기는 `.env.local`에서 설정할 수 있습니다:

```env
CRAWL_INTERVAL=14400000  # 4시간 (밀리초) - 사회서비스원 권장
```

## 🌐 배포

### Vercel 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel
```

### 환경 변수 설정
Vercel 대시보드에서 다음 환경 변수를 설정하세요:
- `OPENAI_API_KEY` (선택사항)
- `DATABASE_URL`
- `CRAWL_INTERVAL`

## 🏢 사회서비스원 지역 목록

시스템에서 지원하는 17개 지역:

1. 서울특별시사회서비스원
2. 경기도사회서비스원
3. 부산광역시사회서비스원
4. 인천광역시사회서비스원
5. 대구광역시사회서비스원
6. 광주광역시사회서비스원
7. 대전광역시사회서비스원
8. 울산광역시사회서비스원
9. 세종특별자치시사회서비스원
10. 강원특별자치도사회서비스원
11. 충청북도사회서비스원
12. 충청남도사회서비스원
13. 전북특별자치도사회서비스원
14. 전라남도사회서비스원
15. 경상북도사회서비스원
16. 경상남도사회서비스원
17. 제주특별자치도사회서비스원

## 📝 크롤링 소스 추가

### 일반 크롤링 소스

새로운 크롤링 소스를 추가하려면 `lib/crawler.ts`의 `crawlerConfigs` 배열에 설정을 추가하세요:

```typescript
{
  url: 'https://example.com/news',
  category: 'policy',
  source: '경기도',
  selector: {
    container: '.news-list li',
    title: '.title',
    link: 'a',
    date: '.date',
    summary: '.summary',
  },
}
```

### 사회서비스원 크롤링 소스 ⭐ NEW

```typescript
{
  url: 'https://www.example-sw.or.kr/board/notice',
  category: 'social-service',
  source: '사회서비스원',
  region: '경기도',  // 지역 정보 추가
  selector: {
    container: '.board-list li',
    title: '.title',
    link: 'a',
    date: '.date',
  },
}
```

## 🎨 커스터마이징

### 색상 테마 변경

`tailwind.config.ts`에서 색상을 수정할 수 있습니다:

```typescript
theme: {
  extend: {
    colors: {
      primary: {
        // 원하는 색상으로 변경
      },
    },
  },
}
```

## 🆕 주요 업데이트 (v2.0)

### 사회서비스원 기능 추가

✨ **새로운 페이지**: `/social-service`
- 전국 17개 지역 통합 대시보드
- 통계 카드 (총 콘텐츠, 오늘 업데이트, 주요 기사, 채용정보)
- 목록형/타임라인형 뷰 전환
- 실시간 필터링 (지역, 콘텐츠 타입)

✨ **주요 기사 자동 하이라이트**
- 키워드 기반 중요도 자동 판단
- 별도 섹션으로 강조 표시
- 노란색 배지로 시각적 구분

✨ **콘텐츠 타입 분류**
- 제도/정책
- 주요 기사
- 공지사항
- 채용정보

✨ **타임라인 뷰**
- 시간순 아카이빙
- 날짜별 그룹핑
- 깔끔한 타임라인 UI

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📧 문의

프로젝트에 대한 문의사항이나 버그 리포트는 이슈 트래커를 이용해주세요.

---

**경기북서부노인보호전문기관** © 2024
