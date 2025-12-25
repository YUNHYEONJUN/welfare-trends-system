import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Vercel Pro: 최대 5분 실행
export const maxDuration = 300;

export async function GET(request: Request) {
  try {
    // Vercel Cron 인증 확인
    const authHeader = (await headers()).get('authorization');
    
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.error('[Cron/Crawl] Unauthorized access attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[Cron/Crawl] Starting crawl job...');
    const startTime = Date.now();

    // TODO: 실제 크롤링 로직 구현
    // 방법 1: 크롤링 함수를 import하여 직접 실행
    // import { crawlAllSources } from '@/lib/crawler';
    // const results = await crawlAllSources();

    // 방법 2: 외부 API 호출 (권장)
    // const response = await fetch(`${process.env.NEXTAUTH_URL}/api/crawl`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' }
    // });

    // 임시: 크롤링 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 2000));

    const elapsed = Date.now() - startTime;
    console.log(`[Cron/Crawl] Completed in ${elapsed}ms`);

    return NextResponse.json({
      success: true,
      message: 'Crawl completed successfully',
      elapsed: `${elapsed}ms`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Cron/Crawl] Error:', error);
    
    return NextResponse.json(
      {
        error: 'Crawl job failed',
        details: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// POST 메서드도 지원 (수동 실행용)
export async function POST(request: Request) {
  return GET(request);
}
