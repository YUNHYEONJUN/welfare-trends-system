#!/usr/bin/env node

/**
 * 크롤링 스케줄러
 * 
 * 매일 정해진 시간에 자동으로 크롤링을 실행합니다.
 * 
 * 사용법:
 * npm run crawl:schedule
 * 
 * 또는 cron으로 등록:
 * crontab -e
 * 0 9 * * * cd /home/user/webapp/welfare-trends && npm run crawl:schedule
 */

import { crawlSocialService } from './crawl-social-service';
import { crawlAllSources } from './crawl-all';
import fs from 'fs';
import path from 'path';

// 크롤링 로그 저장 경로
const LOG_DIR = path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, `crawl-${new Date().toISOString().split('T')[0]}.log`);

// 로그 디렉토리 생성
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

/**
 * 로그 기록 함수
 */
function log(message: string) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  // 콘솔 출력
  console.log(message);
  
  // 파일에 기록
  fs.appendFileSync(LOG_FILE, logMessage, 'utf-8');
}

/**
 * 스케줄된 크롤링 실행
 */
async function runScheduledCrawl() {
  log('==========================================');
  log('🕐 자동 크롤링 시작');
  log('==========================================');

  try {
    // 1. 사회서비스원 크롤링
    log('\n📡 1단계: 사회서비스원 크롤링 시작...');
    await crawlSocialService();
    log('✅ 사회서비스원 크롤링 완료');

    // 2. 기타 모든 소스 크롤링 (복지부, 경기도, 31개 시군 등)
    log('\n📡 2단계: 전체 소스 크롤링 시작...');
    await crawlAllSources();
    log('✅ 전체 소스 크롤링 완료');

    log('\n==========================================');
    log('✅ 자동 크롤링 성공적으로 완료');
    log('==========================================');
  } catch (error) {
    log(`\n❌ 크롤링 중 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    log(`상세 오류:\n${error instanceof Error ? error.stack : ''}`);
    throw error;
  }
}

/**
 * 다음 크롤링 시간 계산
 */
function getNextCrawlTime(targetHour: number = 9, targetMinute: number = 0): Date {
  const now = new Date();
  const next = new Date();
  
  next.setHours(targetHour, targetMinute, 0, 0);
  
  // 이미 지난 시간이면 다음날로
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  
  return next;
}

/**
 * 크롤링 스케줄러 시작
 */
async function startScheduler() {
  // 환경 변수에서 크롤링 시간 읽기 (기본값: 오전 9시)
  const CRAWL_HOUR = parseInt(process.env.CRAWL_HOUR || '9', 10);
  const CRAWL_MINUTE = parseInt(process.env.CRAWL_MINUTE || '0', 10);
  
  log(`🕐 크롤링 스케줄러 시작됨`);
  log(`⏰ 매일 ${CRAWL_HOUR}시 ${CRAWL_MINUTE}분에 실행됩니다.`);

  // 즉시 한 번 실행 (선택적)
  const runImmediately = process.env.CRAWL_RUN_IMMEDIATELY === 'true';
  if (runImmediately) {
    log('\n🚀 즉시 실행 모드: 첫 크롤링을 지금 시작합니다...');
    await runScheduledCrawl();
  }

  // 반복 스케줄 설정
  function scheduleNextCrawl() {
    const nextTime = getNextCrawlTime(CRAWL_HOUR, CRAWL_MINUTE);
    const delay = nextTime.getTime() - Date.now();
    
    log(`\n⏳ 다음 크롤링 예정: ${nextTime.toLocaleString('ko-KR')}`);
    log(`   (${Math.round(delay / 1000 / 60)} 분 후)`);

    setTimeout(async () => {
      await runScheduledCrawl();
      scheduleNextCrawl(); // 다음 실행 예약
    }, delay);
  }

  scheduleNextCrawl();
}

// 스크립트 실행
if (require.main === module) {
  // 단발성 실행 모드
  if (process.argv.includes('--once')) {
    log('🚀 단발성 크롤링 모드');
    runScheduledCrawl()
      .then(() => {
        process.exit(0);
      })
      .catch((error) => {
        log(`❌ 오류 발생: ${error}`);
        process.exit(1);
      });
  } 
  // 스케줄러 모드 (계속 실행)
  else {
    startScheduler().catch((error) => {
      log(`❌ 스케줄러 오류: ${error}`);
      process.exit(1);
    });
  }
}

export { runScheduledCrawl, startScheduler };
