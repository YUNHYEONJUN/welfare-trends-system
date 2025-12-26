import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 콘텐츠 상세 정보 조회
    const sql = `
      SELECT 
        c.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', rc.id,
              'title', rc.title,
              'summary', rc.summary,
              'source', rc.source,
              'source_url', rc.source_url,
              'published_at', rc.published_at
            )
          ) FILTER (WHERE rc.id IS NOT NULL),
          '[]'
        ) as source_articles
      FROM contents c
      LEFT JOIN raw_crawled_contents rc ON rc.curation_group_id = c.curation_group_id
      WHERE c.id = $1
      GROUP BY c.id
    `;

    const result = await query(sql, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    // 조회수 증가
    await query(
      'UPDATE contents SET view_count = view_count + 1 WHERE id = $1',
      [id]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Content detail API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content', details: error.message },
      { status: 500 }
    );
  }
}
