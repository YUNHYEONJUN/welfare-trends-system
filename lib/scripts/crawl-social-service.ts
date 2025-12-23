#!/usr/bin/env node

/**
 * 사회서비스원 실시간 크롤링 스크립트
 * 
 * 사용법:
 * npm run crawl:social-service
 * 
 * 또는 특정 지역만:
 * npm run crawl:social-service -- --region=경기도
 */

import { WebCrawler, getSocialServiceCrawlers, getCrawlerByRegion } from '../crawler';
import { SocialServiceRegion } from '../types';

async function crawlSocialService(region?: SocialServiceRegion) {
  console.log('🚀 사회서비스원 크롤링 시작...\n');

  const crawlers = region 
    ? [getCrawlerByRegion(region)].filter(Boolean)
    : getSocialServiceCrawlers();

  if (crawlers.length === 0) {
    console.error('❌ 크롤러를 찾을 수 없습니다.');
    return;
  }

  const results = {
    success: 0,
    failed: 0,
    total: 0,
    highlights: 0,
    recruitment: 0,
  };

  for (const config of crawlers) {
    if (!config) continue;

    try {
      console.log(`📡 크롤링 중: ${config.region || '알 수 없음'}`);
      const crawler = new WebCrawler(config);
      const contents = await crawler.crawl();

      console.log(`  ✓ ${contents.length}개 콘텐츠 수집`);
      
      // 통계 업데이트
      results.total += contents.length;
      results.success++;
      
      contents.forEach(content => {
        if (content.isHighlight) results.highlights++;
        // contentType이 있다면 채용 정보 카운트
        // @ts-ignore
        if (content.contentType === 'recruitment') results.recruitment++;
      });

      // 실제 환경에서는 여기서 데이터베이스에 저장
      // await saveToDatabase(contents);

    } catch (error) {
      console.error(`  ✗ 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
      results.failed++;
    }

    // API 부하 방지를 위한 딜레이
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 크롤링 결과 요약');
  console.log('='.repeat(50));
  console.log(`✓ 성공: ${results.success}개 지역`);
  console.log(`✗ 실패: ${results.failed}개 지역`);
  console.log(`📄 총 콘텐츠: ${results.total}개`);
  console.log(`⭐ 주요 기사: ${results.highlights}개`);
  console.log(`👥 채용 정보: ${results.recruitment}개`);
  console.log('='.repeat(50) + '\n');

  console.log('✅ 크롤링 완료!');
}

// 스크립트 실행
if (require.main === module) {
  const args = process.argv.slice(2);
  const regionArg = args.find(arg => arg.startsWith('--region='));
  const region = regionArg ? regionArg.split('=')[1] as SocialServiceRegion : undefined;

  crawlSocialService(region)
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 크롤링 중 오류 발생:', error);
      process.exit(1);
    });
}

export { crawlSocialService };
