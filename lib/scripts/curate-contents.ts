/**
 * 콘텐츠 큐레이션 실행 스크립트
 * 
 * 사용법:
 * npm run curate
 * npm run curate:test  (테스트 데이터로 실행)
 */

import { curateContents, RawContent } from '../ai-curator';

// 테스트용 샘플 데이터
const sampleContents: RawContent[] = [
  {
    id: '1',
    title: '2026년 기초연금 월 40만원으로 인상',
    summary: '내년부터 기초연금이 현행 33만3천원에서 40만원으로 인상됩니다.',
    full_content: `보건복지부는 2026년 1월부터 기초연금을 월 최대 40만원으로 인상한다고 발표했습니다.
    현행 33만 3천원에서 약 20% 인상되는 것으로, 약 700만명의 노인이 혜택을 받게 됩니다.
    신청은 주민센터나 복지로 웹사이트에서 가능합니다.`,
    source: '보건복지부',
    source_url: 'https://www.mohw.go.kr/news/1',
    published_at: new Date('2025-12-20'),
    category: 'policy',
    tags: ['기초연금', '노인복지', '정책'],
  },
  {
    id: '2',
    title: '기초연금 인상안 국회 통과',
    summary: '국회에서 기초연금 인상안이 통과되어 내년부터 시행됩니다.',
    full_content: `국회는 19일 본회의에서 기초연금 인상안을 통과시켰습니다.
    이에 따라 2026년 1월부터 기초연금이 40만원으로 인상됩니다.
    소득 하위 70% 노인 약 700만명이 대상입니다.`,
    source: '국회',
    source_url: 'https://www.assembly.go.kr/news/1',
    published_at: new Date('2025-12-19'),
    category: 'policy',
    tags: ['기초연금', '국회', '정책'],
  },
  {
    id: '3',
    title: '경기도, 기초연금 인상 환영',
    summary: '경기도가 기초연금 인상을 환영하며 추가 지원 방안을 검토 중입니다.',
    full_content: `경기도는 기초연금 인상을 환영하며 지역 노인들을 위한 추가 지원 방안을 검토하고 있습니다.
    도는 기초연금과 별도로 교통비 지원 등을 검토 중입니다.`,
    source: '경기도청',
    source_url: 'https://www.gg.go.kr/news/1',
    published_at: new Date('2025-12-21'),
    category: 'policy',
    tags: ['기초연금', '경기도', '지방정책'],
  },
  {
    id: '4',
    title: '독거노인 맞춤돌봄 대상 확대',
    summary: '독거노인 맞춤돌봄서비스 대상이 전체 65세 이상으로 확대됩니다.',
    full_content: `보건복지부는 독거노인 맞춤돌봄서비스 대상을 기존 소득 하위 27%에서 전체 65세 이상으로 확대한다고 밝혔습니다.
    월 4회 방문 서비스와 안전확인이 제공되며, 주민센터에서 신청 가능합니다.`,
    source: '보건복지부',
    source_url: 'https://www.mohw.go.kr/news/2',
    published_at: new Date('2025-12-22'),
    category: 'policy',
    tags: ['돌봄서비스', '독거노인', '복지'],
  },
  {
    id: '5',
    title: '맞춤형 돌봄서비스 신청 방법 안내',
    summary: '맞춤형 돌봄서비스 신청 절차와 방법을 안내합니다.',
    full_content: `65세 이상 독거노인이면 누구나 맞춤형 돌봄서비스를 신청할 수 있습니다.
    신청은 주민센터 방문 또는 복지로 웹사이트(www.bokjiro.go.kr)에서 가능합니다.
    월 4회 생활지원사가 방문하여 안전확인과 생활 지원을 제공합니다.`,
    source: '서울시복지재단',
    source_url: 'https://www.welfare.seoul.kr/news/1',
    published_at: new Date('2025-12-23'),
    category: 'policy',
    tags: ['돌봄서비스', '신청방법', '복지'],
  },
  {
    id: '6',
    title: '노인 일자리 사업 참여자 모집',
    summary: '2026년 노인 일자리 사업 참여자를 모집합니다.',
    full_content: `2026년 노인 일자리 사업에 참여할 어르신을 모집합니다.
    60세 이상이면 누구나 신청 가능하며, 공익활동, 사회서비스형 등 다양한 유형이 있습니다.
    월 최대 60시간 활동하며 월 27만원의 활동비가 지급됩니다.`,
    source: '한국노인인력개발원',
    source_url: 'https://www.kordi.or.kr/news/1',
    published_at: new Date('2025-12-18'),
    category: 'social-service',
    tags: ['노인일자리', '모집', '참여'],
  },
];

async function main() {
  console.log('='.repeat(60));
  console.log('📊 AI 콘텐츠 큐레이션 시작');
  console.log('='.repeat(60));
  console.log();

  const startTime = Date.now();

  try {
    // 큐레이션 실행
    const curatedGroups = await curateContents(sampleContents, {
      similarityThreshold: 0.80, // 80% 이상 유사하면 그룹화
      minImportanceScore: 4,      // 중요도 4점 이상만 선택
    });

    console.log();
    console.log('='.repeat(60));
    console.log('✅ 큐레이션 완료');
    console.log('='.repeat(60));
    console.log();
    console.log(`원본 콘텐츠: ${sampleContents.length}개`);
    console.log(`큐레이션 결과: ${curatedGroups.length}개`);
    console.log(`압축률: ${((1 - curatedGroups.length / sampleContents.length) * 100).toFixed(1)}%`);
    console.log();

    // 결과 출력
    curatedGroups.forEach((group, index) => {
      console.log('-'.repeat(60));
      console.log(`[${index + 1}/${curatedGroups.length}] ${group.title}`);
      console.log('-'.repeat(60));
      console.log();
      console.log(`⭐ 중요도: ${group.importance_score}/10`);
      console.log(`📁 카테고리: ${group.category}`);
      console.log(`🏷️  태그: ${group.tags.join(', ')}`);
      console.log(`📄 원본 출처: ${group.source_count}개`);
      console.log();
      console.log('💡 핵심 요약:');
      console.log(group.ai_summary);
      console.log();

      if (group.key_points.length > 0) {
        console.log('📌 주요 포인트:');
        group.key_points.forEach((point, i) => {
          console.log(`  ${i + 1}. ${point}`);
        });
        console.log();
      }

      console.log('📄 원본 출처:');
      group.source_contents.forEach((content, i) => {
        console.log(`  ${i + 1}. ${content.title}`);
        console.log(`     출처: ${content.source} (${content.published_at.toLocaleDateString('ko-KR')})`);
        console.log(`     URL: ${content.source_url}`);
      });
      console.log();
    });

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('='.repeat(60));
    console.log(`⏱️  소요 시간: ${duration}초`);
    console.log('='.repeat(60));

    // TODO: 데이터베이스에 저장
    // await saveCuratedGroups(curatedGroups);

  } catch (error) {
    console.error('❌ 큐레이션 실패:', error);
    process.exit(1);
  }
}

// 실행
if (require.main === module) {
  main().catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
}

export default main;
