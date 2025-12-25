import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_DOMAIN = '@ggpass.or.kr';

interface SignupRequest {
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SignupRequest = await request.json();
    const { email } = body;

    // 이메일 검증
    if (!email || !email.trim()) {
      return NextResponse.json(
        { success: false, message: '이메일을 입력해주세요.' },
        { status: 400 }
      );
    }

    // 이메일 도메인 검증
    if (!email.endsWith(ALLOWED_DOMAIN)) {
      return NextResponse.json(
        { 
          success: false, 
          message: `경기도사회서비스원 이메일(${ALLOWED_DOMAIN})만 가입 가능합니다.` 
        },
        { status: 403 }
      );
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@ggpass\.or\.kr$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: '올바른 이메일 형식이 아닙니다.' },
        { status: 400 }
      );
    }

    // TODO: 데이터베이스 연결 후 실제 구현
    // 현재는 Mock 응답
    
    // 실제 구현 예시:
    /*
    const db = getDatabase();
    
    // 중복 확인
    const existingUser = await db.query(
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
    const result = await db.query(
      `INSERT INTO users (email, status) 
       VALUES ($1, 'pending') 
       RETURNING id, email, status, created_at`,
      [email]
    );
    
    const user = result.rows[0];
    
    // 관리자에게 알림 (선택사항)
    // await notifyAdminNewSignup(user);
    
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
