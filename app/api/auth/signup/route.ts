import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

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
    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, message: '비밀번호는 최소 6자 이상이어야 합니다.' },
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

    // TODO: 데이터베이스 연결 후 실제 구현
    // 아래 코드는 실제 DB 연결 시 사용
    /*
    const { query } = require('@/lib/db');
    
    // 중복 확인
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: '이미 가입된 이메일입니다.' },
        { status: 409 }
      );
    }
    
    // 사용자 생성 (승인 대기 상태)
    const result = await query(
      `INSERT INTO users (email, password_hash, status) 
       VALUES ($1, $2, 'pending') 
       RETURNING id, email, status, created_at`,
      [email, passwordHash]
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
    */

    // Mock 응답 (데이터베이스 연결 전)
    console.log('Password hash created:', passwordHash.substring(0, 20) + '...');
    
    return NextResponse.json({
      success: true,
      message: '가입 신청이 완료되었습니다. 관리자 승인 후 이용 가능합니다.',
      user: {
        id: 'mock-user-id',
        email: email,
        status: 'pending',
        created_at: new Date().toISOString()
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
