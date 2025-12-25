import { NextRequest, NextResponse } from 'next/server';

// 관리자 권한 확인 미들웨어 (실제 구현 시 사용)
function checkAdminAuth(request: NextRequest): { isAdmin: boolean; userId?: string } {
  // TODO: 실제 세션/토큰 검증
  // const token = request.headers.get('authorization');
  // const session = verifyToken(token);
  // return { isAdmin: session.role === 'admin', userId: session.userId };
  
  // Mock (개발용)
  return { isAdmin: true, userId: 'mock-admin-id' };
}

// GET: 사용자 목록 조회 (필터링 지원)
export async function GET(request: NextRequest) {
  try {
    const { isAdmin } = checkAdminAuth(request);
    
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // pending, approved, rejected, suspended
    const department = searchParams.get('department');
    const search = searchParams.get('search'); // 이메일 검색
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // TODO: 데이터베이스 쿼리
    /*
    const db = getDatabase();
    let query = `
      SELECT u.*, d.name as department_name,
             approver.email as approved_by_email
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN users approver ON u.approved_by = approver.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND u.status = $${paramCount}`;
      params.push(status);
    }

    if (department) {
      paramCount++;
      query += ` AND u.department_id = $${paramCount}`;
      params.push(department);
    }

    if (search) {
      paramCount++;
      query += ` AND u.email ILIKE $${paramCount}`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY u.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, (page - 1) * limit);

    const result = await db.query(query, params);
    const countResult = await db.query(
      `SELECT COUNT(*) FROM users u WHERE 1=1 ${status ? 'AND status = $1' : ''}`,
      status ? [status] : []
    );

    return NextResponse.json({
      success: true,
      users: result.rows,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].count),
        totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
      }
    });
    */

    // Mock 데이터
    const mockUsers = [
      {
        id: '1',
        email: 'hong.gildong@gg.pass.or.kr',
        department_id: '1',
        department_name: '사업운영팀',
        role: 'user',
        status: 'pending',
        created_at: new Date('2025-12-20'),
      },
      {
        id: '2',
        email: 'kim.chulsoo@gg.pass.or.kr',
        department_id: '2',
        department_name: '경기북서부노인보호전문기관',
        role: 'user',
        status: 'approved',
        approved_at: new Date('2025-12-21'),
        last_login_at: new Date('2025-12-25'),
        created_at: new Date('2025-12-19'),
      },
      {
        id: '3',
        email: 'lee.younghee@gg.pass.or.kr',
        department_id: '1',
        department_name: '사업운영팀',
        role: 'user',
        status: 'approved',
        approved_at: new Date('2025-12-22'),
        last_login_at: new Date('2025-12-24'),
        created_at: new Date('2025-12-18'),
      },
    ];

    // 필터링
    let filteredUsers = mockUsers;
    if (status) {
      filteredUsers = filteredUsers.filter(u => u.status === status);
    }
    if (search) {
      filteredUsers = filteredUsers.filter(u => 
        u.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    return NextResponse.json({
      success: true,
      users: filteredUsers,
      pagination: {
        page,
        limit,
        total: filteredUsers.length,
        totalPages: Math.ceil(filteredUsers.length / limit)
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { success: false, message: '사용자 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST: 사용자 승인/거부
export async function POST(request: NextRequest) {
  try {
    const { isAdmin, userId: adminId } = checkAdminAuth(request);
    
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { user_id, approved, department_id, reason } = body;

    if (!user_id) {
      return NextResponse.json(
        { success: false, message: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // TODO: 데이터베이스 업데이트
    /*
    const db = getDatabase();
    
    if (approved) {
      // 승인
      await db.query(
        `UPDATE users 
         SET status = 'approved', 
             approved_by = $1, 
             approved_at = NOW(),
             department_id = $2
         WHERE id = $3`,
        [adminId, department_id, user_id]
      );

      // 관리자 활동 로그
      await db.query(
        `INSERT INTO admin_activities (admin_id, action, target_user_id, details)
         VALUES ($1, 'approve_user', $2, $3)`,
        [adminId, user_id, JSON.stringify({ department_id })]
      );
    } else {
      // 거부
      await db.query(
        `UPDATE users 
         SET status = 'rejected', 
             rejected_reason = $1
         WHERE id = $2`,
        [reason, user_id]
      );

      // 관리자 활동 로그
      await db.query(
        `INSERT INTO admin_activities (admin_id, action, target_user_id, details)
         VALUES ($1, 'reject_user', $2, $3)`,
        [adminId, user_id, JSON.stringify({ reason })]
      );
    }

    return NextResponse.json({
      success: true,
      message: approved ? '사용자가 승인되었습니다.' : '사용자가 거부되었습니다.'
    });
    */

    // Mock 응답
    return NextResponse.json({
      success: true,
      message: approved ? '사용자가 승인되었습니다.' : '사용자가 거부되었습니다.'
    });

  } catch (error) {
    console.error('Approve/Reject user error:', error);
    return NextResponse.json(
      { success: false, message: '처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
