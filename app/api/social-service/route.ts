import { NextRequest, NextResponse } from 'next/server';

// 샘플 데이터 (실제로는 데이터베이스에서 가져옴)
const sampleData = {
  stats: {
    total: 1247,
    today: 23,
    highlights: 42,
    recruitment: 15,
  },
  recentUpdates: [
    {
      id: '1',
      title: '경기도사회서비스원, 2025년 돌봄 인력 1,000명 신규 채용 계획 발표',
      summary: '경기도사회서비스원이 2025년 사회서비스 확대를 위해 돌봄 인력 1,000명을 신규 채용한다고 발표했습니다.',
      region: '경기도',
      contentType: 'policy',
      isHighlight: true,
      publishedAt: new Date().toISOString(),
      sourceUrl: '#',
    },
    {
      id: '2',
      title: '서울시사회서비스원, 요양보호사 처우 개선 방안 마련',
      summary: '서울시사회서비스원이 요양보호사의 근무 환경 개선과 처우 향상을 위한 종합 대책을 발표했습니다.',
      region: '서울특별시',
      contentType: 'news',
      isHighlight: true,
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
      sourceUrl: '#',
    },
    {
      id: '3',
      title: '부산사회서비스원 2025년 상반기 채용 공고',
      summary: '부산광역시사회서비스원에서 사회복지사, 요양보호사 등 다양한 직종의 인력을 채용합니다.',
      region: '부산광역시',
      contentType: 'recruitment',
      isHighlight: false,
      publishedAt: new Date(Date.now() - 172800000).toISOString(),
      sourceUrl: '#',
    },
  ],
  byRegion: {
    '서울특별시': 125,
    '경기도': 243,
    '부산광역시': 89,
    '인천광역시': 76,
    '대구광역시': 68,
    '광주광역시': 54,
    '대전광역시': 62,
    '울산광역시': 43,
    '세종특별자치시': 31,
    '강원특별자치도': 58,
    '충청북도': 67,
    '충청남도': 71,
    '전북특별자치도': 65,
    '전라남도': 52,
    '경상북도': 74,
    '경상남도': 83,
    '제주특별자치도': 46,
  },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '10');

    // 실제로는 데이터베이스 쿼리를 수행
    // 여기서는 샘플 데이터 반환
    let filteredData = { ...sampleData };

    if (region && region !== '전체') {
      filteredData.recentUpdates = sampleData.recentUpdates.filter(
        item => item.region === region
      );
    }

    if (type && type !== 'all') {
      filteredData.recentUpdates = filteredData.recentUpdates.filter(
        item => item.contentType === type
      );
    }

    filteredData.recentUpdates = filteredData.recentUpdates.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: filteredData,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 크롤링 트리거 또는 수동 콘텐츠 추가
    const body = await request.json();
    
    // 실제로는 데이터베이스에 저장
    console.log('New content:', body);

    return NextResponse.json({
      success: true,
      message: 'Content added successfully',
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add content' },
      { status: 500 }
    );
  }
}
