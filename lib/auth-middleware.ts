/**
 * 인증 및 권한 확인 미들웨어
 * JWT 토큰 기반 인증 및 부서별 접근 권한 관리
 */

import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

// JWT 시크릿 키 (환경 변수에서 가져오기)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// 사용자 인터페이스
export interface AuthUser {
  id: string;
  email: string;
  department_id: string;
  department_name: string;
  role: 'user' | 'admin';
  status: 'approved' | 'pending' | 'rejected' | 'suspended';
}

// JWT 페이로드 인터페이스
interface JWTPayload extends AuthUser {
  iat?: number;
  exp?: number;
}

/**
 * 요청에서 JWT 토큰 추출 및 검증
 */
export function verifyToken(request: NextRequest): AuthUser | null {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7); // "Bearer " 제거
    
    // JWT 검증
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    // 필수 필드 확인
    if (!decoded.id || !decoded.email || !decoded.department_id) {
      return null;
    }

    // 승인된 사용자만 허용
    if (decoded.status !== 'approved') {
      return null;
    }

    return {
      id: decoded.id,
      email: decoded.email,
      department_id: decoded.department_id,
      department_name: decoded.department_name,
      role: decoded.role,
      status: decoded.status,
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * JWT 토큰 생성
 */
export function generateToken(user: AuthUser, expiresIn: string | number = '7d'): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      department_id: user.department_id,
      department_name: user.department_name,
      role: user.role,
      status: user.status,
    },
    JWT_SECRET,
    { expiresIn } as jwt.SignOptions
  );
}

/**
 * 특정 부서 접근 권한 확인
 */
export function hasAccessToDepartment(
  user: AuthUser,
  allowedDepartments: string[]
): boolean {
  // 관리자는 모든 부서에 접근 가능
  if (user.role === 'admin') {
    return true;
  }

  // 허용된 부서 목록이 비어있으면 모두 접근 가능 (public)
  if (!allowedDepartments || allowedDepartments.length === 0) {
    return true;
  }

  // 사용자의 부서가 허용된 부서 목록에 있는지 확인
  return allowedDepartments.includes(user.department_name);
}

/**
 * 경기북서부노인보호전문기관 접근 권한 확인
 */
export function hasElderProtectionAccess(user: AuthUser): boolean {
  const ELDER_PROTECTION_DEPARTMENT = '경기북서부노인보호전문기관';
  
  // 관리자는 접근 가능
  if (user.role === 'admin') {
    return true;
  }

  // 경기북서부노인보호전문기관 직원만 접근 가능
  return user.department_name === ELDER_PROTECTION_DEPARTMENT;
}

/**
 * 관리자 권한 확인
 */
export function isAdmin(user: AuthUser): boolean {
  return user.role === 'admin';
}

/**
 * 인증 필수 미들웨어
 */
export function requireAuth(request: NextRequest): {
  user: AuthUser | null;
  error: { message: string; status: number } | null;
} {
  const user = verifyToken(request);

  if (!user) {
    return {
      user: null,
      error: {
        message: '로그인이 필요합니다.',
        status: 401,
      },
    };
  }

  return { user, error: null };
}

/**
 * 관리자 권한 필수 미들웨어
 */
export function requireAdmin(request: NextRequest): {
  user: AuthUser | null;
  error: { message: string; status: number } | null;
} {
  const { user, error } = requireAuth(request);

  if (error) {
    return { user: null, error };
  }

  if (!user || !isAdmin(user)) {
    return {
      user: null,
      error: {
        message: '관리자 권한이 필요합니다.',
        status: 403,
      },
    };
  }

  return { user, error: null };
}

/**
 * 부서별 접근 권한 필수 미들웨어
 */
export function requireDepartmentAccess(
  request: NextRequest,
  allowedDepartments: string[]
): {
  user: AuthUser | null;
  error: { message: string; status: number } | null;
} {
  const { user, error } = requireAuth(request);

  if (error) {
    return { user: null, error };
  }

  if (!user || !hasAccessToDepartment(user, allowedDepartments)) {
    return {
      user: null,
      error: {
        message: '이 콘텐츠에 접근할 권한이 없습니다.',
        status: 403,
      },
    };
  }

  return { user, error: null };
}

/**
 * 경기북서부노인보호전문기관 접근 권한 필수 미들웨어
 */
export function requireElderProtection(request: NextRequest): {
  user: AuthUser | null;
  error: { message: string; status: number } | null;
} {
  const { user, error } = requireAuth(request);

  if (error) {
    return { user: null, error };
  }

  if (!user || !hasElderProtectionAccess(user)) {
    return {
      user: null,
      error: {
        message: '경기북서부노인보호전문기관 직원만 접근 가능합니다.',
        status: 403,
      },
    };
  }

  return { user, error: null };
}
