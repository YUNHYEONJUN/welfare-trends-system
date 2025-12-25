-- AI 큐레이션 시스템 데이터베이스 스키마
-- contents 테이블에 큐레이션 관련 필드 추가

-- 1. contents 테이블에 필드 추가
ALTER TABLE contents 
ADD COLUMN IF NOT EXISTS curation_group_id UUID,
ADD COLUMN IF NOT EXISTS importance_score INTEGER CHECK (importance_score BETWEEN 1 AND 10),
ADD COLUMN IF NOT EXISTS is_curated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ai_summary TEXT,
ADD COLUMN IF NOT EXISTS key_points TEXT[],
ADD COLUMN IF NOT EXISTS source_count INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS original_content_ids UUID[];

-- 2. 큐레이션 그룹 테이블 생성
CREATE TABLE IF NOT EXISTS curation_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  theme VARCHAR(200),
  category VARCHAR(50) NOT NULL CHECK (category IN ('academy', 'policy', 'thoughts', 'social-service', 'elder-protection')),
  importance_score INTEGER CHECK (importance_score BETWEEN 1 AND 10),
  ai_summary TEXT NOT NULL,
  key_points TEXT[],
  content_count INTEGER DEFAULT 0,
  source_urls TEXT[],
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 관련 콘텐츠 연결 테이블
CREATE TABLE IF NOT EXISTS related_contents (
  content_id UUID REFERENCES contents(id) ON DELETE CASCADE,
  related_content_id UUID REFERENCES contents(id) ON DELETE CASCADE,
  relation_type VARCHAR(50) NOT NULL CHECK (relation_type IN ('similar', 'related', 'referenced')),
  similarity_score FLOAT CHECK (similarity_score BETWEEN 0 AND 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (content_id, related_content_id)
);

-- 4. 원본 콘텐츠 테이블 (큐레이션 전 크롤링 데이터)
CREATE TABLE IF NOT EXISTS raw_crawled_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  summary TEXT,
  full_content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  source VARCHAR(100) NOT NULL,
  source_url TEXT,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  crawled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tags TEXT[] DEFAULT '{}',
  region VARCHAR(50),
  content_type VARCHAR(50),
  is_processed BOOLEAN DEFAULT FALSE, -- 큐레이션 처리 완료 여부
  curation_group_id UUID REFERENCES curation_groups(id) ON DELETE SET NULL
);

-- 5. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_contents_curation_group ON contents(curation_group_id) WHERE curation_group_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contents_is_curated ON contents(is_curated) WHERE is_curated = TRUE;
CREATE INDEX IF NOT EXISTS idx_contents_importance ON contents(importance_score DESC) WHERE importance_score IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_curation_groups_category ON curation_groups(category);
CREATE INDEX IF NOT EXISTS idx_curation_groups_importance ON curation_groups(importance_score DESC);
CREATE INDEX IF NOT EXISTS idx_curation_groups_created_at ON curation_groups(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_related_contents_content ON related_contents(content_id);
CREATE INDEX IF NOT EXISTS idx_related_contents_similarity ON related_contents(similarity_score DESC);
CREATE INDEX IF NOT EXISTS idx_raw_crawled_is_processed ON raw_crawled_contents(is_processed) WHERE is_processed = FALSE;
CREATE INDEX IF NOT EXISTS idx_raw_crawled_category ON raw_crawled_contents(category);

-- 6. 트리거: curation_groups updated_at 자동 업데이트
CREATE TRIGGER update_curation_groups_updated_at
  BEFORE UPDATE ON curation_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. 통계 뷰: 큐레이션 통계
CREATE OR REPLACE VIEW curation_stats AS
SELECT 
  category,
  COUNT(*) as total_groups,
  AVG(importance_score) as avg_importance,
  SUM(content_count) as total_source_contents,
  COUNT(*) FILTER (WHERE importance_score >= 8) as high_importance_count,
  COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today_count,
  MAX(created_at) as last_curated
FROM curation_groups
GROUP BY category;

-- 8. 통계 뷰: 원본 콘텐츠 처리 상황
CREATE OR REPLACE VIEW raw_content_processing_stats AS
SELECT 
  category,
  COUNT(*) as total_raw,
  COUNT(*) FILTER (WHERE is_processed = TRUE) as processed_count,
  COUNT(*) FILTER (WHERE is_processed = FALSE) as pending_count,
  MAX(crawled_at) as last_crawled
FROM raw_crawled_contents
GROUP BY category;

COMMENT ON TABLE curation_groups IS 'AI 큐레이션으로 생성된 콘텐츠 그룹';
COMMENT ON TABLE raw_crawled_contents IS '크롤링된 원본 콘텐츠 (큐레이션 전)';
COMMENT ON TABLE related_contents IS '콘텐츠 간 관련성 연결';
COMMENT ON COLUMN contents.curation_group_id IS '속한 큐레이션 그룹 ID';
COMMENT ON COLUMN contents.importance_score IS 'AI 평가 중요도 (1-10)';
COMMENT ON COLUMN contents.is_curated IS 'AI 큐레이션 완료 여부';
COMMENT ON COLUMN contents.ai_summary IS 'AI가 생성한 통합 요약';
COMMENT ON COLUMN contents.key_points IS 'AI가 추출한 주요 포인트';
COMMENT ON COLUMN contents.source_count IS '통합된 원본 콘텐츠 수';
COMMENT ON COLUMN contents.original_content_ids IS '통합된 원본 콘텐츠 ID들';
