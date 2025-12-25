/**
 * AI 기반 콘텐츠 큐레이션 시스템
 * 
 * 기능:
 * 1. 유사 콘텐츠 자동 그룹화
 * 2. 중요도 자동 평가
 * 3. 통합 요약 생성
 * 4. 관련 콘텐츠 링크
 */

import OpenAI from 'openai';
import { getOpenAIConfig } from './genspark-config';

const { apiKey, baseURL } = getOpenAIConfig();

const openai = new OpenAI({
  apiKey: apiKey || process.env.OPENAI_API_KEY,
  baseURL: baseURL || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
});

// 크롤링된 원본 콘텐츠 인터페이스
export interface RawContent {
  id: string;
  title: string;
  summary: string;
  full_content: string;
  source: string;
  source_url: string;
  published_at: Date;
  category: string;
  tags: string[];
}

// 큐레이션된 콘텐츠 그룹
export interface CurationGroup {
  id: string;
  title: string;
  theme: string;
  category: string;
  importance_score: number;
  ai_summary: string;
  key_points: string[];
  source_contents: RawContent[];
  source_urls: string[];
  source_count: number;
  related_links: RelatedLink[];
  tags: string[];
  created_at: Date;
}

export interface RelatedLink {
  title: string;
  category: string;
  url: string;
  similarity: number;
}

/**
 * Step 1: OpenAI Embeddings로 의미 벡터 생성
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text.substring(0, 8000), // 최대 길이 제한
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Embedding generation failed:', error);
    throw error;
  }
}

/**
 * Step 2: 코사인 유사도 계산
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Step 3: 유사 콘텐츠 그룹화
 */
export async function groupSimilarContents(
  contents: RawContent[],
  similarityThreshold: number = 0.85
): Promise<CurationGroup[]> {
  console.log(`[Curator] Grouping ${contents.length} contents...`);

  // 1. 각 콘텐츠의 임베딩 생성
  const contentsWithEmbeddings = await Promise.all(
    contents.map(async (content) => {
      const text = `${content.title}\n${content.summary}`;
      const embedding = await generateEmbedding(text);
      return { ...content, embedding };
    })
  );

  // 2. 그룹화
  const groups: Array<{
    contents: typeof contentsWithEmbeddings;
    centroid: number[];
  }> = [];

  for (const content of contentsWithEmbeddings) {
    // 기존 그룹과 유사도 비교
    let foundGroup = false;

    for (const group of groups) {
      const similarity = cosineSimilarity(content.embedding, group.centroid);
      
      if (similarity >= similarityThreshold) {
        group.contents.push(content);
        // 중심점 업데이트 (평균)
        group.centroid = calculateCentroid(group.contents.map(c => c.embedding));
        foundGroup = true;
        break;
      }
    }

    if (!foundGroup) {
      // 새 그룹 생성
      groups.push({
        contents: [content],
        centroid: content.embedding,
      });
    }
  }

  console.log(`[Curator] Created ${groups.length} groups from ${contents.length} contents`);

  // 3. 큐레이션 그룹 생성 (임시)
  const curationGroups: CurationGroup[] = groups.map((group, index) => ({
    id: `group-${Date.now()}-${index}`,
    title: group.contents[0].title, // 대표 제목 (나중에 AI가 생성)
    theme: extractTheme(group.contents),
    category: group.contents[0].category,
    importance_score: 0, // AI 평가 필요
    ai_summary: '', // AI 요약 필요
    key_points: [],
    source_contents: group.contents,
    source_urls: group.contents.map(c => c.source_url),
    source_count: group.contents.length,
    related_links: [],
    tags: extractCommonTags(group.contents),
    created_at: new Date(),
  }));

  return curationGroups;
}

/**
 * Step 4: 중요도 자동 평가
 */
export async function evaluateImportance(group: CurationGroup): Promise<number> {
  try {
    const prompt = `다음은 복지 정책/정보 관련 콘텐츠입니다. 중요도를 1-10으로 평가해주세요.

평가 기준:
- 정책적 영향도 (얼마나 많은 사람에게 영향을 주나?)
- 시급성 (긴급하게 알려야 하나?)
- 실용성 (실생활에 도움이 되나?)
- 신규성 (새로운 정책/제도인가?)

콘텐츠 정보:
제목: ${group.title}
주제: ${group.theme}
출처 수: ${group.source_count}개
태그: ${group.tags.join(', ')}

원본 콘텐츠 요약:
${group.source_contents.slice(0, 3).map((c, i) => 
  `${i + 1}. ${c.title}\n   ${c.summary?.substring(0, 200)}...`
).join('\n\n')}

중요도 점수만 숫자로 답변해주세요 (1-10):`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: '당신은 복지 정책 전문가입니다. 콘텐츠의 중요도를 객관적으로 평가합니다.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 10,
    });

    const scoreText = response.choices[0].message.content?.trim();
    const score = parseInt(scoreText || '5');

    return Math.min(Math.max(score, 1), 10); // 1-10 범위 보장
  } catch (error) {
    console.error('Importance evaluation failed:', error);
    return 5; // 기본값
  }
}

/**
 * Step 5: 통합 요약 생성
 */
export async function generateSummary(group: CurationGroup): Promise<{
  summary: string;
  keyPoints: string[];
}> {
  try {
    const contentsText = group.source_contents
      .map((c, i) => `[출처 ${i + 1}] ${c.title}\n${c.summary}\n${c.full_content?.substring(0, 1000)}`)
      .join('\n\n---\n\n');

    const prompt = `다음 ${group.source_count}개의 관련 기사/정보를 하나의 통합 요약으로 만들어주세요.

요구사항:
1. 3-5문장으로 핵심만 간결하게 요약
2. 주요 변경사항이나 중요 내용 강조
3. 신청 방법, 대상, 일정 등 실용 정보 포함
4. 출처 정보는 제외 (내용만)
5. 한국어로 작성

콘텐츠:
${contentsText}

통합 요약:`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: '당신은 복지 정책 정보를 쉽고 명확하게 요약하는 전문가입니다.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 500,
    });

    const summary = response.choices[0].message.content?.trim() || '';

    // 주요 포인트 추출
    const keyPointsPrompt = `위 요약에서 주요 포인트 3-5개를 추출해주세요. 각 포인트는 한 문장으로 작성하고, 줄바꿈으로 구분해주세요.`;

    const keyPointsResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: '당신은 복지 정책 정보를 쉽고 명확하게 요약하는 전문가입니다.',
        },
        {
          role: 'user',
          content: prompt,
        },
        {
          role: 'assistant',
          content: summary,
        },
        {
          role: 'user',
          content: keyPointsPrompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 300,
    });

    const keyPointsText = keyPointsResponse.choices[0].message.content?.trim() || '';
    const keyPoints = keyPointsText.split('\n').filter(p => p.trim()).map(p => p.replace(/^[-•]\s*/, '').trim());

    return { summary, keyPoints };
  } catch (error) {
    console.error('Summary generation failed:', error);
    return {
      summary: group.source_contents[0].summary || '',
      keyPoints: [],
    };
  }
}

/**
 * Step 6: 전체 큐레이션 파이프라인
 */
export async function curateContents(
  contents: RawContent[],
  options: {
    similarityThreshold?: number;
    minImportanceScore?: number;
  } = {}
): Promise<CurationGroup[]> {
  const {
    similarityThreshold = 0.85,
    minImportanceScore = 5,
  } = options;

  console.log(`[Curator] Starting curation pipeline for ${contents.length} contents...`);

  // 1. 그룹화
  const groups = await groupSimilarContents(contents, similarityThreshold);
  console.log(`[Curator] Step 1: Grouped into ${groups.length} groups`);

  // 2. 각 그룹 처리
  const curatedGroups = await Promise.all(
    groups.map(async (group, index) => {
      console.log(`[Curator] Processing group ${index + 1}/${groups.length}...`);

      // 중요도 평가
      const importanceScore = await evaluateImportance(group);
      group.importance_score = importanceScore;

      // 중요도가 낮으면 스킵
      if (importanceScore < minImportanceScore) {
        console.log(`[Curator] Group ${index + 1} skipped (importance: ${importanceScore})`);
        return null;
      }

      // 요약 생성
      const { summary, keyPoints } = await generateSummary(group);
      group.ai_summary = summary;
      group.key_points = keyPoints;

      // 대표 제목 생성 (요약 첫 문장 활용)
      group.title = summary.split('.')[0] + '.';

      console.log(`[Curator] Group ${index + 1} completed (importance: ${importanceScore})`);
      return group;
    })
  );

  // null 제거
  const filteredGroups = curatedGroups.filter(g => g !== null) as CurationGroup[];

  console.log(`[Curator] Pipeline completed: ${filteredGroups.length} curated groups created`);
  return filteredGroups;
}

// ===== 유틸리티 함수 =====

function calculateCentroid(vectors: number[][]): number[] {
  const dim = vectors[0].length;
  const centroid = new Array(dim).fill(0);

  for (const vector of vectors) {
    for (let i = 0; i < dim; i++) {
      centroid[i] += vector[i];
    }
  }

  for (let i = 0; i < dim; i++) {
    centroid[i] /= vectors.length;
  }

  return centroid;
}

function extractTheme(contents: RawContent[]): string {
  // 가장 많이 나타나는 태그를 주제로 사용
  const tagCounts: Record<string, number> = {};

  for (const content of contents) {
    for (const tag of content.tags) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  }

  const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);
  return sortedTags[0]?.[0] || '일반';
}

function extractCommonTags(contents: RawContent[]): string[] {
  const tagCounts: Record<string, number> = {};

  for (const content of contents) {
    for (const tag of content.tags) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  }

  // 2개 이상의 콘텐츠에서 나타나는 태그만 선택
  return Object.entries(tagCounts)
    .filter(([, count]) => count >= 2 || contents.length === 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag]) => tag);
}
