import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, updateLastLogin, logUserActivity } from '@/lib/db';
import { generateToken, AuthUser } from '@/lib/auth-middleware';
import bcrypt from 'bcryptjs';

const ALLOWED_DOMAIN = '@gg.pass.or.kr';
const ALLOWED_ADMIN_EMAILS = ['yoonhj79@gmail.com'];

interface LoginRequest {
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    // 이메일 검증
    if (!email || !email.trim()) {
      return NextResponse.json(
        { success: false, message: '이메일을 입력해주세요.' },
        { status: 400 }
      );
    }

    // 비밀번호 검증
    if (!password || !password.trim()) {
      return NextResponse.json(
        { success: false, message: '비밀번호를 입력해주세요.' },
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
          message: '경기도사회서비스원 이메일 또는 관리자 이메일만 로그인 가능합니다.' 
        },
        { status: 403 }
      );
    }

    // 데이터베이스에서 사용자 조회
    const user = await getUserByEmail(email);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }
    
    // 비밀번호 확인
    // TODO: DB에서 password_hash 가져오기
    // const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    // if (!isPasswordValid) {
    //   return NextResponse.json(
    //     { success: false, message: '이메일 또는 비밀번호가 올바르지 않습니다.' },
    //     { status: 401 }
    //   );
    // }
    
    // 승인 상태 확인
    if (user.status === 'pending') {
      return NextResponse.json(
        { success: false, message: '관리자 승인 대기 중입니다.' },
        { status: 403 }
      );
    }
    
    if (user.status === 'rejected') {
      return NextResponse.json(
        { 
          success: false, 
          message: '가입이 거부되었습니다.',
          reason: user.rejected_reason 
        },
        { status: 403 }
      );
    }
    
    if (user.status === 'suspended') {
      return NextResponse.json(
        { 
          success: false, 
          message: '계정이 정지되었습니다.',
          reason: user.suspended_reason 
        },
        { status: 403 }
      );
    }
    
    // 마지막 로그인 시간 업데이트
    await updateLastLogin(user.id);
    
    // 로그인 활동 기록
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || undefined;
    const userAgent = request.headers.get('user-agent') || undefined;
    
    await logUserActivity(
      user.id,
      'login',
      undefined,
      undefined,
      ipAddress,
      userAgent
    );
    
    // JWT 토큰 생성
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      department_id: user.department_id,
      department_name: user.department_name || '',
      role: user.role,
      status: user.status,
    };
    
    const token = generateToken(authUser, '7d'); // 7일 유효
    
    return NextResponse.json({
      success: true,
      message: '로그인 성공',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        department_id: user.department_id,
        department_name: user.department_name
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: '로그인 처리 중 오류가 발생했습니다.' 
      },
      { status: 500 }
    );
  }
}
