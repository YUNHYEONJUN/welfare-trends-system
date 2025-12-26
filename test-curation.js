const { Client } = require('pg');

const DATABASE_URL = process.argv[2];

async function createTestData() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ 데이터베이스 연결');

    // 테스트 원본 콘텐츠 생성 (유사한 내용 5개)
    const testContents = [
      {
        title: '보건복지부, 2025년 노인복지 예산 20% 증액',
        summary: '보건복지부가 2025년 노인복지 예산을 전년 대비 20% 증액하기로 결정했다.',
        full_content: '보건복지부는 2025년 노인복지 예산을 8조원으로 편성하여 전년 대비 20% 증액한다고 밝혔다. 주요 사업으로는 노인일자리 확대, 돌봄서비스 강화 등이 포함된다.',
        source: '보건복지부',
        source_url: 'https://www.mohw.go.kr/board/1',
        category: 'policy',
        tags: ['예산', '노인복지', '보건복지부']
      },
      {
        title: '경기도, 노인복지 예산 대폭 증액 발표',
        summary: '경기도가 노인복지 관련 예산을 크게 늘린다고 발표했다.',
        full_content: '경기도는 2025년 노인복지 예산을 1조 5천억원으로 편성하여 전년 대비 18% 증가했다. 노인일자리 사업과 돌봄 서비스에 중점 투자한다.',
        source: '경기도청',
        source_url: 'https://www.gg.go.kr/board/1',
        category: 'policy',
        tags: ['예산', '노인복지', '경기도']
      },
      {
        title: '노인복지 예산 증액, 일자리와 돌봄 강화',
        summary: '중앙정부와 지자체가 노인복지 예산을 동시에 증액한다.',
        full_content: '2025년 노인복지 예산이 중앙정부와 지방정부 모두에서 증액된다. 노인일자리 창출과 돌봄서비스 확대가 핵심이다.',
        source: '연합뉴스',
        source_url: 'https://www.yna.co.kr/news/1',
        category: 'policy',
        tags: ['예산', '노인일자리', '돌봄']
      }
    ];

    for (const content of testContents) {
      await client.query(`
        INSERT INTO raw_crawled_contents 
        (title, summary, full_content, source, source_url, category, tags, published_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      `, [
        content.title,
        content.summary,
        content.full_content,
        content.source,
        content.source_url,
        content.category,
        content.tags
      ]);
    }

    console.log('✅ 테스트 데이터 3개 생성 완료');
    console.log('\n📝 다음 단계:');
    console.log('1. OpenAI API 키 설정 (환경 변수)');
    console.log('2. 큐레이션 실행: npm run curate:test');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

createTestData();
