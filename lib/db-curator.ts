/**
 * 데이터베이스 연동 AI 큐레이션 시스템
 * 
 * 워크플로우:
 * 1. raw_crawled_contents 테이블에서 미처리 콘텐츠 조회
 * 2. AI 큐레이션 실행 (그룹화, 중요도 평가, 요약 생성)
 * 3. curation_groups 테이블에 저장
 * 4. contents 테이블에 최종 콘텐츠 저장
 * 5. 관련 콘텐츠 링크 저장
 */

import { Pool } from 'pg';
import {
  RawContent,
  CurationGroup,
  curateContents,
  cosineSimilarity,
  generateEmbedding,
} from './ai-curator';

// 데이터베이스 연결
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * 1. 미처리 원본 콘텐츠 조회
 */
export async function fetchUnprocessedContents(
  category?: string,
  limit: number = 100
): Promise<RawContent[]> {
  const client = await pool.connect();
  try {
    const query = `
      SELECT 
        id::text,
        title,
        summary,
        full_content,
        source,
        source_url,
        published_at,
        category,
        tags,
        region,
        content_type
      FROM raw_crawled_contents
      WHERE is_processed = FALSE
        ${category ? 'AND category = $1' : ''}
      ORDER BY crawled_at DESC
      LIMIT $${category ? '2' : '1'}
    `;

    const params = category ? [category, limit] : [limit];
    const result = await client.query(query, params);

    console.log(`[DB Curator] Fetched ${result.rows.length} unprocessed contents`);
    return result.rows;
  } finally {
    client.release();
  }
}

/**
 * 2. 큐레이션 그룹 저장
 */
export async function saveCurationGroup(group: CurationGroup): Promise<string> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. curation_groups 테이블에 저장
    const groupQuery = `
      INSERT INTO curation_groups (
        title, theme, category, importance_score, ai_summary, 
        key_points, content_count, source_urls, tags
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id::text
    `;

    const groupResult = await client.query(groupQuery, [
      group.title,
      group.theme,
      group.category,
      group.importance_score,
      group.ai_summary,
      group.key_points,
      group.source_count,
      group.source_urls,
      group.tags,
    ]);

    const groupId = groupResult.rows[0].id;
    console.log(`[DB Curator] Saved curation group: ${groupId}`);

    // 2. contents 테이블에 큐레이션된 콘텐츠 저장
    const contentQuery = `
      INSERT INTO contents (
        title, summary, full_content, category, source, source_url, thumbnail_url,
        published_at, tags, is_highlight, region, content_type,
        curation_group_id, importance_score, is_curated, ai_summary, key_points,
        source_count, original_content_ids
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING id::text
    `;

    // 대표 콘텐츠 정보 (첫 번째 원본)
    const representative = group.source_contents[0];
    
    // 전체 콘텐츠 통합 (요약)
    const fullContent = `
${group.ai_summary}

## 주요 내용

${group.key_points.map((point, i) => `${i + 1}. ${point}`).join('\n')}

## 원본 출처 (${group.source_count}개)

${group.source_contents.map((c, i) => `
### ${i + 1}. ${c.title}
- 출처: ${c.source}
- 일시: ${c.published_at.toISOString().split('T')[0]}
- URL: ${c.source_url}
`).join('\n')}
    `.trim();

    const contentResult = await client.query(contentQuery, [
      group.title,
      group.ai_summary,
      fullContent,
      group.category,
      `큐레이션 (${group.source_count}개 출처)`,
      group.source_urls[0] || null, // 대표 URL
      null, // thumbnail
      representative.published_at,
      group.tags,
      group.importance_score >= 8, // 중요도 8 이상은 highlight
      representative.region || null,
      representative.content_type || null,
      groupId,
      group.importance_score,
      true,
      group.ai_summary,
      group.key_points,
      group.source_count,
      group.source_contents.map(c => c.id),
    ]);

    const contentId = contentResult.rows[0].id;

    // 3. 원본 콘텐츠들을 processed로 표시
    const updateQuery = `
      UPDATE raw_crawled_contents
      SET is_processed = TRUE, curation_group_id = $1
      WHERE id = ANY($2::uuid[])
    `;

    await client.query(updateQuery, [
      groupId,
      group.source_contents.map(c => c.id),
    ]);

    await client.query('COMMIT');

    console.log(`[DB Curator] Saved curated content: ${contentId}`);
    return contentId;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[DB Curator] Failed to save curation group:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * 3. 관련 콘텐츠 링크 저장
 */
export async function saveRelatedContent(
  contentId: string,
  relatedContentId: string,
  relationType: 'similar' | 'related' | 'referenced',
  similarityScore: number
): Promise<void> {
  const client = await pool.connect();
  try {
    const query = `
      INSERT INTO related_contents (content_id, related_content_id, relation_type, similarity_score)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (content_id, related_content_id) DO UPDATE
      SET similarity_score = EXCLUDED.similarity_score
    `;

    await client.query(query, [contentId, relatedContentId, relationType, similarityScore]);
    console.log(`[DB Curator] Linked related content: ${contentId} -> ${relatedContentId}`);
  } catch (error) {
    console.error('[DB Curator] Failed to save related content:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * 4. 카테고리 간 관련 콘텐츠 찾기
 */
export async function findRelatedContentsAcrossCategories(
  sourceContentId: string,
  sourceCategory: string,
  sourceEmbedding: number[],
  similarityThreshold: number = 0.75
): Promise<Array<{ id: string; title: string; category: string; similarity: number }>> {
  const client = await pool.connect();
  try {
    // 현재 pgvector 확장이 없다면 일단 태그 기반으로 검색
    // TODO: pgvector 설치 후 임베딩 기반 검색으로 업그레이드
    const query = `
      SELECT 
        id::text,
        title,
        category,
        tags
      FROM contents
      WHERE category != $1
        AND is_curated = TRUE
      ORDER BY created_at DESC
      LIMIT 50
    `;

    const result = await client.query(query, [sourceCategory]);

    // 임시로 태그 중복도로 유사도 계산
    // (나중에 pgvector로 교체)
    const sourceContent = await client.query(
      'SELECT tags FROM contents WHERE id = $1',
      [sourceContentId]
    );
    const sourceTags = sourceContent.rows[0]?.tags || [];

    const relatedContents = result.rows
      .map(row => {
        const commonTags = row.tags.filter((tag: string) => sourceTags.includes(tag));
        const similarity = commonTags.length / Math.max(sourceTags.length, row.tags.length);
        return {
          id: row.id,
          title: row.title,
          category: row.category,
          similarity,
        };
      })
      .filter(c => c.similarity >= similarityThreshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);

    return relatedContents;
  } finally {
    client.release();
  }
}

/**
 * 5. 전체 큐레이션 파이프라인 실행
 */
export async function runCurationPipeline(options: {
  category?: string;
  limit?: number;
  similarityThreshold?: number;
  minImportanceScore?: number;
} = {}): Promise<{
  processedCount: number;
  curatedGroupsCount: number;
  savedContentIds: string[];
}> {
  console.log('[DB Curator] Starting curation pipeline...');
  console.log('[DB Curator] Options:', options);

  try {
    // 1. 미처리 콘텐츠 조회
    const rawContents = await fetchUnprocessedContents(
      options.category,
      options.limit || 100
    );

    if (rawContents.length === 0) {
      console.log('[DB Curator] No unprocessed contents found');
      return {
        processedCount: 0,
        curatedGroupsCount: 0,
        savedContentIds: [],
      };
    }

    console.log(`[DB Curator] Processing ${rawContents.length} contents...`);

    // 2. AI 큐레이션 실행
    const curatedGroups = await curateContents(rawContents, {
      similarityThreshold: options.similarityThreshold || 0.85,
      minImportanceScore: options.minImportanceScore || 5,
    });

    console.log(`[DB Curator] Created ${curatedGroups.length} curated groups`);

    // 3. 데이터베이스에 저장
    const savedContentIds: string[] = [];

    for (const group of curatedGroups) {
      try {
        const contentId = await saveCurationGroup(group);
        savedContentIds.push(contentId);

        // 4. 관련 콘텐츠 링크 (비동기)
        // findRelatedContentsAcrossCategories(contentId, group.category, ...)
        // 나중에 임베딩 기반으로 구현
      } catch (error) {
        console.error(`[DB Curator] Failed to save group:`, error);
      }
    }

    console.log('[DB Curator] Pipeline completed successfully');

    return {
      processedCount: rawContents.length,
      curatedGroupsCount: curatedGroups.length,
      savedContentIds,
    };
  } catch (error) {
    console.error('[DB Curator] Pipeline failed:', error);
    throw error;
  }
}

/**
 * 6. 통계 조회
 */
export async function getCurationStats() {
  const client = await pool.connect();
  try {
    const stats = await client.query('SELECT * FROM curation_stats ORDER BY category');
    const rawStats = await client.query('SELECT * FROM raw_content_processing_stats ORDER BY category');

    return {
      curation: stats.rows,
      raw: rawStats.rows,
    };
  } finally {
    client.release();
  }
}

/**
 * 7. 크롤링 데이터를 raw_crawled_contents에 저장
 */
export async function saveRawCrawledContent(content: Omit<RawContent, 'id'>) {
  const client = await pool.connect();
  try {
    const query = `
      INSERT INTO raw_crawled_contents (
        title, summary, full_content, category, source, source_url,
        published_at, tags, region, content_type
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id::text
    `;

    const result = await client.query(query, [
      content.title,
      content.summary,
      content.full_content,
      content.category,
      content.source,
      content.source_url,
      content.published_at,
      content.tags,
      (content as any).region || null,
      (content as any).content_type || null,
    ]);

    return result.rows[0].id;
  } finally {
    client.release();
  }
}

export { pool };
