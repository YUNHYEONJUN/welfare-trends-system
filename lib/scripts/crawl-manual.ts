#!/usr/bin/env node

/**
 * 수동 크롤링 스크립트 (대화형)
 * 
 * 사용자가 선택적으로 원하는 소스만 크롤링할 수 있습니다.
 * 
 * 사용법:
 * npm run crawl:manual
 */

import { WebCrawler, crawlerConfigs } from '../crawler';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * 사용자 입력 받기
 */
function prompt(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

/**
 * 메뉴 표시
 */
function showMenu() {
  console.clear();
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         경기북서부노인보호전문기관 복지동향 시스템         ║');
  console.log('║                   수동 크롤링 도구                         ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  console.log('📌 크롤링 옵션을 선택하세요:\n');
  console.log('  1. 전체 크롤링 (모든 소스)');
  console.log('  2. 사회서비스원만 크롤링 (17개 지역)');
  console.log('  3. 카테고리별 크롤링 (정책/학술/짧은생각)');
  console.log('  4. 개별 소스 선택');
  console.log('  5. 특정 지역 사회서비스원');
  console.log('  0. 종료\n');
}

/**
 * 카테고리별 크롤링
 */
async function crawlByCategory() {
  console.log('\n📁 카테고리 선택:');
  console.log('  1. 정책 (Policy)');
  console.log('  2. 학술 (Academy)');
  console.log('  3. 짧은생각 (Thoughts)');
  console.log('  4. 사회서비스원 (Social Service)\n');

  const choice = await prompt('선택 (1-4): ');
  
  const categoryMap: { [key: string]: string } = {
    '1': 'policy',
    '2': 'academy',
    '3': 'thoughts',
    '4': 'social-service',
  };

  const category = categoryMap[choice];
  if (!category) {
    console.log('❌ 잘못된 선택입니다.');
    return;
  }

  const configs = crawlerConfigs.filter(c => c.category === category);
  console.log(`\n📡 ${configs.length}개 소스 크롤링 시작...\n`);

  let success = 0;
  let failed = 0;
  let totalContents = 0;

  for (const config of configs) {
    try {
      console.log(`📡 ${config.source}${config.region ? ` (${config.region})` : ''}...`);
      const crawler = new WebCrawler(config);
      const contents = await crawler.crawl();
      console.log(`  ✓ ${contents.length}개 수집\n`);
      success++;
      totalContents += contents.length;
    } catch (error) {
      console.log(`  ✗ 실패\n`);
      failed++;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n✅ 완료: 성공 ${success}, 실패 ${failed}, 총 ${totalContents}개 콘텐츠`);
}

/**
 * 개별 소스 선택
 */
async function crawlIndividual() {
  console.log('\n📋 사용 가능한 소스 목록:\n');
  
  crawlerConfigs.forEach((config, index) => {
    const label = `${config.source}${config.region ? ` (${config.region})` : ''}`;
    console.log(`  ${index + 1}. ${label}`);
  });

  console.log('');
  const choice = await prompt(`선택 (1-${crawlerConfigs.length}): `);
  const index = parseInt(choice) - 1;

  if (index < 0 || index >= crawlerConfigs.length) {
    console.log('❌ 잘못된 선택입니다.');
    return;
  }

  const config = crawlerConfigs[index];
  console.log(`\n📡 크롤링 시작: ${config.source}${config.region ? ` (${config.region})` : ''}\n`);

  try {
    const crawler = new WebCrawler(config);
    const contents = await crawler.crawl();
    console.log(`✅ 성공: ${contents.length}개 콘텐츠 수집`);
    
    // 상위 5개 제목 표시
    if (contents.length > 0) {
      console.log('\n📄 수집된 콘텐츠 (상위 5개):');
      contents.slice(0, 5).forEach((content, i) => {
        console.log(`  ${i + 1}. ${content.title}`);
      });
    }
  } catch (error) {
    console.log(`❌ 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
}

/**
 * 특정 지역 사회서비스원
 */
async function crawlByRegion() {
  const regions = Array.from(new Set(
    crawlerConfigs
      .filter(c => c.category === 'social-service')
      .map(c => c.region)
      .filter(Boolean)
  ));

  console.log('\n🗺️  지역 목록:\n');
  regions.forEach((region, index) => {
    console.log(`  ${index + 1}. ${region}`);
  });

  console.log('');
  const choice = await prompt(`선택 (1-${regions.length}): `);
  const index = parseInt(choice) - 1;

  if (index < 0 || index >= regions.length) {
    console.log('❌ 잘못된 선택입니다.');
    return;
  }

  const selectedRegion = regions[index];
  const config = crawlerConfigs.find(
    c => c.category === 'social-service' && c.region === selectedRegion
  );

  if (!config) {
    console.log('❌ 해당 지역의 크롤러를 찾을 수 없습니다.');
    return;
  }

  console.log(`\n📡 크롤링 시작: ${selectedRegion}\n`);

  try {
    const crawler = new WebCrawler(config);
    const contents = await crawler.crawl();
    console.log(`✅ 성공: ${contents.length}개 콘텐츠 수집`);
  } catch (error) {
    console.log(`❌ 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  let running = true;

  while (running) {
    showMenu();
    const choice = await prompt('선택: ');

    switch (choice) {
      case '1':
        console.log('\n🚀 전체 크롤링 시작...\n');
        const { crawlAllSources } = await import('./crawl-all');
        await crawlAllSources();
        break;

      case '2':
        console.log('\n🚀 사회서비스원 크롤링 시작...\n');
        const { crawlSocialService } = await import('./crawl-social-service');
        await crawlSocialService();
        break;

      case '3':
        await crawlByCategory();
        break;

      case '4':
        await crawlIndividual();
        break;

      case '5':
        await crawlByRegion();
        break;

      case '0':
        console.log('\n👋 종료합니다.');
        running = false;
        break;

      default:
        console.log('\n❌ 잘못된 선택입니다.');
    }

    if (running) {
      console.log('\n');
      await prompt('계속하려면 Enter를 누르세요...');
    }
  }

  rl.close();
}

// 스크립트 실행
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ 오류 발생:', error);
    rl.close();
    process.exit(1);
  });
}

export { main as runManualCrawl };
