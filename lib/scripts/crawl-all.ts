#!/usr/bin/env node

/**
 * 전체 소스 크롤링 스크립트
 * 
 * 복지부, 경기도, 31개 시군, 사회서비스원 등 모든 소스 크롤링
 * 
 * 사용법:
 * npm run crawl:all
 */

import { WebCrawler, crawlerConfigs } from '../crawler';

interface CrawlStats {
  totalSources: number;
  successSources: number;
  failedSources: number;
  totalContents: number;
  contentsByCategory: {
    [key: string]: number;
  };
  highlights: number;
  executionTime: number;
}

async function crawlAllSources(): Promise<CrawlStats> {
  const startTime = Date.now();
  
  console.log('🚀 전체 소스 크롤링 시작...\n');
  console.log(`📊 총 ${crawlerConfigs.length}개 소스 크롤링 예정\n`);

  const stats: CrawlStats = {
    totalSources: crawlerConfigs.length,
    successSources: 0,
    failedSources: 0,
    totalContents: 0,
    contentsByCategory: {},
    highlights: 0,
    executionTime: 0,
  };

  let processed = 0;

  for (const config of crawlerConfigs) {
    processed++;
    const progress = `[${processed}/${crawlerConfigs.length}]`;
    
    try {
      console.log(`${progress} 📡 크롤링 중: ${config.source}${config.region ? ` (${config.region})` : ''}`);
      
      const crawler = new WebCrawler(config);
      const contents = await crawler.crawl();

      console.log(`${progress}   ✓ ${contents.length}개 콘텐츠 수집`);
      
      // 통계 업데이트
      stats.successSources++;
      stats.totalContents += contents.length;
      
      // 카테고리별 통계
      const category = config.category;
      stats.contentsByCategory[category] = (stats.contentsByCategory[category] || 0) + contents.length;
      
      // 하이라이트 통계
      contents.forEach(content => {
        if (content.isHighlight) stats.highlights++;
      });

      // 실제 환경에서는 여기서 데이터베이스에 저장
      // await saveToDatabase(contents);

    } catch (error) {
      console.error(`${progress}   ✗ 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
      stats.failedSources++;
    }

    // API 부하 방지를 위한 딜레이 (1초)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  stats.executionTime = Date.now() - startTime;

  // 결과 출력
  console.log('\n' + '='.repeat(60));
  console.log('📊 크롤링 결과 요약');
  console.log('='.repeat(60));
  console.log(`✓ 성공: ${stats.successSources}개 소스 (${((stats.successSources / stats.totalSources) * 100).toFixed(1)}%)`);
  console.log(`✗ 실패: ${stats.failedSources}개 소스 (${((stats.failedSources / stats.totalSources) * 100).toFixed(1)}%)`);
  console.log(`📄 총 수집 콘텐츠: ${stats.totalContents}개`);
  console.log(`⭐ 주요 기사: ${stats.highlights}개`);
  console.log('\n📁 카테고리별 통계:');
  
  Object.entries(stats.contentsByCategory).forEach(([category, count]) => {
    const categoryName = {
      'policy': '정책',
      'academy': '학술',
      'thoughts': '짧은생각',
      'social-service': '사회서비스원',
    }[category] || category;
    console.log(`   ${categoryName}: ${count}개`);
  });
  
  console.log(`\n⏱️  실행 시간: ${(stats.executionTime / 1000).toFixed(1)}초`);
  console.log('='.repeat(60) + '\n');

  console.log('✅ 전체 크롤링 완료!');

  return stats;
}

// 스크립트 실행
if (require.main === module) {
  crawlAllSources()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 크롤링 중 오류 발생:', error);
      process.exit(1);
    });
}

export { crawlAllSources };
