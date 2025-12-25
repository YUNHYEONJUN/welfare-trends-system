// 인증 관련 타입 정의

export type UserRole = 'user' | 'admin';
export type UserStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type ActivityType = 
  | 'login' 
  | 'logout' 
  | 'view_content' 
  | 'search' 
  | 'download' 
  | 'ai_summary'
  | 'filter'
  | 'export';

export interface Department {
  id: string;
  name: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface User {
  id: string;
  email: string;
  department_id?: string;
  role: UserRole;
  status: UserStatus;
  approved_at?: Date;
  approved_by?: string;
  rejected_reason?: string;
  suspended_reason?: string;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
  // 조인된 데이터
  department?: Department;
}

export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: ActivityType;
  content_id?: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  expires_at: Date;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

export interface AdminActivity {
  id: string;
  admin_id: string;
  action: string;
  target_user_id?: string;
  details?: Record<string, any>;
  created_at: Date;
  // 조인된 데이터
  admin?: User;
  target_user?: User;
}

// 통계 타입
export interface DepartmentUserStats {
  department_id: string;
  department_name: string;
  total_users: number;
  approved_users: number;
  pending_users: number;
  active_today: number;
}

export interface UserActivityStats {
  user_id: string;
  email: string;
  department_name?: string;
  total_activities: number;
  activities_today: number;
  content_views: number;
  searches: number;
  ai_summary_uses: number;
  last_activity_at?: Date;
}

export interface DailyActivityStats {
  activity_date: string;
  unique_users: number;
  total_activities: number;
  logins: number;
  content_views: number;
  searches: number;
  ai_summaries: number;
}

export interface AdminActionStats {
  action_date: string;
  action: string;
  action_count: number;
}

// API 응답 타입
export interface SignupResponse {
  success: boolean;
  message: string;
  user?: User;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

export interface ApprovalRequest {
  user_id: string;
  department_id?: string;
  approved: boolean;
  reason?: string;
}
