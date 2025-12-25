import { NextRequest, NextResponse } from 'next/server';

function checkAdminAuth(request: NextRequest): { isAdmin: boolean } {
  // TODO: 실제 세션/토큰 검증
  return { isAdmin: true };
}

// GET: 사용자 활동 통계 (개인별, 부서별, 일별)
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
    const type = searchParams.get('type'); // user, department, daily
    const userId = searchParams.get('user_id');
    const departmentId = searchParams.get('department_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // TODO: 실제 데이터베이스 쿼리
    /*
    const db = getDatabase();
    
    if (type === 'user') {
      // 개인별 활동 통계
      let query = `
        SELECT 
          u.id,
          u.email,
          d.name as department_name,
          COUNT(ua.id) as total_activities,
          COUNT(ua.id) FILTER (WHERE ua.activity_type = 'view_content') as content_views,
          COUNT(ua.id) FILTER (WHERE ua.activity_type = 'search') as searches,
          COUNT(ua.id) FILTER (WHERE ua.activity_type = 'ai_summary') as ai_summaries,
          MAX(ua.created_at) as last_activity
        FROM users u
        LEFT JOIN departments d ON u.department_id = d.id
        LEFT JOIN user_activities ua ON u.id = ua.user_id
        WHERE u.status = 'approved'
      `;
      
      const params: any[] = [];
      let paramCount = 0;

      if (userId) {
        paramCount++;
        query += ` AND u.id = $${paramCount}`;
        params.push(userId);
      }

      if (departmentId) {
        paramCount++;
        query += ` AND u.department_id = $${paramCount}`;
        params.push(departmentId);
      }

      if (startDate) {
        paramCount++;
        query += ` AND ua.created_at >= $${paramCount}`;
        params.push(startDate);
      }

      if (endDate) {
        paramCount++;
        query += ` AND ua.created_at <= $${paramCount}`;
        params.push(endDate);
      }

      query += ` GROUP BY u.id, u.email, d.name ORDER BY total_activities DESC`;

      const result = await db.query(query, params);
      return NextResponse.json({ success: true, data: result.rows });
    }
    
    if (type === 'department') {
      // 부서별 활동 통계
      const result = await db.query(`
        SELECT 
          d.id,
          d.name,
          COUNT(DISTINCT u.id) as user_count,
          COUNT(ua.id) as total_activities,
          COUNT(ua.id) FILTER (WHERE ua.activity_type = 'view_content') as content_views,
          COUNT(ua.id) FILTER (WHERE ua.activity_type = 'search') as searches,
          COUNT(ua.id) FILTER (WHERE ua.activity_type = 'ai_summary') as ai_summaries
        FROM departments d
        LEFT JOIN users u ON d.id = u.department_id AND u.status = 'approved'
        LEFT JOIN user_activities ua ON u.id = ua.user_id
        WHERE ua.created_at >= COALESCE($1::timestamp, '1970-01-01')
          AND ua.created_at <= COALESCE($2::timestamp, NOW())
        GROUP BY d.id, d.name
        ORDER BY total_activities DESC
      `, [startDate || '1970-01-01', endDate || new Date().toISOString()]);
      
      return NextResponse.json({ success: true, data: result.rows });
    }

    if (type === 'daily') {
      // 일별 활동 통계
      const result = await db.query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(DISTINCT user_id) as unique_users,
          COUNT(*) as total_activities,
          COUNT(*) FILTER (WHERE activity_type = 'login') as logins,
          COUNT(*) FILTER (WHERE activity_type = 'view_content') as content_views,
          COUNT(*) FILTER (WHERE activity_type = 'search') as searches,
          COUNT(*) FILTER (WHERE activity_type = 'ai_summary') as ai_summaries
        FROM user_activities
        WHERE created_at >= COALESCE($1::timestamp, CURRENT_DATE - INTERVAL '30 days')
          AND created_at <= COALESCE($2::timestamp, NOW())
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `, [startDate, endDate]);

      return NextResponse.json({ success: true, data: result.rows });
    }
    */

    // Mock 데이터
    if (type === 'user') {
      const mockUserStats = [
        {
          id: '1',
          email: 'kim.chulsoo@gg.pass.or.kr',
          department_name: '돌봄서비스팀',
          total_activities: 245,
          content_views: 120,
          searches: 78,
          ai_summaries: 47,
          last_activity: new Date(),
        },
        {
          id: '2',
          email: 'lee.younghee@gg.pass.or.kr',
          department_name: '사업운영팀',
          total_activities: 198,
          content_views: 95,
          searches: 65,
          ai_summaries: 38,
          last_activity: new Date(),
        },
        {
          id: '3',
          email: 'park.minho@gg.pass.or.kr',
          department_name: '돌봄사업본부',
          total_activities: 167,
          content_views: 82,
          searches: 54,
          ai_summaries: 31,
          last_activity: new Date(),
        },
      ];

      return NextResponse.json({ success: true, data: mockUserStats });
    }

    if (type === 'department') {
      const mockDeptStats = [
        {
          id: '1',
          name: '돌봄서비스팀',
          user_count: 35,
          total_activities: 2890,
          content_views: 1456,
          searches: 892,
          ai_summaries: 542,
        },
        {
          id: '2',
          name: '사업운영팀',
          user_count: 28,
          total_activities: 2345,
          content_views: 1178,
          searches: 723,
          ai_summaries: 444,
        },
        {
          id: '3',
          name: '돌봄사업본부',
          user_count: 18,
          total_activities: 1567,
          content_views: 789,
          searches: 484,
          ai_summaries: 294,
        },
      ];

      return NextResponse.json({ success: true, data: mockDeptStats });
    }

    if (type === 'daily') {
      const mockDailyStats = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return {
          date: date.toISOString().split('T')[0],
          unique_users: Math.floor(Math.random() * 40) + 20,
          total_activities: Math.floor(Math.random() * 200) + 100,
          logins: Math.floor(Math.random() * 40) + 20,
          content_views: Math.floor(Math.random() * 80) + 50,
          searches: Math.floor(Math.random() * 50) + 20,
          ai_summaries: Math.floor(Math.random() * 30) + 10,
        };
      });

      return NextResponse.json({ success: true, data: mockDailyStats });
    }

    return NextResponse.json(
      { success: false, message: '잘못된 요청입니다.' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { success: false, message: '통계 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
