'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  department_id?: string;
  department_name?: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  created_at: string;
  approved_at?: string;
  last_login_at?: string;
}

const departments = [
  // 경영기획본부
  { id: '1', name: '기획예산팀' },
  { id: '2', name: '경영지원팀' },
  { id: '3', name: '전략사업팀' },
  { id: '4', name: '서비스지원팀' },
  { id: '5', name: '사업지원팀' },
  
  // 직영시설
  { id: '6', name: '직영시설' },
  { id: '7', name: '남양주종합재가센터' },
  { id: '8', name: '부천종합재가센터' },
  
  // 공공광역센터
  { id: '9', name: '공공광역센터' },
  { id: '10', name: '노인일자리지원센터' },
  { id: '11', name: '노인종합상담센터' },
  { id: '12', name: '노인보호전문기관' },
  { id: '13', name: '장기요양요원지원센터' },
  { id: '14', name: '노인인증돌봄지원센터' },
  { id: '15', name: '학대피해노인전용쉼터' },
  { id: '16', name: '지역사회서비스지원단' },
  
  // 노인보호전문기관 (6개)
  { id: '17', name: '경기북서부노인보호전문기관' },
  { id: '18', name: '경기북부노인보호전문기관' },
  { id: '19', name: '경기동부노인보호전문기관' },
  { id: '20', name: '경기서부노인보호전문기관' },
  { id: '21', name: '경기남부노인보호전문기관' },
  { id: '22', name: '경기북동부노인보호전문기관' },
  
  // 학대피해노인전용쉼터 (3개)
  { id: '23', name: '경기북부학대피해노인전용쉼터' },
  { id: '24', name: '경기서부학대피해노인전용쉼터' },
  { id: '25', name: '경기남부학대피해노인전용쉼터' },
];

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'suspended'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [filter, searchQuery]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/admin/users?${params.toString()}`);
      const result = await response.json();
      if (result.success) {
        setUsers(result.users);
      }
    } catch (error) {
      console.error('사용자 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string, departmentId: string) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          approved: true,
          department_id: departmentId,
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert('사용자가 승인되었습니다.');
        setShowApprovalModal(false);
        setSelectedUser(null);
        setSelectedDepartment('');
        fetchUsers();
      }
    } catch (error) {
      console.error('승인 처리 실패:', error);
      alert('승인 처리 중 오류가 발생했습니다.');
    }
  };

  const handleReject = async (userId: string, reason: string) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          approved: false,
          reason: reason,
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert('사용자가 거부되었습니다.');
        setShowApprovalModal(false);
        setSelectedUser(null);
        setRejectionReason('');
        fetchUsers();
      }
    } catch (error) {
      console.error('거부 처리 실패:', error);
      alert('거부 처리 중 오류가 발생했습니다.');
    }
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    suspended: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const statusLabels = {
    pending: '승인 대기',
    approved: '승인됨',
    rejected: '거부됨',
    suspended: '정지됨',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">사용자 관리</h1>
              <p className="text-sm text-gray-600 mt-1">경기도사회서비스원 직원 계정 관리</p>
            </div>
            <Link
              href="/admin"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              대시보드로
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 필터 및 검색 */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* 상태 필터 */}
            <div className="flex gap-2">
              {(['all', 'pending', 'approved', 'rejected', 'suspended'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    filter === status
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? '전체' : statusLabels[status]}
                </button>
              ))}
            </div>

            {/* 검색 */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="이메일 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* 사용자 목록 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">사용자가 없습니다.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    이메일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    부서
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    가입일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    최근 로그인
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.department_name || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full border ${
                          statusColors[user.status]
                        }`}
                      >
                        {statusLabels[user.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.last_login_at
                        ? new Date(user.last_login_at).toLocaleDateString('ko-KR')
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {user.status === 'pending' && (
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowApprovalModal(true);
                          }}
                          className="text-primary-600 hover:text-primary-900 font-medium"
                        >
                          승인 처리
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* 승인/거부 모달 */}
      {showApprovalModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              사용자 승인 처리
            </h3>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">이메일</p>
              <p className="font-medium text-gray-900">{selectedUser.email}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                부서 배정 <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">부서 선택</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                거부 사유 (거부 시)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="거부 사유를 입력하세요..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (!selectedDepartment) {
                    alert('부서를 선택해주세요.');
                    return;
                  }
                  handleApprove(selectedUser.id, selectedDepartment);
                }}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                승인
              </button>
              <button
                onClick={() => {
                  if (!rejectionReason.trim()) {
                    alert('거부 사유를 입력해주세요.');
                    return;
                  }
                  handleReject(selectedUser.id, rejectionReason);
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                거부
              </button>
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setSelectedUser(null);
                  setSelectedDepartment('');
                  setRejectionReason('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
