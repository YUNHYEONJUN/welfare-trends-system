import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_DOMAIN = '@ggpass.or.kr';

interface LoginRequest {
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
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
          message: '경기도사회서비스원 이메일만 로그인 가능합니다.' 
        },
        { status: 403 }
      );
    }

    // TODO: 데이터베이스 연결 후 실제 구현
    
    // 실제 구현 예시:
    /*
    const db = getDatabase();
    
    // 사용자 조회
    const result = await db.query(
      `SELECT u.*, d.name as department_name 
       FROM users u 
       LEFT JOIN departments d ON u.department_id = d.id 
       WHERE u.email = $1`,
      [email]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: '등록되지 않은 이메일입니다.' },
        { status: 404 }
      );
    }
    
    const user = result.rows[0];
    
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
    await db.query(
      'UPDATE users SET last_login_at = NOW() WHERE id = $1',
      [user.id]
    );
    
    // 로그인 활동 기록
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    await db.query(
      `INSERT INTO user_activities (user_id, activity_type, ip_address, user_agent)
       VALUES ($1, 'login', $2, $3)`,
      [user.id, ipAddress, userAgent]
    );
    
    // 세션 토큰 생성
    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7일
    
    await db.query(
      `INSERT INTO user_sessions (user_id, session_token, expires_at, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, sessionToken, expiresAt, ipAddress, userAgent]
    );
    
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
      token: sessionToken
    });
    */

    // Mock 응답 (데이터베이스 연결 전)
    return NextResponse.json({
      success: true,
      message: '로그인 성공',
      user: {
        id: 'mock-user-id',
        email: email,
        role: 'user',
        status: 'approved',
        department_name: '사업운영팀'
      },
      token: 'mock-session-token'
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
