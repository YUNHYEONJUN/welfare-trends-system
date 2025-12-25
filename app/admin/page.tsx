'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface DashboardData {
  user_stats: {
    total_users: number;
    approved_users: number;
    pending_users: number;
    rejected_users: number;
    suspended_users: number;
    active_today: number;
    active_week: number;
    new_users_month: number;
  };
  department_stats: Array<{
    department_name: string;
    total_users: number;
    approved_users: number;
    pending_users: number;
    active_today: number;
  }>;
  top_users: Array<{
    email: string;
    department_name: string;
    activity_count: number;
    last_activity: string;
  }>;
  recent_admin_actions: Array<{
    action: string;
    admin_email: string;
    target_email: string;
    created_at: string;
    details?: any;
  }>;
  today_activity_breakdown: Array<{
    activity_type: string;
    count: number;
    unique_users: number;
  }>;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard');
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-600">데이터를 불러올 수 없습니다.</p>
      </div>
    );
  }

  const actionLabels: Record<string, string> = {
    approve_user: '사용자 승인',
    reject_user: '사용자 거부',
    suspend_user: '사용자 정지',
    assign_department: '부서 배정',
  };

  const activityLabels: Record<string, string> = {
    login: '로그인',
    view_content: '콘텐츠 조회',
    search: '검색',
    ai_summary: 'AI 요약',
    filter: '필터링',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
              <p className="text-sm text-gray-600 mt-1">경기도사회서비스원 복지동향 시스템</p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/admin/users"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                사용자 관리
              </Link>
              <Link
                href="/"
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                홈으로
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 전체 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="전체 사용자"
            value={data.user_stats.total_users}
            subtitle={`승인: ${data.user_stats.approved_users}명`}
            color="blue"
          />
          <StatCard
            title="승인 대기"
            value={data.user_stats.pending_users}
            subtitle="대기 중인 사용자"
            color="yellow"
            highlight
          />
          <StatCard
            title="오늘 활동 사용자"
            value={data.user_stats.active_today}
            subtitle={`주간: ${data.user_stats.active_week}명`}
            color="green"
          />
          <StatCard
            title="이번 달 신규"
            value={data.user_stats.new_users_month}
            subtitle="최근 30일"
            color="purple"
          />
        </div>

        {/* 부서별 통계 & 활동 유형별 통계 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 부서별 통계 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">부서별 사용자 현황</h2>
            <div className="space-y-3">
              {data.department_stats.map((dept, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{dept.department_name}</p>
                    <p className="text-sm text-gray-500">
                      전체 {dept.total_users}명 · 승인 {dept.approved_users}명
                      {dept.pending_users > 0 && (
                        <span className="ml-2 text-yellow-600">대기 {dept.pending_users}명</span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">
                      오늘 {dept.active_today}명 활동
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 오늘 활동 유형별 통계 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">오늘 활동 현황</h2>
            <div className="space-y-3">
              {data.today_activity_breakdown.map((activity, index) => (
                <div key={index} className="flex justify-between items-center py-2">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-primary-600 mr-3"></div>
                    <span className="font-medium text-gray-900">
                      {activityLabels[activity.activity_type] || activity.activity_type}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{activity.count}회</p>
                    <p className="text-xs text-gray-500">{activity.unique_users}명</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 상위 활동 사용자 & 최근 관리자 활동 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 상위 활동 사용자 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              상위 활동 사용자 <span className="text-sm font-normal text-gray-500">(최근 30일)</span>
            </h2>
            <div className="space-y-3">
              {data.top_users.slice(0, 5).map((user, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-semibold mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.email}</p>
                      <p className="text-sm text-gray-500">{user.department_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{user.activity_count}회</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 최근 관리자 활동 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">최근 관리자 활동</h2>
            <div className="space-y-3">
              {data.recent_admin_actions.slice(0, 5).map((action, index) => (
                <div key={index} className="py-2 border-b last:border-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {actionLabels[action.action] || action.action}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        관리자: {action.admin_email}
                      </p>
                      {action.target_email && (
                        <p className="text-xs text-gray-600">
                          대상: {action.target_email}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                      {new Date(action.created_at).toLocaleString('ko-KR', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// 통계 카드 컴포넌트
interface StatCardProps {
  title: string;
  value: number;
  subtitle: string;
  color: 'blue' | 'yellow' | 'green' | 'purple';
  highlight?: boolean;
}

function StatCard({ title, value, subtitle, color, highlight }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  return (
    <div
      className={`bg-white rounded-lg shadow p-6 border-l-4 ${
        highlight ? 'ring-2 ring-yellow-300' : ''
      }`}
    >
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className={`text-3xl font-bold ${colorClasses[color].split(' ')[1]} mb-1`}>{value}</p>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}
