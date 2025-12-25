#!/usr/bin/env ts-node
/**
 * AI 큐레이션 파이프라인 실행 스크립트
 * 
 * 사용법:
 * 1. 모든 카테고리 처리: npm run curate
 * 2. 특정 카테고리: npm run curate -- --category=policy
 * 3. 중요도 필터: npm run curate -- --min-importance=7
 * 4. 테스트 모드: npm run curate -- --limit=10
 */

import { runCurationPipeline, getCurationStats } from '../db-curator';

// 명령줄 인자 파싱
const args = process.argv.slice(2);
const options: any = {
  category: undefined,
  limit: undefined,
  similarityThreshold: 0.85,
  minImportanceScore: 5,
};

for (const arg of args) {
  if (arg.startsWith('--category=')) {
    options.category = arg.split('=')[1];
  } else if (arg.startsWith('--limit=')) {
    options.limit = parseInt(arg.split('=')[1]);
  } else if (arg.startsWith('--similarity=')) {
    options.similarityThreshold = parseFloat(arg.split('=')[1]);
  } else if (arg.startsWith('--min-importance=')) {
    options.minImportanceScore = parseInt(arg.split('=')[1]);
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('  🤖 AI Content Curation Pipeline');
  console.log('='.repeat(60));
  console.log();

  // 시작 시간
  const startTime = Date.now();

  try {
    // 1. 큐레이션 실행
    console.log('📊 Starting curation with options:');
    console.log(JSON.stringify(options, null, 2));
    console.log();

    const result = await runCurationPipeline(options);

    // 2. 결과 출력
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log();
    console.log('='.repeat(60));
    console.log('  ✅ Curation Completed');
    console.log('='.repeat(60));
    console.log();
    console.log(`⏱️  Elapsed time: ${elapsed}s`);
    console.log(`📥 Processed contents: ${result.processedCount}`);
    console.log(`📦 Curated groups: ${result.curatedGroupsCount}`);
    console.log(`💾 Saved content IDs: ${result.savedContentIds.length}`);
    
    if (result.savedContentIds.length > 0) {
      console.log();
      console.log('Saved Content IDs:');
      result.savedContentIds.forEach(id => console.log(`  - ${id}`));
    }

    // 3. 통계 조회
    console.log();
    console.log('='.repeat(60));
    console.log('  📈 Curation Statistics');
    console.log('='.repeat(60));
    console.log();

    const stats = await getCurationStats();

    console.log('📊 Curation Groups by Category:');
    console.log();
    console.table(stats.curation);

    console.log();
    console.log('📦 Raw Content Processing Status:');
    console.log();
    console.table(stats.raw);

    process.exit(0);
  } catch (error) {
    console.error();
    console.error('❌ Curation failed:', error);
    console.error();
    process.exit(1);
  }
}

main();
