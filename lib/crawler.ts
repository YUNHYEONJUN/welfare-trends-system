import axios from 'axios';
import * as cheerio from 'cheerio';
import { Content, ContentCategory, ContentSource, SocialServiceRegion } from './types';

export interface CrawlerConfig {
  url: string;
  category: ContentCategory;
  source: ContentSource;
  region?: SocialServiceRegion; // 사회서비스원 지역
  selector: {
    container: string;
    title: string;
    link: string;
    date?: string;
    summary?: string;
    thumbnail?: string;
  };
}

export class WebCrawler {
  private config: CrawlerConfig;

  constructor(config: CrawlerConfig) {
    this.config = config;
  }

  async crawl(): Promise<Partial<Content>[]> {
    try {
      const response = await axios.get(this.config.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        timeout: 30000,
      });

      const $ = cheerio.load(response.data);
      const items: Partial<Content>[] = [];

      $(this.config.selector.container).each((_, element) => {
        const $el = $(element);
        
        const title = $el.find(this.config.selector.title).text().trim();
        const link = $el.find(this.config.selector.link).attr('href');
        const summary = this.config.selector.summary 
          ? $el.find(this.config.selector.summary).text().trim()
          : '';
        const thumbnail = this.config.selector.thumbnail
          ? $el.find(this.config.selector.thumbnail).attr('src')
          : undefined;
        const dateText = this.config.selector.date
          ? $el.find(this.config.selector.date).text().trim()
          : '';

        if (title && link) {
          const item: Partial<Content> = {
            title,
            summary,
            fullContent: summary,
            category: this.config.category,
            source: this.config.source,
            sourceUrl: this.resolveUrl(link),
            thumbnailUrl: thumbnail ? this.resolveUrl(thumbnail) : undefined,
            publishedAt: this.parseDate(dateText),
            tags: this.extractTags(title, summary),
            viewCount: 0,
            featured: false,
            isHighlight: this.isHighlightContent(title, summary),
          };

          // 사회서비스원인 경우 지역 정보 추가
          if (this.config.region) {
            item.region = this.config.region;
          }

          items.push(item);
        }
      });

      return items;
    } catch (error) {
      console.error(`크롤링 오류 (${this.config.url}):`, error);
      return [];
    }
  }

  private resolveUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    
    const baseUrl = new URL(this.config.url);
    if (url.startsWith('/')) {
      return `${baseUrl.protocol}//${baseUrl.host}${url}`;
    }
    return url;
  }

  private parseDate(dateStr: string): Date {
    if (!dateStr) return new Date();
    
    try {
      // 한국어 날짜 처리 (예: "2024년 12월 23일")
      const koreanDateMatch = dateStr.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
      if (koreanDateMatch) {
        const [, year, month, day] = koreanDateMatch;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }

      // ISO 형식 또는 표준 형식
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    } catch (error) {
      console.warn('날짜 파싱 실패:', dateStr);
    }
    
    return new Date();
  }

  private extractTags(title: string, summary: string): string[] {
    const text = `${title} ${summary}`.toLowerCase();
    const tags: string[] = [];

    // 키워드 기반 태그 추출
    const keywords = [
      '노인', '장애인', '아동', '청소년', '여성', '가족',
      '돌봄', '복지', '정책', '지원', '서비스', '교육',
      '건강', '의료', '주거', '일자리', '소득', '사회보장',
      '사회서비스원', '요양보호사', '사회복지사', '채용'
    ];

    keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        tags.push(keyword);
      }
    });

    return [...new Set(tags)]; // 중복 제거
  }

  /**
   * 주요 기사 여부 판단
   */
  private isHighlightContent(title: string, summary: string): boolean {
    const text = `${title} ${summary}`.toLowerCase();
    
    // 주요 키워드 포함 여부
    const highlightKeywords = [
      '발표', '확대', '시행', '신규', '개선', '강화',
      '채용', '모집', '대규모', '전국', '최초'
    ];

    return highlightKeywords.some(keyword => text.includes(keyword));
  }

  // 상세 페이지 크롤링 (필요시)
  async crawlDetail(url: string): Promise<string> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        timeout: 30000,
      });

      const $ = cheerio.load(response.data);
      
      // 본문 추출 (일반적인 선택자)
      const content = $('.content, .article-content, .view-content, main article')
        .first()
        .text()
        .trim();

      return content || '';
    } catch (error) {
      console.error(`상세 크롤링 오류 (${url}):`, error);
      return '';
    }
  }
}

// 크롤러 설정 예시
export const crawlerConfigs: CrawlerConfig[] = [
  // 보건복지부
  {
    url: 'https://www.mohw.go.kr/board.es?mid=a10503000000&bid=0027',
    category: 'policy',
    source: '보건복지부',
    selector: {
      container: '.board-list tbody tr',
      title: 'td.title a',
      link: 'td.title a',
      date: 'td.date',
    },
  },
  
  // 전국 사회서비스원 크롤링 설정
  // 서울특별시사회서비스원
  {
    url: 'https://www.seoulwelfare.or.kr/board/list.do?boardId=notice',
    category: 'social-service',
    source: '사회서비스원',
    region: '서울특별시',
    selector: {
      container: '.board-list li',
      title: '.title',
      link: 'a',
      date: '.date',
    },
  },

  // 경기도사회서비스원
  {
    url: 'https://www.ggwelfare.or.kr/board/notice',
    category: 'social-service',
    source: '사회서비스원',
    region: '경기도',
    selector: {
      container: '.board-list tbody tr',
      title: '.subject',
      link: 'a',
      date: '.date',
    },
  },

  // 부산광역시사회서비스원
  {
    url: 'https://www.bswc.or.kr/bbs/list.do?ptIdx=100',
    category: 'social-service',
    source: '사회서비스원',
    region: '부산광역시',
    selector: {
      container: '.board-list tr',
      title: '.subject a',
      link: '.subject a',
      date: '.date',
    },
  },

  // 인천광역시사회서비스원
  {
    url: 'https://www.insw.or.kr/board/notice',
    category: 'social-service',
    source: '사회서비스원',
    region: '인천광역시',
    selector: {
      container: '.notice-list li',
      title: '.tit',
      link: 'a',
      date: '.date',
    },
  },

  // 대구광역시사회서비스원
  {
    url: 'https://www.dgsw.or.kr/board/notice',
    category: 'social-service',
    source: '사회서비스원',
    region: '대구광역시',
    selector: {
      container: '.board tbody tr',
      title: '.subject',
      link: 'a',
      date: '.date',
    },
  },

  // 광주광역시사회서비스원
  {
    url: 'https://www.gjsw.or.kr/board/notice',
    category: 'social-service',
    source: '사회서비스원',
    region: '광주광역시',
    selector: {
      container: '.board-list li',
      title: 'h3',
      link: 'a',
      date: '.date',
    },
  },

  // 대전광역시사회서비스원
  {
    url: 'https://www.djsw.or.kr/board/notice',
    category: 'social-service',
    source: '사회서비스원',
    region: '대전광역시',
    selector: {
      container: '.notice-item',
      title: '.title',
      link: 'a',
      date: '.date',
    },
  },

  // 울산광역시사회서비스원
  {
    url: 'https://www.ulsansw.or.kr/board/notice',
    category: 'social-service',
    source: '사회서비스원',
    region: '울산광역시',
    selector: {
      container: '.board-row',
      title: '.tit',
      link: 'a',
      date: '.date',
    },
  },

  // 세종특별자치시사회서비스원
  {
    url: 'https://www.sejongwelfare.or.kr/board/notice',
    category: 'social-service',
    source: '사회서비스원',
    region: '세종특별자치시',
    selector: {
      container: '.board-list tr',
      title: '.subject',
      link: 'a',
      date: '.regdate',
    },
  },

  // 강원특별자치도사회서비스원
  {
    url: 'https://www.gwsw.or.kr/board/notice',
    category: 'social-service',
    source: '사회서비스원',
    region: '강원특별자치도',
    selector: {
      container: '.notice-list li',
      title: '.title',
      link: 'a',
      date: '.date',
    },
  },

  // 충청북도사회서비스원
  {
    url: 'https://www.cbsw.or.kr/board/notice',
    category: 'social-service',
    source: '사회서비스원',
    region: '충청북도',
    selector: {
      container: '.board tbody tr',
      title: '.subject',
      link: 'a',
      date: '.date',
    },
  },

  // 충청남도사회서비스원
  {
    url: 'https://www.cnsw.or.kr/board/notice',
    category: 'social-service',
    source: '사회서비스원',
    region: '충청남도',
    selector: {
      container: '.notice-item',
      title: 'h4',
      link: 'a',
      date: '.date',
    },
  },

  // 전북특별자치도사회서비스원
  {
    url: 'https://www.jbsw.or.kr/board/notice',
    category: 'social-service',
    source: '사회서비스원',
    region: '전북특별자치도',
    selector: {
      container: '.board-list li',
      title: '.tit',
      link: 'a',
      date: '.date',
    },
  },

  // 전라남도사회서비스원
  {
    url: 'https://www.jnsw.or.kr/board/notice',
    category: 'social-service',
    source: '사회서비스원',
    region: '전라남도',
    selector: {
      container: '.notice-row',
      title: '.title',
      link: 'a',
      date: '.regdate',
    },
  },

  // 경상북도사회서비스원
  {
    url: 'https://www.gbsw.or.kr/board/notice',
    category: 'social-service',
    source: '사회서비스원',
    region: '경상북도',
    selector: {
      container: '.board tbody tr',
      title: '.subject',
      link: 'a',
      date: '.date',
    },
  },

  // 경상남도사회서비스원
  {
    url: 'https://www.gnsw.or.kr/board/notice',
    category: 'social-service',
    source: '사회서비스원',
    region: '경상남도',
    selector: {
      container: '.notice-list li',
      title: 'h3',
      link: 'a',
      date: '.date',
    },
  },

  // 제주특별자치도사회서비스원
  {
    url: 'https://www.jejusw.or.kr/board/notice',
    category: 'social-service',
    source: '사회서비스원',
    region: '제주특별자치도',
    selector: {
      container: '.board-item',
      title: '.title',
      link: 'a',
      date: '.date',
    },
  },
];

/**
 * 사회서비스원만 필터링
 */
export function getSocialServiceCrawlers(): CrawlerConfig[] {
  return crawlerConfigs.filter(config => config.category === 'social-service');
}

/**
 * 특정 지역 사회서비스원 크롤러 가져오기
 */
export function getCrawlerByRegion(region: SocialServiceRegion): CrawlerConfig | undefined {
  return crawlerConfigs.find(
    config => config.category === 'social-service' && config.region === region
  );
}
