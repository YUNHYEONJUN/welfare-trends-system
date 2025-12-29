'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 로그인 상태 확인
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (user && token) {
      try {
        const userData = JSON.parse(user);
        setIsLoggedIn(true);
        setUserEmail(userData.email);
        setIsAdmin(userData.role === 'admin');
      } catch (error) {
        console.error('Failed to parse user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUserEmail('');
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                경기북서부노인보호전문기관
              </h1>
              <p className="mt-2 text-lg text-gray-600">복지동향 정보 시스템</p>
            </div>
            <div className="flex gap-4 items-center">
              {isLoggedIn ? (
                <>
                  <span className="text-gray-700">{userEmail}</span>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                    >
                      관리자
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="px-6 py-2.5 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    로그인
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-6 py-2.5 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                  >
                    회원가입
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 소개 섹션 */}
        <section className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            복지 정책과 학술 정보를 한눈에
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            보건복지부, 경기도, 31개 시군의 최신 복지 정책과 학술 자료를
            자동으로 수집하고 가공하여 제공합니다.
          </p>
        </section>

        {/* 로그인 안내 (비로그인 시만 표시) */}
        {!isLoggedIn && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8 rounded-r-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  콘텐츠를 확인하시려면 <Link href="/auth/login" className="font-medium underline hover:text-blue-800">로그인</Link>이 필요합니다.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 카테고리 카드 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {/* 학술 */}
          <Link href={isLoggedIn ? "/academy" : "/auth/login?redirect=/academy"}>
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer border-t-4 border-blue-500">
              <div className="text-blue-500 mb-4">
                <svg
                  className="w-12 h-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">학술</h3>
              <p className="text-gray-600">
                국내외 최신 논문 요약 및 에디터 분석
              </p>
            </div>
          </Link>

          {/* 정책 */}
          <Link href={isLoggedIn ? "/policy" : "/auth/login?redirect=/policy"}>
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer border-t-4 border-green-500">
              <div className="text-green-500 mb-4">
                <svg
                  className="w-12 h-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">정책</h3>
              <p className="text-gray-600">
                복지부, 경기도 등 주요 정책 동향
              </p>
            </div>
          </Link>

          {/* 짧은생각 */}
          <Link href={isLoggedIn ? "/thoughts" : "/auth/login?redirect=/thoughts"}>
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer border-t-4 border-purple-500">
              <div className="text-purple-500 mb-4">
                <svg
                  className="w-12 h-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                짧은생각
              </h3>
              <p className="text-gray-600">복지 현장의 단상과 인사이트</p>
            </div>
          </Link>

          {/* 사회서비스원 */}
          <Link href={isLoggedIn ? "/social-service" : "/auth/login?redirect=/social-service"}>
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer border-t-4 border-indigo-500">
              <div className="text-indigo-500 mb-4">
                <svg
                  className="w-12 h-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                사회서비스원
              </h3>
              <p className="text-gray-600">전국 17개 지역 실시간 동향</p>
              <div className="mt-3 flex items-center text-sm text-indigo-600 font-medium">
                <span className="bg-indigo-100 px-2 py-1 rounded">NEW</span>
              </div>
            </div>
          </Link>
        </div>

        {/* 주요 기능 */}
        <section className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">주요 기능</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-medium text-gray-900">
                  자동 수집 및 분류
                </h4>
                <p className="mt-2 text-gray-600">
                  복지부, 경기도, 31개 시군의 정보를 자동으로 수집하고
                  카테고리별로 분류합니다.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-medium text-gray-900">
                  AI 콘텐츠 가공
                </h4>
                <p className="mt-2 text-gray-600">
                  수집된 정보를 AI가 자동으로 요약하고 핵심 내용을
                  추출합니다.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-medium text-gray-900">
                  실시간 알림
                </h4>
                <p className="mt-2 text-gray-600">
                  새로운 정책이나 소식이 업데이트되면 실시간으로 알림을
                  받습니다.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-yellow-500 text-white">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-medium text-gray-900">
                  아카이브 및 검색
                </h4>
                <p className="mt-2 text-gray-600">
                  과거 자료를 체계적으로 보관하고 쉽게 검색할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 푸터 */}
      <footer className="bg-gray-800 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-400">
            © 2024 경기북서부노인보호전문기관. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
