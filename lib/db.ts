/**
 * PostgreSQL 데이터베이스 연결 및 헬퍼 함수
 */

import { Pool, QueryResult, QueryResultRow } from 'pg';

// PostgreSQL 연결 풀
let pool: Pool | null = null;

/**
 * 데이터베이스 연결 풀 가져오기 (싱글톤)
 */
export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL 환경 변수가 설정되지 않았습니다.');
    }

    pool = new Pool({
      connectionString,
      max: 20, // 최대 연결 수
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // 연결 오류 처리
    pool.on('error', (err) => {
      console.error('Unexpected database pool error:', err);
    });
  }

  return pool;
}

/**
 * 데이터베이스 쿼리 실행
 */
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const pool = getPool();
  const start = Date.now();
  
  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    
    // 쿼리 로깅 (개발 환경)
    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query:', { text, duration, rows: result.rowCount });
    }
    
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * 트랜잭션 실행
 */
export async function transaction<T>(
  callback: (client: any) => Promise<T>
): Promise<T> {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * 연결 종료
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

// 데이터베이스 타입 정의
export interface User {
  id: string;
  email: string;
  password_hash?: string;
  department_id: string;
  department_name?: string;
  role: 'user' | 'admin';
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  approved_at?: Date;
  approved_by?: string;
  rejected_reason?: string;
  suspended_reason?: string;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Content {
  id: string;
  title: string;
  summary?: string;
  full_content: string;
  category: 'academy' | 'policy' | 'thoughts' | 'social-service' | 'elder-protection';
  source: string;
  source_url?: string;
  thumbnail_url?: string;
  author?: string;
  editor_note?: string;
  published_at: Date;
  created_at: Date;
  updated_at: Date;
  tags: string[];
  view_count: number;
  featured: boolean;
  is_highlight: boolean;
  region?: string;
  content_type?: string;
  access_level: 'public' | 'department_only';
  allowed_departments?: string[];
}

export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: string;
  content_id?: string;
  metadata?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

/**
 * 사용자 조회 (이메일)
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await query<User>(
    `SELECT u.id, u.email, u.password_hash, u.department_id, u.role, u.status,
            u.approved_at, u.approved_by, u.rejected_reason, u.suspended_reason,
            u.last_login_at, u.created_at, u.updated_at,
            d.name as department_name
     FROM users u
     LEFT JOIN departments d ON u.department_id = d.id
     WHERE u.email = $1`,
    [email]
  );

  return result.rows.length > 0 ? result.rows[0] : null;
}

/**
 * 사용자 조회 (ID)
 */
export async function getUserById(id: string): Promise<User | null> {
  const result = await query<User>(
    `SELECT u.*, d.name as department_name
     FROM users u
     LEFT JOIN departments d ON u.department_id = d.id
     WHERE u.id = $1`,
    [id]
  );

  return result.rows.length > 0 ? result.rows[0] : null;
}

/**
 * 부서 조회 (이름)
 */
export async function getDepartmentByName(name: string): Promise<Department | null> {
  const result = await query<Department>(
    'SELECT * FROM departments WHERE name = $1',
    [name]
  );

  return result.rows.length > 0 ? result.rows[0] : null;
}

/**
 * 모든 부서 목록 조회
 */
export async function getAllDepartments(): Promise<Department[]> {
  const result = await query<Department>(
    'SELECT * FROM departments ORDER BY name'
  );

  return result.rows;
}

/**
 * 콘텐츠 조회 (접근 권한 포함)
 */
export async function getContents(
  category: string,
  userDepartmentName?: string,
  isAdmin?: boolean
): Promise<Content[]> {
  let queryText = `
    SELECT * FROM contents
    WHERE category = $1
    AND (
      access_level = 'public'
      OR $2 = true
      OR ($3 IS NOT NULL AND $3 = ANY(allowed_departments))
    )
    ORDER BY published_at DESC
  `;

  const result = await query<Content>(queryText, [
    category,
    isAdmin || false,
    userDepartmentName || null,
  ]);

  return result.rows;
}

/**
 * 콘텐츠 상세 조회 (접근 권한 확인)
 */
export async function getContentById(
  id: string,
  userDepartmentName?: string,
  isAdmin?: boolean
): Promise<Content | null> {
  const result = await query<Content>(
    `SELECT * FROM contents
     WHERE id = $1
     AND (
       access_level = 'public'
       OR $2 = true
       OR ($3 IS NOT NULL AND $3 = ANY(allowed_departments))
     )`,
    [id, isAdmin || false, userDepartmentName || null]
  );

  return result.rows.length > 0 ? result.rows[0] : null;
}

/**
 * 사용자 활동 기록
 */
export async function logUserActivity(
  userId: string,
  activityType: string,
  contentId?: string,
  metadata?: any,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await query(
    `INSERT INTO user_activities 
     (user_id, activity_type, content_id, metadata, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [userId, activityType, contentId || null, metadata || null, ipAddress || null, userAgent || null]
  );
}

/**
 * 마지막 로그인 시간 업데이트
 */
export async function updateLastLogin(userId: string): Promise<void> {
  await query(
    'UPDATE users SET last_login_at = NOW() WHERE id = $1',
    [userId]
  );
}
