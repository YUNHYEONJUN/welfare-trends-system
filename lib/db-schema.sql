-- 복지동향 시스템 데이터베이스 스키마 (업데이트)

-- 콘텐츠 테이블
CREATE TABLE IF NOT EXISTS contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  summary TEXT,
  full_content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('academy', 'policy', 'thoughts', 'social-service')),
  source VARCHAR(100) NOT NULL,
  source_url TEXT,
  thumbnail_url TEXT,
  author VARCHAR(200),
  editor_note TEXT,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tags TEXT[] DEFAULT '{}',
  view_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  is_highlight BOOLEAN DEFAULT FALSE, -- 주요 기사 여부
  region VARCHAR(50), -- 사회서비스원 지역
  content_type VARCHAR(50), -- social-service의 경우: policy, news, notice, recruitment
  CONSTRAINT valid_category CHECK (category IN ('academy', 'policy', 'thoughts', 'social-service'))
);

-- 크롤링 소스 테이블
CREATE TABLE IF NOT EXISTS crawl_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  base_url TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  source_type VARCHAR(100) NOT NULL,
  region VARCHAR(50), -- 사회서비스원 지역
  last_crawled_at TIMESTAMP WITH TIME ZONE,
  crawl_frequency INTEGER NOT NULL DEFAULT 24, -- 시간 단위
  active BOOLEAN DEFAULT TRUE,
  selector TEXT, -- CSS 선택자
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_crawl_category CHECK (category IN ('academy', 'policy', 'thoughts', 'social-service'))
);

-- 알림 테이블
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES contents(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  notification_type VARCHAR(50) DEFAULT 'update', -- update, highlight, recruitment
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 실시간 업데이트 로그 테이블
CREATE TABLE IF NOT EXISTS update_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES contents(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, -- created, updated, deleted
  changes JSONB, -- 변경 사항
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_contents_category ON contents(category);
CREATE INDEX IF NOT EXISTS idx_contents_source ON contents(source);
CREATE INDEX IF NOT EXISTS idx_contents_region ON contents(region) WHERE region IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contents_is_highlight ON contents(is_highlight) WHERE is_highlight = TRUE;
CREATE INDEX IF NOT EXISTS idx_contents_published_at ON contents(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_contents_created_at ON contents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contents_featured ON contents(featured) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_crawl_sources_active ON crawl_sources(active) WHERE active = TRUE;
CREATE INDEX IF NOT EXISTS idx_crawl_sources_region ON crawl_sources(region) WHERE region IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read) WHERE read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_update_logs_created_at ON update_logs(created_at DESC);

-- 전체 텍스트 검색을 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_contents_search ON contents USING GIN(to_tsvector('korean', title || ' ' || COALESCE(summary, '') || ' ' || full_content));

-- 트리거: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contents_updated_at
  BEFORE UPDATE ON contents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crawl_sources_updated_at
  BEFORE UPDATE ON crawl_sources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 트리거: 신규 콘텐츠 생성 시 알림 생성
CREATE OR REPLACE FUNCTION create_notification_on_content_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- 주요 기사인 경우
  IF NEW.is_highlight THEN
    INSERT INTO notifications (content_id, title, message, notification_type)
    VALUES (
      NEW.id,
      '[주요] ' || NEW.title,
      NEW.summary,
      'highlight'
    );
  -- 채용 정보인 경우
  ELSIF NEW.content_type = 'recruitment' THEN
    INSERT INTO notifications (content_id, title, message, notification_type)
    VALUES (
      NEW.id,
      '[채용] ' || NEW.title,
      NEW.summary,
      'recruitment'
    );
  -- 일반 업데이트
  ELSE
    INSERT INTO notifications (content_id, title, message, notification_type)
    VALUES (
      NEW.id,
      NEW.title,
      NEW.summary,
      'update'
    );
  END IF;
  
  -- 업데이트 로그 기록
  INSERT INTO update_logs (content_id, action)
  VALUES (NEW.id, 'created');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_notification
  AFTER INSERT ON contents
  FOR EACH ROW
  EXECUTE FUNCTION create_notification_on_content_insert();

-- 샘플 크롤링 소스 데이터
INSERT INTO crawl_sources (name, base_url, category, source_type, region, crawl_frequency) VALUES
  -- 정책
  ('보건복지부 보도자료', 'https://www.mohw.go.kr/board.es?mid=a10503000000&bid=0027', 'policy', '보건복지부', NULL, 6),
  ('경기도 복지정책', 'https://www.gg.go.kr/welfare', 'policy', '경기도', NULL, 6),
  ('서울시 복지정책', 'https://welfare.seoul.go.kr/', 'policy', '서울시', NULL, 6),
  
  -- 사회서비스원 (전국 17개 지역)
  ('서울특별시사회서비스원', 'https://www.seoulwelfare.or.kr/board/list.do', 'social-service', '사회서비스원', '서울특별시', 4),
  ('경기도사회서비스원', 'https://www.ggwelfare.or.kr/board/notice', 'social-service', '사회서비스원', '경기도', 4),
  ('부산광역시사회서비스원', 'https://www.bswc.or.kr/bbs/list.do', 'social-service', '사회서비스원', '부산광역시', 4),
  ('인천광역시사회서비스원', 'https://www.insw.or.kr/board/notice', 'social-service', '사회서비스원', '인천광역시', 4),
  ('대구광역시사회서비스원', 'https://www.dgsw.or.kr/board/notice', 'social-service', '사회서비스원', '대구광역시', 4),
  ('광주광역시사회서비스원', 'https://www.gjsw.or.kr/board/notice', 'social-service', '사회서비스원', '광주광역시', 4),
  ('대전광역시사회서비스원', 'https://www.djsw.or.kr/board/notice', 'social-service', '사회서비스원', '대전광역시', 4),
  ('울산광역시사회서비스원', 'https://www.ulsansw.or.kr/board/notice', 'social-service', '사회서비스원', '울산광역시', 4),
  ('세종특별자치시사회서비스원', 'https://www.sejongwelfare.or.kr/board/notice', 'social-service', '사회서비스원', '세종특별자치시', 4),
  ('강원특별자치도사회서비스원', 'https://www.gwsw.or.kr/board/notice', 'social-service', '사회서비스원', '강원특별자치도', 4),
  ('충청북도사회서비스원', 'https://www.cbsw.or.kr/board/notice', 'social-service', '사회서비스원', '충청북도', 4),
  ('충청남도사회서비스원', 'https://www.cnsw.or.kr/board/notice', 'social-service', '사회서비스원', '충청남도', 4),
  ('전북특별자치도사회서비스원', 'https://www.jbsw.or.kr/board/notice', 'social-service', '사회서비스원', '전북특별자치도', 4),
  ('전라남도사회서비스원', 'https://www.jnsw.or.kr/board/notice', 'social-service', '사회서비스원', '전라남도', 4),
  ('경상북도사회서비스원', 'https://www.gbsw.or.kr/board/notice', 'social-service', '사회서비스원', '경상북도', 4),
  ('경상남도사회서비스원', 'https://www.gnsw.or.kr/board/notice', 'social-service', '사회서비스원', '경상남도', 4),
  ('제주특별자치도사회서비스원', 'https://www.jejusw.or.kr/board/notice', 'social-service', '사회서비스원', '제주특별자치도', 4)
ON CONFLICT DO NOTHING;

-- 통계 뷰 생성
CREATE OR REPLACE VIEW content_stats AS
SELECT 
  category,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE is_highlight = true) as highlight_count,
  COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today_count,
  MAX(created_at) as last_updated
FROM contents
GROUP BY category;

-- 지역별 사회서비스원 통계 뷰
CREATE OR REPLACE VIEW social_service_region_stats AS
SELECT 
  region,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE is_highlight = true) as highlight_count,
  COUNT(*) FILTER (WHERE content_type = 'recruitment') as recruitment_count,
  COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today_count,
  MAX(created_at) as last_updated
FROM contents
WHERE category = 'social-service'
GROUP BY region;
