import { NextResponse } from 'next/server';

// Vercel Pro: 최대 5분 실행
export const maxDuration = 300;

export async function GET(request: Request) {
  try {
    // Vercel Cron 인증 확인 - Request 객체에서 직접 헤더 가져오기
    const authHeader = request.headers.get('authorization');
    
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.error('[Cron/Curate] Unauthorized access attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[Cron/Curate] Starting curation job...');
    const startTime = Date.now();

    // TODO: 실제 큐레이션 로직 구현
    // import { runCurationPipeline } from '@/lib/db-curator';
    // const result = await runCurationPipeline({
    //   minImportanceScore: 5,
    //   similarityThreshold: 0.85
    // });

    // 임시: 큐레이션 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 3000));

    const elapsed = Date.now() - startTime;
    console.log(`[Cron/Curate] Completed in ${elapsed}ms`);

    return NextResponse.json({
      success: true,
      message: 'Curation completed successfully',
      elapsed: `${elapsed}ms`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Cron/Curate] Error:', error);
    
    return NextResponse.json(
      {
        error: 'Curation job failed',
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
