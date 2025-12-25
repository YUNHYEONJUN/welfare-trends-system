#!/usr/bin/env node

/**
 * AI 기능 테스트 스크립트
 * 
 * 사용법:
 * npm run test:ai
 */

import { AIContentProcessor } from '../ai-processor';

async function testAI() {
  console.log('🤖 AI 기능 테스트 시작...\n');

  const processor = new AIContentProcessor();

  // 테스트 콘텐츠
  const testContent = `
경기도사회서비스원이 2025년 사회서비스 확대를 위해 돌봄 인력 1,000명을 신규 채용한다고 발표했습니다. 
이번 채용은 노인, 장애인, 아동 돌봄 서비스 강화를 위한 것으로, 
요양보호사 600명, 사회복지사 300명, 간호사 100명을 모집합니다.
급여는 시장 평균 대비 10% 인상되며, 4대 보험과 각종 복리후생이 제공됩니다.
지원 기간은 2024년 12월 30일까지이며, 온라인으로 접수 가능합니다.
  `.trim();

  try {
    console.log('📝 테스트 내용:');
    console.log(testContent);
    console.log('\n' + '='.repeat(60) + '\n');

    // 1. 요약 테스트
    console.log('1️⃣ 요약 생성 중...');
    const summary = await processor.summarize(testContent);
    console.log('✅ 요약 결과:');
    console.log(summary);
    console.log('\n' + '='.repeat(60) + '\n');

    // 2. 키워드 추출 테스트
    console.log('2️⃣ 키워드 추출 중...');
    const keywords = await processor.extractKeywords(testContent);
    console.log('✅ 추출된 키워드:');
    console.log(keywords.join(', '));
    console.log('\n' + '='.repeat(60) + '\n');

    // 3. 에디터 의견 생성 테스트
    console.log('3️⃣ 에디터 의견 생성 중...');
    const editorNote = await processor.generateEditorNote({
      title: '경기도사회서비스원 돌봄 인력 1,000명 채용',
      summary: testContent,
      category: 'social-service',
      source: '사회서비스원',
    });
    console.log('✅ 에디터 의견:');
    console.log(editorNote);
    console.log('\n' + '='.repeat(60) + '\n');

    console.log('✅ 모든 테스트 완료!');

  } catch (error) {
    console.error('❌ 테스트 실패:', error);
    
    if (error instanceof Error && error.message.includes('API')) {
      console.log('\n💡 해결 방법:');
      console.log('1. GenSpark 대시보드에서 API 키를 생성하세요');
      console.log('2. "Inject to Sandbox" 버튼을 클릭하세요');
      console.log('3. 또는 .env.local 파일에 OPENAI_API_KEY를 설정하세요');
    }
  }
}

// 스크립트 실행
if (require.main === module) {
  testAI()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 오류 발생:', error);
      process.exit(1);
    });
}

export { testAI };
