import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query, getUserByEmail } from '@/lib/db';

const ALLOWED_DOMAIN = '@gg.pass.or.kr';
const ALLOWED_ADMIN_EMAILS = ['yoonhj79@gmail.com'];

interface SignupRequest {
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SignupRequest = await request.json();
    const { email, password } = body;

    // 이메일 검증
    if (!email || !email.trim()) {
      return NextResponse.json(
        { success: false, message: '이메일을 입력해주세요.' },
        { status: 400 }
      );
    }

    // 비밀번호 검증
    if (!password || password.length < 8) {
      return NextResponse.json(
        { success: false, message: '비밀번호는 최소 8자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    // 이메일 도메인 검증 (허용된 도메인 또는 관리자 이메일)
    const isAllowedDomain = email.endsWith(ALLOWED_DOMAIN);
    const isAllowedAdminEmail = ALLOWED_ADMIN_EMAILS.includes(email);
    
    if (!isAllowedDomain && !isAllowedAdminEmail) {
      return NextResponse.json(
        { 
          success: false, 
          message: `경기도사회서비스원 이메일(${ALLOWED_DOMAIN})만 가입 가능합니다.` 
        },
        { status: 403 }
      );
    }

    // 이메일 형식 검증 (일반 직원용)
    if (isAllowedDomain) {
      const emailRegex = /^[^\s@]+@gg\.pass\.or\.kr$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { success: false, message: '올바른 이메일 형식이 아닙니다.' },
          { status: 400 }
        );
      }
    }
    
    // 관리자 이메일 형식 검증
    if (isAllowedAdminEmail) {
      const adminEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!adminEmailRegex.test(email)) {
        return NextResponse.json(
          { success: false, message: '올바른 이메일 형식이 아닙니다.' },
          { status: 400 }
        );
      }
    }

    // 비밀번호 해시 생성
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 중복 확인
    const existingUser = await getUserByEmail(email);
    
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: '이미 가입된 이메일입니다.' },
        { status: 409 }
      );
    }
    
    // 관리자 부서 ID 가져오기
    const departmentResult = await query(
      'SELECT id FROM departments WHERE name = $1',
      ['관리자']
    );
    
    const departmentId = departmentResult.rows.length > 0 
      ? departmentResult.rows[0].id 
      : null;
    
    if (!departmentId) {
      return NextResponse.json(
        { success: false, message: '부서 정보를 찾을 수 없습니다. 관리자에게 문의하세요.' },
        { status: 500 }
      );
    }
    
    // 사용자 생성 (승인 대기 상태)
    const result = await query(
      `INSERT INTO users (email, password_hash, department_id, role, status) 
       VALUES ($1, $2, $3, $4, 'pending') 
       RETURNING id, email, status, created_at`,
      [email, passwordHash, departmentId, 'user']
    );
    
    const user = result.rows[0];
    
    return NextResponse.json({
      success: true,
      message: '가입 신청이 완료되었습니다. 관리자 승인 후 이용 가능합니다.',
      user: {
        id: user.id,
        email: user.email,
        status: user.status,
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: '가입 처리 중 오류가 발생했습니다.' 
      },
      { status: 500 }
    );
  }
}
