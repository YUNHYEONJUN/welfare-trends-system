# AI 기반 콘텐츠 큐레이션 시스템 설계

## 📋 현재 문제점

**현재**: 크롤링한 데이터를 그대로 나열
- ❌ 중복/유사 콘텐츠가 많음
- ❌ 중요도 구분 없음
- ❌ 정보가 분산되어 있음
- ❌ 관련 자료 연결 안 됨

**요구사항**: 
- ✅ 비슷한 콘텐츠는 자동으로 묶기
- ✅ 중요한 것만 선별
- ✅ 관련 자료를 링크
- ✅ 핵심 내용 요약 제공

---

## 🎯 구현할 시스템

### 1. **AI 콘텐츠 분석 파이프라인**
```
크롤링 → 중복 제거 → 유사도 분석 → 그룹화 → 중요도 평가 → 요약 생성 → 저장
```

### 2. **핵심 기능**

#### A. 유사 콘텐츠 그룹화
- OpenAI Embeddings로 의미론적 유사도 계산
- 같은 주제의 콘텐츠를 자동으로 그룹화
- 예: "노인 돌봄 서비스 확대" 관련 5개 기사 → 1개 큐레이션 콘텐츠

#### B. 중요도 자동 평가
- AI가 다음 기준으로 평가:
  - 정책적 영향도
  - 최신성
  - 실용성
  - 수혜 대상 규모
- 중요도 점수: 1-10

#### C. 자동 요약 생성
- 그룹화된 콘텐츠들의 핵심 내용 추출
- 3-5줄의 간결한 요약
- 주요 변경사항, 신청 방법 등 하이라이트

#### D. 관련 자료 링크
- 같은 주제의 다른 게시판 콘텐츠 연결
- 예: 정책동향에서 노인돌봄 정책 → 학술정보의 관련 연구 자동 연결

---

## 🏗️ 데이터베이스 구조 (업데이트)

### 기존 contents 테이블 확장
```sql
CREATE TABLE contents (
  -- 기본 정보
  id UUID PRIMARY KEY,
  title VARCHAR(500),
  summary TEXT,
  full_content TEXT,
  
  -- 큐레이션 정보
  curation_group_id UUID,  -- 같은 주제로 묶인 그룹 ID
  importance_score INTEGER, -- 1-10 중요도
  is_curated BOOLEAN DEFAULT FALSE, -- 큐레이션 완료 여부
  embedding VECTOR(1536),   -- OpenAI embedding (유사도 계산용)
  
  -- 자동 생성 요약
  ai_summary TEXT,          -- AI가 생성한 핵심 요약
  key_points JSONB,         -- 주요 포인트들
  
  -- 원본 정보
  source_urls TEXT[],       -- 원본 출처 URL들 (여러 개 가능)
  source_count INTEGER,     -- 몇 개의 원본을 합쳤는지
  
  -- 기존 필드들...
  category VARCHAR(50),
  published_at TIMESTAMP,
  created_at TIMESTAMP
);

-- 큐레이션 그룹 테이블
CREATE TABLE curation_groups (
  id UUID PRIMARY KEY,
  title VARCHAR(500),       -- 그룹 대표 제목
  theme VARCHAR(200),       -- 주제/테마
  category VARCHAR(50),     -- academy, policy, etc.
  importance_score INTEGER, -- 그룹 전체 중요도
  summary TEXT,             -- 그룹 통합 요약
  content_count INTEGER,    -- 포함된 콘텐츠 수
  created_at TIMESTAMP
);

-- 관련 콘텐츠 연결 테이블
CREATE TABLE related_contents (
  content_id UUID REFERENCES contents(id),
  related_content_id UUID REFERENCES contents(id),
  relation_type VARCHAR(50), -- 'similar', 'related', 'referenced'
  similarity_score FLOAT,    -- 유사도 점수 0-1
  PRIMARY KEY (content_id, related_content_id)
);
```

---

## 🤖 AI 큐레이션 워크플로우

### Step 1: 크롤링 (기존)
```typescript
// 여러 출처에서 데이터 수집
const rawContents = await crawlAllSources();
// 예: 100개의 기사 수집
```

### Step 2: 임베딩 생성
```typescript
// OpenAI Embeddings API로 의미 벡터 생성
for (const content of rawContents) {
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: content.title + " " + content.summary
  });
  
  content.embedding = embedding.data[0].embedding;
}
```

### Step 3: 유사도 계산 및 그룹화
```typescript
// 코사인 유사도로 비슷한 콘텐츠 찾기
const groups = [];
const threshold = 0.85; // 85% 이상 유사하면 같은 그룹

for (const content of rawContents) {
  // 기존 그룹과 유사도 비교
  const similarGroup = findSimilarGroup(content, groups, threshold);
  
  if (similarGroup) {
    similarGroup.contents.push(content);
  } else {
    // 새 그룹 생성
    groups.push({
      id: generateId(),
      contents: [content],
      theme: extractTheme(content)
    });
  }
}
```

### Step 4: 중요도 평가
```typescript
// GPT-4로 중요도 평가
for (const group of groups) {
  const evaluation = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{
      role: "system",
      content: "다음 복지 정책 정보의 중요도를 1-10으로 평가해주세요. 기준: 정책 영향도, 수혜자 규모, 시급성"
    }, {
      role: "user",
      content: JSON.stringify(group.contents)
    }]
  });
  
  group.importanceScore = parseInt(evaluation.choices[0].message.content);
}
```

### Step 5: 통합 요약 생성
```typescript
// 여러 콘텐츠를 하나의 요약으로 통합
for (const group of groups) {
  const summary = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{
      role: "system",
      content: `다음 ${group.contents.length}개의 관련 기사를 하나의 간결한 요약으로 만들어주세요:
      - 3-5줄로 핵심만 요약
      - 주요 변경사항 강조
      - 신청 방법이 있으면 명시
      - 출처 정보는 제외`
    }, {
      role: "user",
      content: group.contents.map(c => c.full_content).join("\n\n---\n\n")
    }]
  });
  
  group.summary = summary.choices[0].message.content;
}
```

### Step 6: 관련 콘텐츠 링크
```typescript
// 다른 카테고리에서 관련 콘텐츠 찾기
for (const group of groups) {
  // 학술정보, 정책동향 등 다른 카테고리에서 관련 자료 검색
  const relatedContents = await findRelatedAcrossCategories(
    group.embedding,
    group.category
  );
  
  group.relatedLinks = relatedContents;
}
```

### Step 7: 데이터베이스 저장
```typescript
// 중요도가 높은 것만 저장 (예: 5점 이상)
const importantGroups = groups.filter(g => g.importanceScore >= 5);

for (const group of importantGroups) {
  // 큐레이션 그룹 저장
  await saveCurationGroup(group);
  
  // 관련 콘텐츠 연결 저장
  await saveRelatedContents(group.relatedLinks);
}
```

---

## 🎨 UI/UX 디자인

### 게시판 레이아웃 (변경 후)

```
┌─────────────────────────────────────────────────────┐
│ 📊 정책동향 게시판                                    │
│ 총 15개의 큐레이션 콘텐츠 (원본 47개 기사에서 선별)     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ ⭐ 중요도: 9/10    📅 2025-12-20 ~ 2025-12-25       │
│                                                      │
│ 【정책】 노인 맞춤돌봄서비스 대상자 확대              │
│                                                      │
│ 💡 핵심 요약:                                        │
│ 2026년부터 독거노인 맞춤돌봄서비스 대상이 65세       │
│ 이상 전체로 확대됩니다. 기존 소득 하위 27%에서       │
│ 전 계층으로 확대되며, 월 4회 방문 서비스와           │
│ 안전확인이 제공됩니다. 신청은 주민센터 또는          │
│ 복지로(www.bokjiro.go.kr)에서 가능합니다.           │
│                                                      │
│ 📄 원본 출처: 5개 기사                               │
│ • 보건복지부 보도자료 (2025-12-20) 🔗               │
│ • 경기도 복지정책 공고 (2025-12-21) 🔗              │
│ • 서울시 노인복지 안내 (2025-12-22) 🔗              │
│ • 복지타임즈 기사 (2025-12-23) 🔗                   │
│ • 경향신문 관련 보도 (2025-12-25) 🔗                │
│                                                      │
│ 🔗 관련 자료:                                        │
│ • 학술정보: "독거노인 돌봄서비스 효과 연구" (3건)     │
│ • 사회서비스: 경기도사회서비스원 돌봄 프로그램 (2건)  │
│                                                      │
│ 🏷️ 태그: #노인복지 #맞춤돌봄 #정책확대             │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ ⭐ 중요도: 8/10    📅 2025-12-18 ~ 2025-12-24       │
│                                                      │
│ 【정책】 2026년 기초연금 인상 확정                    │
│                                                      │
│ 💡 핵심 요약:                                        │
│ 2026년 1월부터 기초연금이 월 최대 40만원으로         │
│ 인상됩니다. 현행 33만 3천원에서 20% 인상되며...     │
│ ...                                                  │
└─────────────────────────────────────────────────────┘
```

---

## 🛠️ 구현 계획

### Phase 1: 기본 큐레이션 (1-2일)
- ✅ OpenAI Embeddings API 연동
- ✅ 유사도 계산 알고리즘
- ✅ 중복 제거 로직
- ✅ DB 스키마 업데이트

### Phase 2: AI 요약 생성 (1일)
- ✅ GPT-4 API 연동
- ✅ 프롬프트 엔지니어링
- ✅ 요약 품질 검증

### Phase 3: 중요도 평가 (1일)
- ✅ 평가 기준 정의
- ✅ AI 기반 점수 산정
- ✅ 임계값 설정

### Phase 4: 관련 콘텐츠 링크 (1일)
- ✅ 카테고리 간 연결
- ✅ 추천 알고리즘
- ✅ 링크 저장

### Phase 5: UI 구현 (1-2일)
- ✅ 큐레이션 카드 디자인
- ✅ 원본 출처 표시
- ✅ 관련 자료 링크
- ✅ 태그 및 필터

---

## 💰 비용 예상 (OpenAI API)

### Embeddings
- 모델: text-embedding-3-small
- 비용: $0.02 / 1M tokens
- 예상: 100개 기사 × 500 tokens = 50,000 tokens
- **월 비용**: ~$1

### GPT-4 (요약 생성)
- 모델: gpt-4-turbo
- 비용: $10 / 1M input tokens, $30 / 1M output tokens
- 예상: 20개 그룹 × (2,000 input + 500 output)
- **월 비용**: ~$5

### 총 예상 비용
- **월 $6-10** (하루 1회 크롤링 기준)

---

## 📊 예상 효과

### Before (현재)
- 100개 크롤링 기사 → 100개 게시글
- 중복 많음, 정보 파편화
- 사용자가 직접 필터링 필요

### After (큐레이션 후)
- 100개 크롤링 기사 → **15-20개 큐레이션 콘텐츠**
- 중복 제거, 핵심만 정리
- 관련 자료 자동 연결
- **정보 탐색 시간 80% 감소**

---

## 🔧 기술 스택

- **OpenAI API**: Embeddings + GPT-4
- **PostgreSQL**: pgvector 확장 (벡터 검색)
- **Node.js**: 큐레이션 파이프라인
- **TypeScript**: 타입 안전성

---

## ✅ 다음 단계

1. **OpenAI API 키 설정** 확인
2. **pgvector 확장** 설치
3. **큐레이션 파이프라인** 구현
4. **UI 업데이트**
5. **테스트 및 최적화**

진행하시겠습니까?

**작성일**: 2025-12-25  
**버전**: 1.0.0  
**상태**: 📋 설계 완료
