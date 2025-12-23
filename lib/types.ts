export type ContentCategory = 'academy' | 'policy' | 'thoughts' | 'social-service';

export type ContentSource = 
  | '보건복지부'
  | '경기도'
  | '서울시'
  | '기타지자체'
  | '학술논문'
  | '에디터'
  | '사회서비스원';

export interface Content {
  id: string;
  title: string;
  summary: string;
  fullContent: string;
  category: ContentCategory;
  source: ContentSource;
  sourceUrl?: string;
  thumbnailUrl?: string;
  author?: string;
  editorNote?: string;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  viewCount: number;
  featured: boolean;
  isHighlight?: boolean; // 주요 기사 여부
  region?: SocialServiceRegion; // 사회서비스원 지역
}

export interface CrawlSource {
  id: string;
  name: string;
  baseUrl: string;
  category: ContentCategory;
  sourceType: ContentSource;
  lastCrawledAt?: Date;
  crawlFrequency: number; // 크롤링 주기 (시간 단위)
  active: boolean;
  selector?: string; // CSS 선택자
}

export interface Notification {
  id: string;
  contentId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

// 경기도 31개 시군 목록
export const GYEONGGI_CITIES = [
  '수원시', '성남시', '의정부시', '안양시', '부천시', '광명시', '평택시',
  '동두천시', '안산시', '고양시', '과천시', '구리시', '남양주시', '오산시',
  '시흥시', '군포시', '의왕시', '하남시', '용인시', '파주시', '이천시',
  '안성시', '김포시', '화성시', '광주시', '양주시', '포천시', '여주시',
  '연천군', '가평군', '양평군'
] as const;

export type GyeonggiCity = typeof GYEONGGI_CITIES[number];

// 전국 사회서비스원 지역
export const SOCIAL_SERVICE_REGIONS = [
  '서울특별시',
  '부산광역시',
  '대구광역시',
  '인천광역시',
  '광주광역시',
  '대전광역시',
  '울산광역시',
  '세종특별자치시',
  '경기도',
  '강원특별자치도',
  '충청북도',
  '충청남도',
  '전북특별자치도',
  '전라남도',
  '경상북도',
  '경상남도',
  '제주특별자치도',
] as const;

export type SocialServiceRegion = typeof SOCIAL_SERVICE_REGIONS[number];

// 사회서비스원 콘텐츠 타입
export interface SocialServiceContent extends Content {
  category: 'social-service';
  contentType: 'policy' | 'news' | 'notice' | 'recruitment';
  region: SocialServiceRegion;
  isHighlight: boolean;
}

// 타임라인 아이템
export interface TimelineItem {
  id: string;
  date: Date;
  title: string;
  description: string;
  category: ContentCategory;
  region?: SocialServiceRegion;
  url?: string;
}
