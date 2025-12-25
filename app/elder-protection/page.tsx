'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Content {
  id: string;
  title: string;
  summary: string;
  source: string;
  published_at: string;
  is_highlight: boolean;
  content_type: string;
  tags: string[];
}

export default function ElderProtectionPage() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userDepartment, setUserDepartment] = useState<string | null>(null);

  useEffect(() => {
    checkAccessAndFetchContents();
  }, []);

  const checkAccessAndFetchContents = async () => {
    try {
      setLoading(true);

      // 사용자 정보 및 토큰 확인 (localStorage에서)
      const userStr = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (!userStr || !token) {
        setError('로그인이 필요합니다.');
        setLoading(false);
        return;
      }

      const user = JSON.parse(userStr);
      const department = user.department_name;
      setUserDepartment(department);

      // 경기북서부노인보호전문기관 직원인지 확인
      const isElderProtectionStaff = department === '경기북서부노인보호전문기관';

      if (!isElderProtectionStaff && user.role !== 'admin') {
        setError('이 게시판은 경기북서부노인보호전문기관 직원만 접근 가능합니다.');
        setLoading(false);
        return;
      }

      // API 호출하여 콘텐츠 가져오기
      const response = await fetch('/api/elder-protection', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.message || '콘텐츠를 불러오는데 실패했습니다.');
        setLoading(false);
        return;
      }

      // Mock 데이터 사용 (데이터베이스에 데이터가 없을 경우)
      if (result.data.length === 0) {
        const mockContents: Content[] = [
          {
            id: '1',
            title: `${department} 2025년 1월 업무 보고`,
            summary: '2025년 1월 주요 업무 진행 사항 및 상담 통계',
            source: department,
            published_at: new Date().toISOString(),
            is_highlight: true,
            content_type: 'notice',
            tags: ['업무보고', '통계'],
          },
          {
            id: '2',
            title: `${department} 노인학대 예방 교육 자료`,
            summary: '2025년 노인학대 예방 교육 자료 및 매뉴얼',
            source: department,
            published_at: new Date(Date.now() - 86400000).toISOString(),
            is_highlight: false,
            content_type: 'document',
            tags: ['교육', '예방'],
          },
          {
            id: '3',
            title: `${department} 사례 공유 (비공개)`,
            summary: '2024년 12월 주요 사례 분석 및 개입 결과',
            source: department,
            published_at: new Date(Date.now() - 172800000).toISOString(),
            is_highlight: true,
            content_type: 'case',
            tags: ['사례', '개입'],
          },
        ];
        setContents(mockContents);
      } else {
        setContents(result.data);
      }
    } catch (err) {
      console.error('Error fetching elder protection contents:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">접근 권한 확인 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">접근 제한</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3">
            <Link
              href="/"
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              홈으로
            </Link>
            <Link
              href="/auth/login"
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              로그인
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-8 bg-red-600 rounded"></div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">노인보호전문기관 전용 게시판</h1>
                  <p className="text-sm text-gray-600 mt-1">
                    🔒 {userDepartment} 직원 전용
                  </p>
                </div>
              </div>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              홈으로
            </Link>
          </div>
        </div>
      </header>

      {/* 안내 배너 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-red-50 border-l-4 border-red-600 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">기관 전용 게시판 안내</h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>이 게시판은 <strong>{userDepartment}</strong> 직원만 열람 가능합니다.</li>
                  <li>사례 정보 및 내부 자료는 외부 유출을 금지합니다.</li>
                  <li>모든 게시글은 개인정보 보호법을 준수해야 합니다.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 콘텐츠 목록 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow">
          {/* 헤더 */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                게시글 목록 ({contents.length})
              </h2>
              <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm">
                + 새 글 작성
              </button>
            </div>
          </div>

          {/* 목록 */}
          <div className="divide-y divide-gray-200">
            {contents.map((content) => (
              <div
                key={content.id}
                className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {content.is_highlight && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                          ⭐ 중요
                        </span>
                      )}
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                        {content.content_type === 'notice' && '공지'}
                        {content.content_type === 'document' && '자료'}
                        {content.content_type === 'case' && '사례'}
                      </span>
                      <span className="text-xs text-gray-500">🔒 비공개</span>
                    </div>
                    <h3 className="text-base font-medium text-gray-900 mb-1">
                      {content.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{content.summary}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{content.source}</span>
                      <span>•</span>
                      <span>{new Date(content.published_at).toLocaleDateString('ko-KR')}</span>
                      <span>•</span>
                      <div className="flex space-x-1">
                        {content.tags.map((tag, idx) => (
                          <span key={idx} className="text-primary-600">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 안내 문구 */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>💡 다른 노인보호전문기관의 게시글은 각 기관 직원만 열람할 수 있습니다.</p>
        </div>
      </main>
    </div>
  );
}
