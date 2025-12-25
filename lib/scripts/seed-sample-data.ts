#!/usr/bin/env ts-node
/**
 * 샘플 크롤링 데이터 생성 스크립트
 * 테스트용 raw_crawled_contents 데이터 삽입
 */

import { pool, saveRawCrawledContent } from '../db-curator';

const sampleContents = [
  // 정책동향 - 기초연금 인상 관련 (유사 콘텐츠 5개)
  {
    title: '2026년 기초연금 월 40만원으로 인상 확정',
    summary: '보건복지부는 2026년 1월부터 기초연금을 현행 33만3천원에서 40만원으로 인상한다고 발표했다. 이는 약 20% 인상된 금액이다.',
    full_content: `보건복지부는 2026년 1월부터 기초연금을 현행 월 33만3천원에서 40만원으로 인상한다고 25일 발표했다.
    
이번 인상으로 65세 이상 소득 하위 70% 노인 약 665만명이 혜택을 받게 된다. 월 6만7천원 인상으로 연간 약 80만원의 추가 급여가 지급된다.

신청은 만 65세 생일이 속한 달의 1개월 전부터 주민센터 또는 복지로 웹사이트에서 가능하다.`,
    category: 'policy',
    source: '보건복지부',
    source_url: 'https://www.mohw.go.kr/board.es?mid=a10503000000&bid=0027',
    published_at: new Date('2025-12-20'),
    tags: ['기초연금', '노인복지', '정책', '인상'],
  },
  {
    title: '기초연금 40만원 시대...내년 1월부터 시행',
    summary: '정부가 기초연금을 월 40만원으로 인상하기로 최종 확정했다. 665만명의 노인이 혜택을 받는다.',
    full_content: `정부가 기초연금을 현행 33만3천원에서 40만원으로 인상하는 방안을 최종 확정했다.

기획재정부는 2026년 예산안에 기초연금 인상분 약 4조5천억원을 반영했다고 밝혔다.

이번 인상은 윤석열 대통령의 공약사항으로, 노인 빈곤율 완화를 위한 핵심 정책이다.`,
    category: 'policy',
    source: '기획재정부',
    source_url: 'https://www.moef.go.kr/nw/nes/detailNesDtaView.do',
    published_at: new Date('2025-12-21'),
    tags: ['기초연금', '노인복지', '예산', '인상'],
  },
  {
    title: '[속보] 기초연금 40만원 인상, 665만 노인 혜택',
    summary: '기초연금이 7년 만에 대폭 인상된다. 2026년 1월부터 월 40만원으로 지급된다.',
    full_content: `기초연금이 2026년 1월부터 월 40만원으로 인상된다. 이는 2019년 30만원으로 인상된 이후 7년 만의 대폭 인상이다.

보건복지부 관계자는 "노인 빈곤율이 OECD 국가 중 최고 수준인 점을 고려해 인상을 결정했다"고 밝혔다.

신청 대상은 만 65세 이상 소득 하위 70% 노인이며, 국민연금 수령액에 따라 감액될 수 있다.`,
    category: 'policy',
    source: '연합뉴스',
    source_url: 'https://www.yna.co.kr/view/AKR20251220',
    published_at: new Date('2025-12-20'),
    tags: ['기초연금', '속보', '노인복지'],
  },
  {
    title: '경기도, 기초연금 인상 환영...추가 지원 검토',
    summary: '경기도가 정부의 기초연금 인상 결정을 환영하며, 도 자체 추가 지원 방안을 검토 중이다.',
    full_content: `경기도는 정부의 기초연금 40만원 인상 결정을 환영하며, 도 차원의 추가 지원 방안을 검토 중이라고 밝혔다.

김동연 경기도지사는 "기초연금 인상은 환영할 만한 일이지만, 여전히 노인 빈곤율이 높은 만큼 도 차원의 추가 지원이 필요하다"고 말했다.

경기도는 현재 기초연금 수급자 중 저소득층을 대상으로 월 5만원의 추가 지원금을 검토 중이다.`,
    category: 'policy',
    source: '경기도',
    source_url: 'https://www.gg.go.kr/welfare',
    published_at: new Date('2025-12-21'),
    tags: ['기초연금', '경기도', '지방정책'],
  },
  {
    title: '노인단체, 기초연금 40만원 인상 "늦었지만 환영"',
    summary: '대한노인회 등 노인단체들이 기초연금 인상을 환영하면서도 물가 상승률을 고려한 추가 인상을 요구했다.',
    full_content: `대한노인회, 한국노인복지중앙회 등 주요 노인단체들이 기초연금 40만원 인상 결정을 환영하면서도, 물가 상승률을 고려한 추가 인상을 요구했다.

대한노인회 관계자는 "7년 만의 인상으로 물가 상승률을 감안하면 실질 구매력은 오히려 감소했다"며 "최소 45만원 이상으로 인상이 필요하다"고 주장했다.

노인빈곤율이 40%를 넘는 상황에서 기초연금만으로는 생활이 어렵다는 지적도 나왔다.`,
    category: 'policy',
    source: '대한노인회',
    source_url: 'https://www.koreapeople60.org',
    published_at: new Date('2025-12-22'),
    tags: ['기초연금', '노인단체', '요구사항'],
  },

  // 정책동향 - 노인 돌봄 서비스 확대 (유사 콘텐츠 3개)
  {
    title: '독거노인 맞춤돌봄서비스 대상 확대',
    summary: '2026년부터 독거노인 맞춤돌봄서비스 대상이 65세 이상 전체로 확대된다.',
    full_content: `보건복지부는 2026년부터 독거노인 맞춤돌봄서비스 대상을 현행 소득 하위 27%에서 65세 이상 전체로 확대한다고 발표했다.

이에 따라 약 180만명의 독거노인이 월 4회 방문 서비스와 안전확인 서비스를 받게 된다.

신청은 주민센터 또는 복지로(www.bokjiro.go.kr)에서 가능하며, 소득 수준에 따라 본인부담금이 차등 적용된다.`,
    category: 'policy',
    source: '보건복지부',
    source_url: 'https://www.mohw.go.kr/board.es?mid=a10503000000&bid=0028',
    published_at: new Date('2025-12-18'),
    tags: ['노인돌봄', '맞춤돌봄', '독거노인', '정책확대'],
  },
  {
    title: '노인돌봄 종합서비스, 이용자 만족도 90% 돌파',
    summary: '보건복지부 조사 결과, 노인돌봄 종합서비스 이용자 만족도가 90%를 넘었다.',
    full_content: `보건복지부가 실시한 2025년 노인돌봄 종합서비스 이용자 만족도 조사 결과, 90.3%가 서비스에 만족한다고 응답했다.

특히 방문요양, 방문목욕, 주야간보호 서비스의 만족도가 높았으며, 돌봄 인력의 전문성에 대한 평가도 긍정적이었다.

정부는 이번 조사 결과를 바탕으로 서비스 질 향상을 위한 추가 개선 방안을 마련할 계획이다.`,
    category: 'policy',
    source: '보건복지부',
    source_url: 'https://www.mohw.go.kr/board.es?mid=a10503000000&bid=0029',
    published_at: new Date('2025-12-19'),
    tags: ['노인돌봄', '만족도조사', '서비스품질'],
  },
  {
    title: '서울시, 24시간 노인 응급돌봄 서비스 시작',
    summary: '서울시가 독거노인을 위한 24시간 응급돌봄 서비스를 시작한다.',
    full_content: `서울시는 2026년 1월부터 독거노인을 위한 24시간 응급돌봄 서비스를 시작한다고 발표했다.

이 서비스는 AI 센서와 스마트워치를 활용해 노인의 이상 상황을 실시간으로 감지하고, 긴급 상황 발생 시 119와 연계해 즉각 대응하는 시스템이다.

서울시 관계자는 "독거노인 고독사 예방을 위한 핵심 사업"이라며 "2026년 말까지 5만명에게 서비스를 제공할 계획"이라고 밝혔다.`,
    category: 'policy',
    source: '서울시',
    source_url: 'https://welfare.seoul.go.kr/news',
    published_at: new Date('2025-12-22'),
    tags: ['노인돌봄', '서울시', '응급돌봄', '스마트케어'],
  },

  // 사회서비스원 - 경기도 (유사 콘텐츠 2개)
  {
    title: '[채용] 경기도사회서비스원 2026년 상반기 신규 직원 채용',
    summary: '경기도사회서비스원이 2026년 상반기 신규 직원을 공개 채용한다. 총 50명 모집.',
    full_content: `경기도사회서비스원은 2026년 상반기 신규 직원 50명을 공개 채용한다고 공고했다.

모집 분야는 요양보호사 30명, 사회복지사 15명, 간호사 5명이다.

접수 기간은 2026년 1월 2일부터 1월 15일까지이며, 경기도사회서비스원 홈페이지(www.ggwelfare.or.kr)에서 온라인 접수 가능하다.

자세한 사항은 채용 공고문을 참고하거나 인사팀(031-000-0000)으로 문의하면 된다.`,
    category: 'social-service',
    source: '경기도사회서비스원',
    source_url: 'https://www.ggwelfare.or.kr/board/notice',
    published_at: new Date('2025-12-23'),
    tags: ['채용', '경기도', '사회서비스원'],
    region: '경기도',
    content_type: 'recruitment',
  },
  {
    title: '경기도사회서비스원, 2025년 우수 돌봄기관 선정',
    summary: '경기도사회서비스원이 운영하는 노인요양시설이 2025년 우수 돌봄기관으로 선정됐다.',
    full_content: `경기도사회서비스원이 운영하는 ○○노인요양원이 보건복지부 주관 2025년 우수 돌봄기관으로 선정됐다.

이번 선정은 서비스 품질, 이용자 만족도, 종사자 처우 개선 등을 종합 평가해 이뤄졌다.

경기도사회서비스원은 "공공 돌봄의 모범 사례를 만들기 위해 지속적으로 노력하겠다"고 밝혔다.`,
    category: 'social-service',
    source: '경기도사회서비스원',
    source_url: 'https://www.ggwelfare.or.kr/board/news',
    published_at: new Date('2025-12-24'),
    tags: ['우수기관', '경기도', '돌봄서비스'],
    region: '경기도',
    content_type: 'news',
  },
];

async function main() {
  console.log('='.repeat(60));
  console.log('  📦 Inserting Sample Crawled Data');
  console.log('='.repeat(60));
  console.log();

  let successCount = 0;
  let failCount = 0;

  for (const content of sampleContents) {
    try {
      const id = await saveRawCrawledContent(content as any);
      console.log(`✅ Saved: ${content.title.substring(0, 50)}... (ID: ${id})`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed: ${content.title.substring(0, 50)}...`);
      console.error(error);
      failCount++;
    }
  }

  console.log();
  console.log('='.repeat(60));
  console.log(`✅ Success: ${successCount} / ${sampleContents.length}`);
  console.log(`❌ Failed: ${failCount} / ${sampleContents.length}`);
  console.log('='.repeat(60));

  await pool.end();
  process.exit(0);
}

main();
