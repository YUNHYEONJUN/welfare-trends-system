-- 인증 및 사용자 관리 스키마
-- 경기도사회서비스원 직원 전용 시스템

-- 부서 테이블
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  -- @gg.pass.or.kr 이메일 또는 특정 관리자 이메일 허용
  CONSTRAINT valid_email CHECK (
    email LIKE '%@gg.pass.or.kr' 
    OR email IN ('yoonhj79@gmail.com')
  ),
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  rejected_reason TEXT,
  suspended_reason TEXT,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자 활동 로그 테이블
CREATE TABLE IF NOT EXISTS user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  -- login, logout, view_content, search, download, ai_summary, etc.
  content_id UUID REFERENCES contents(id) ON DELETE SET NULL,
  metadata JSONB, -- 추가 정보 (검색어, 필터 등)
  ip_address VARCHAR(45), -- IPv4/IPv6 지원
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자 세션 테이블 (보안 강화)
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(500) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 관리자 활동 로그 테이블
CREATE TABLE IF NOT EXISTS admin_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  -- approve_user, reject_user, suspend_user, assign_department, etc.
  target_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  details JSONB, -- 상세 정보
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON user_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_admin_activities_admin_id ON admin_activities(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activities_created_at ON admin_activities(created_at DESC);

-- 트리거: updated_at 자동 업데이트
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON departments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 트리거: 사용자 승인 시 자동으로 approved_at 설정
CREATE OR REPLACE FUNCTION set_approved_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    NEW.approved_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_approved_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_approved_at();

-- 트리거: 만료된 세션 자동 정리 함수
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM user_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- 기본 부서 데이터 삽입 (경기도사회서비스원 실제 조직 구조)
INSERT INTO departments (name, description) VALUES
  -- 경영기획본부 (5개 팀)
  ('기획예산팀', '예산 편성 및 관리'),
  ('경영지원팀', '인사, 총무, 재무 등 경영 지원'),
  ('전략사업팀', '전략 기획 및 사업 관리'),
  ('서비스지원팀', '서비스 지원 및 관리'),
  ('사업지원팀', '사업 지원 및 운영'),
  
  -- 직영시설 (2개)
  ('남양주종합재가센터', '남양주 재가 서비스'),
  ('부천종합재가센터', '부천 재가 서비스'),
  
  -- 공공광역센터 (4개)
  ('경기도노인일자리지원센터', '경기도 노인 일자리 지원'),
  ('경기도노인종합상담센터', '경기도 노인 종합 상담'),
  ('경기도장기요양요원지원센터', '경기도 장기요양요원 지원'),
  ('경기도노인맞춤돌봄지원센터', '경기도 노인 맞춤돌봄 지원'),
  ('경기도지역사회서비스지원단', '경기도 지역사회 서비스 지원'),
  
  -- 노인보호전문기관 (6개)
  ('경기북서부노인보호전문기관', '경기북서부 지역 노인학대 예방 및 보호'),
  ('경기북부노인보호전문기관', '경기북부 지역 노인학대 예방 및 보호'),
  ('경기동부노인보호전문기관', '경기동부 지역 노인학대 예방 및 보호'),
  ('경기서부노인보호전문기관', '경기서부 지역 노인학대 예방 및 보호'),
  ('경기남부노인보호전문기관', '경기남부 지역 노인학대 예방 및 보호'),
  ('경기북동부노인보호전문기관', '경기북동부 지역 노인학대 예방 및 보호'),
  
  -- 학대피해노인전용쉼터 (3개)
  ('경기북부학대피해노인전용쉼터', '경기북부 학대피해노인 쉼터'),
  ('경기서부학대피해노인전용쉼터', '경기서부 학대피해노인 쉼터'),
  ('경기남부학대피해노인전용쉼터', '경기남부 학대피해노인 쉼터')
ON CONFLICT (name) DO NOTHING;

-- 통계 뷰: 부서별 사용자 수
CREATE OR REPLACE VIEW department_user_stats AS
SELECT 
  d.id as department_id,
  d.name as department_name,
  COUNT(u.id) as total_users,
  COUNT(u.id) FILTER (WHERE u.status = 'approved') as approved_users,
  COUNT(u.id) FILTER (WHERE u.status = 'pending') as pending_users,
  COUNT(u.id) FILTER (WHERE u.last_login_at >= CURRENT_DATE) as active_today
FROM departments d
LEFT JOIN users u ON d.id = u.department_id
GROUP BY d.id, d.name;

-- 통계 뷰: 사용자 활동 통계
CREATE OR REPLACE VIEW user_activity_stats AS
SELECT 
  u.id as user_id,
  u.email,
  d.name as department_name,
  COUNT(ua.id) as total_activities,
  COUNT(ua.id) FILTER (WHERE ua.created_at >= CURRENT_DATE) as activities_today,
  COUNT(ua.id) FILTER (WHERE ua.activity_type = 'view_content') as content_views,
  COUNT(ua.id) FILTER (WHERE ua.activity_type = 'search') as searches,
  COUNT(ua.id) FILTER (WHERE ua.activity_type = 'ai_summary') as ai_summary_uses,
  MAX(ua.created_at) as last_activity_at
FROM users u
LEFT JOIN departments d ON u.department_id = d.id
LEFT JOIN user_activities ua ON u.id = ua.user_id
WHERE u.status = 'approved'
GROUP BY u.id, u.email, d.name;

-- 통계 뷰: 일별 활동 통계
CREATE OR REPLACE VIEW daily_activity_stats AS
SELECT 
  DATE(created_at) as activity_date,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(*) as total_activities,
  COUNT(*) FILTER (WHERE activity_type = 'login') as logins,
  COUNT(*) FILTER (WHERE activity_type = 'view_content') as content_views,
  COUNT(*) FILTER (WHERE activity_type = 'search') as searches,
  COUNT(*) FILTER (WHERE activity_type = 'ai_summary') as ai_summaries
FROM user_activities
GROUP BY DATE(created_at)
ORDER BY activity_date DESC;

-- 관리자 활동 통계 뷰
CREATE OR REPLACE VIEW admin_action_stats AS
SELECT 
  DATE(created_at) as action_date,
  action,
  COUNT(*) as action_count
FROM admin_activities
GROUP BY DATE(created_at), action
ORDER BY action_date DESC, action_count DESC;

COMMENT ON TABLE users IS '경기도사회서비스원 직원 사용자 테이블 (@gg.pass.or.kr 이메일 또는 특정 관리자 이메일 허용)';
COMMENT ON TABLE user_activities IS '사용자 활동 로그 (개인정보 미수집, 이메일만 저장)';
COMMENT ON TABLE departments IS '경기도사회서비스원 부서 정보';
COMMENT ON COLUMN users.email IS '사용자 이메일 (@gg.pass.or.kr 도메인 또는 yoonhj79@gmail.com 허용)';
COMMENT ON COLUMN users.status IS 'pending: 승인 대기, approved: 승인됨, rejected: 거부됨, suspended: 정지됨';
