import { NextRequest, NextResponse } from 'next/server';

function checkAdminAuth(request: NextRequest): { isAdmin: boolean; userId?: string } {
  // TODO: 실제 세션/토큰 검증
  return { isAdmin: true, userId: 'mock-admin-id' };
}

export async function GET(request: NextRequest) {
  try {
    const { isAdmin } = checkAdminAuth(request);
    
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    // TODO: 실제 데이터베이스 쿼리
    /*
    const db = getDatabase();
    
    // 1. 전체 사용자 통계
    const userStats = await db.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE status = 'approved') as approved_users,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_users,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected_users,
        COUNT(*) FILTER (WHERE status = 'suspended') as suspended_users,
        COUNT(*) FILTER (WHERE last_login_at >= CURRENT_DATE) as active_today,
        COUNT(*) FILTER (WHERE last_login_at >= CURRENT_DATE - INTERVAL '7 days') as active_week,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_users_month
      FROM users
    `);
    
    // 2. 부서별 통계
    const departmentStats = await db.query(`
      SELECT * FROM department_user_stats
      ORDER BY total_users DESC
    `);
    
    // 3. 일별 활동 통계 (최근 30일)
    const dailyActivityStats = await db.query(`
      SELECT * FROM daily_activity_stats
      WHERE activity_date >= CURRENT_DATE - INTERVAL '30 days'
      ORDER BY activity_date DESC
      LIMIT 30
    `);
    
    // 4. 상위 활동 사용자 (최근 30일)
    const topUsers = await db.query(`
      SELECT 
        u.email,
        d.name as department_name,
        COUNT(ua.id) as activity_count,
        MAX(ua.created_at) as last_activity
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN user_activities ua ON u.id = ua.user_id
      WHERE ua.created_at >= CURRENT_DATE - INTERVAL '30 days'
        AND u.status = 'approved'
      GROUP BY u.id, u.email, d.name
      ORDER BY activity_count DESC
      LIMIT 10
    `);
    
    // 5. 최근 관리자 활동
    const recentAdminActions = await db.query(`
      SELECT 
        aa.*,
        admin.email as admin_email,
        target.email as target_email
      FROM admin_activities aa
      LEFT JOIN users admin ON aa.admin_id = admin.id
      LEFT JOIN users target ON aa.target_user_id = target.id
      ORDER BY aa.created_at DESC
      LIMIT 20
    `);
    
    // 6. 활동 유형별 통계 (오늘)
    const todayActivityBreakdown = await db.query(`
      SELECT 
        activity_type,
        COUNT(*) as count,
        COUNT(DISTINCT user_id) as unique_users
      FROM user_activities
      WHERE created_at >= CURRENT_DATE
      GROUP BY activity_type
      ORDER BY count DESC
    `);
    
    return NextResponse.json({
      success: true,
      data: {
        user_stats: userStats.rows[0],
        department_stats: departmentStats.rows,
        daily_activity: dailyActivityStats.rows,
        top_users: topUsers.rows,
        recent_admin_actions: recentAdminActions.rows,
        today_activity_breakdown: todayActivityBreakdown.rows
      }
    });
    */

    // Mock 데이터
    const mockData = {
      user_stats: {
        total_users: 127,
        approved_users: 98,
        pending_users: 15,
        rejected_users: 8,
        suspended_users: 6,
        active_today: 34,
        active_week: 67,
        new_users_month: 23,
      },
      department_stats: [
        {
          department_id: '1',
          department_name: '경기북서부노인보호전문기관',
          total_users: 22,
          approved_users: 20,
          pending_users: 2,
          active_today: 15,
        },
        {
          department_id: '2',
          department_name: '경기북부노인보호전문기관',
          total_users: 18,
          approved_users: 16,
          pending_users: 2,
          active_today: 12,
        },
        {
          department_id: '3',
          department_name: '경기동부노인보호전문기관',
          total_users: 20,
          approved_users: 18,
          pending_users: 2,
          active_today: 14,
        },
        {
          department_id: '7',
          department_name: '경영지원본부',
          total_users: 15,
          approved_users: 13,
          pending_users: 2,
          active_today: 8,
        },
        {
          department_id: '8',
          department_name: '사업운영본부',
          total_users: 25,
          approved_users: 22,
          pending_users: 3,
          active_today: 18,
        },
        {
          department_id: '9',
          department_name: '돌봄사업본부',
          total_users: 30,
          approved_users: 27,
          pending_users: 3,
          active_today: 20,
        },
      ],
      daily_activity: Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return {
          activity_date: date.toISOString().split('T')[0],
          unique_users: Math.floor(Math.random() * 40) + 20,
          total_activities: Math.floor(Math.random() * 200) + 100,
          logins: Math.floor(Math.random() * 40) + 20,
          content_views: Math.floor(Math.random() * 80) + 50,
          searches: Math.floor(Math.random() * 50) + 20,
          ai_summaries: Math.floor(Math.random() * 30) + 10,
        };
      }),
      top_users: [
        {
          email: 'kim.chulsoo@gg.pass.or.kr',
          department_name: '경기북서부노인보호전문기관',
          activity_count: 245,
          last_activity: new Date(),
        },
        {
          email: 'lee.younghee@gg.pass.or.kr',
          department_name: '사업운영본부',
          activity_count: 198,
          last_activity: new Date(),
        },
        {
          email: 'park.minho@gg.pass.or.kr',
          department_name: '교육연구본부',
          activity_count: 167,
          last_activity: new Date(),
        },
        {
          email: 'choi.jiwon@gg.pass.or.kr',
          department_name: '경영지원팀',
          activity_count: 134,
          last_activity: new Date(),
        },
        {
          email: 'jung.sooyoung@gg.pass.or.kr',
          department_name: '교육연구본부',
          activity_count: 121,
          last_activity: new Date(),
        },
      ],
      recent_admin_actions: [
        {
          id: '1',
          action: 'approve_user',
          admin_email: 'admin@gg.pass.or.kr',
          target_email: 'hong.gildong@gg.pass.or.kr',
          created_at: new Date(Date.now() - 1000 * 60 * 30),
        },
        {
          id: '2',
          action: 'assign_department',
          admin_email: 'admin@gg.pass.or.kr',
          target_email: 'kim.chulsoo@gg.pass.or.kr',
          details: { department: '사업운영팀' },
          created_at: new Date(Date.now() - 1000 * 60 * 120),
        },
        {
          id: '3',
          action: 'reject_user',
          admin_email: 'admin@gg.pass.or.kr',
          target_email: 'spam@gg.pass.or.kr',
          details: { reason: '직원 확인 불가' },
          created_at: new Date(Date.now() - 1000 * 60 * 180),
        },
      ],
      today_activity_breakdown: [
        { activity_type: 'view_content', count: 156, unique_users: 28 },
        { activity_type: 'search', count: 89, unique_users: 24 },
        { activity_type: 'login', count: 34, unique_users: 34 },
        { activity_type: 'ai_summary', count: 42, unique_users: 18 },
        { activity_type: 'filter', count: 67, unique_users: 22 },
      ],
    };

    return NextResponse.json({
      success: true,
      data: mockData,
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { success: false, message: '대시보드 데이터 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
