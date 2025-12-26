import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // 큐레이션된 콘텐츠 조회 (여러 출처가 통합된 콘텐츠)
    const sql = `
      SELECT 
        c.id,
        c.title,
        c.summary,
        c.category,
        c.source,
        c.published_at,
        c.is_highlight,
        c.curation_group_id,
        c.importance_score,
        c.ai_summary,
        c.key_points,
        c.source_urls,
        c.source_count,
        c.created_at
      FROM contents c
      WHERE c.is_curated = true
        ${category ? 'AND c.category = $1' : ''}
      ORDER BY 
        c.is_highlight DESC,
        c.importance_score DESC NULLS LAST,
        c.published_at DESC
      LIMIT $${category ? '2' : '1'} OFFSET $${category ? '3' : '2'}
    `;

    const params = category 
      ? [category, limit, offset]
      : [limit, offset];

    const result = await query(sql, params);

    // 전체 개수 조회
    const countSql = `
      SELECT COUNT(*) 
      FROM contents 
      WHERE is_curated = true
        ${category ? 'AND category = $1' : ''}
    `;
    const countResult = await query(
      countSql, 
      category ? [category] : []
    );
    const total = parseInt(countResult.rows[0].count);

    return NextResponse.json({
      contents: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Contents API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contents', details: error.message },
      { status: 500 }
    );
  }
}
