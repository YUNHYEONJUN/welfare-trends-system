"use client";

import Link from "next/link";
import { useState } from "react";

const REGIONS = [
  '전체', '서울특별시', '부산광역시', '대구광역시', '인천광역시',
  '광주광역시', '대전광역시', '울산광역시', '세종특별자치시',
  '경기도', '강원특별자치도', '충청북도', '충청남도',
  '전북특별자치도', '전라남도', '경상북도', '경상남도', '제주특별자치도'
];

const CONTENT_TYPES = [
  { id: 'all', name: '전체' },
  { id: 'policy', name: '제도/정책' },
  { id: 'news', name: '주요 기사' },
  { id: 'notice', name: '공지사항' },
  { id: 'recruitment', name: '채용정보' },
];

export default function SocialServicePage() {
  const [selectedRegion, setSelectedRegion] = useState('전체');
  const [selectedType, setSelectedType] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/" className="text-indigo-100 hover:text-white mb-3 inline-block">
            ← 홈으로
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold">사회서비스원</h1>
              <p className="mt-2 text-xl text-indigo-100">
                전국 17개 지역 사회서비스원 실시간 동향
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-2 bg-white/10 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-md transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-indigo-600 shadow'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                목록형
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-4 py-2 rounded-md transition-all ${
                  viewMode === 'timeline'
                    ? 'bg-white text-indigo-600 shadow'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                타임라인
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 통계 대시보드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">총 콘텐츠</p>
                <p className="text-3xl font-bold text-gray-900">1,247</p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">오늘 업데이트</p>
                <p className="text-3xl font-bold text-gray-900">23</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">주요 기사</p>
                <p className="text-3xl font-bold text-gray-900">42</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">채용공고</p>
                <p className="text-3xl font-bold text-gray-900">15</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* 필터 영역 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="space-y-4">
            {/* 콘텐츠 타입 필터 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                콘텐츠 유형
              </label>
              <div className="flex flex-wrap gap-2">
                {CONTENT_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedType === type.id
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 지역 필터 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                지역 선택
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {REGIONS.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            {/* 검색 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                키워드 검색
              </label>
              <input
                type="text"
                placeholder="키워드를 입력하세요..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* 콘텐츠 영역 */}
        {viewMode === 'list' ? (
          <div className="space-y-6">
            {/* 주요 기사 섹션 */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <span className="bg-yellow-500 text-white px-3 py-1 rounded-lg mr-3">⭐</span>
                  주요 기사
                </h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2"></div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                        경기도
                      </span>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        제도/정책
                      </span>
                      <span className="text-xs text-yellow-600 font-bold flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        주요
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      경기도사회서비스원, 2025년 돌봄 인력 1,000명 신규 채용 계획 발표
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      경기도사회서비스원이 2025년 사회서비스 확대를 위해 돌봄 인력 1,000명을 신규 채용한다고 발표했습니다. 이번 채용은 노인, 장애인, 아동 돌봄 서비스 강화를 위한 것으로...
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>2024-12-23</span>
                      <Link href="#" className="text-indigo-600 hover:text-indigo-800 font-medium">
                        자세히 보기 →
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2"></div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                        서울특별시
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        주요 기사
                      </span>
                      <span className="text-xs text-yellow-600 font-bold flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        주요
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      서울시사회서비스원, 요양보호사 처우 개선 방안 마련
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      서울시사회서비스원이 요양보호사의 근무 환경 개선과 처우 향상을 위한 종합 대책을 발표했습니다. 급여 인상과 함께 교육 프로그램 강화, 휴게시설 확충 등을 포함...
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>2024-12-22</span>
                      <Link href="#" className="text-indigo-600 hover:text-indigo-800 font-medium">
                        자세히 보기 →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 일반 콘텐츠 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">최신 소식</h2>
              
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                          부산광역시
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
                          공지사항
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        부산사회서비스원 2025년 상반기 채용 공고
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        부산광역시사회서비스원에서 사회복지사, 요양보호사 등 다양한 직종의 인력을 채용합니다. 지원 기간은 2024년 12월 30일까지...
                      </p>
                      <div className="flex items-center text-sm text-gray-500">
                        <span>2024-12-21</span>
                        <span className="mx-2">•</span>
                        <span>조회 245</span>
                      </div>
                    </div>
                    <Link href="#" className="ml-4 text-indigo-600 hover:text-indigo-800">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          인천광역시
                        </span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                          제도/정책
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        인천 사회서비스원, 지역 돌봄 거점센터 3개소 추가 개소
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        인천광역시사회서비스원이 지역사회 돌봄 서비스 확대를 위해 남동구, 서구, 강화군에 돌봄 거점센터를 추가로 개소했습니다...
                      </p>
                      <div className="flex items-center text-sm text-gray-500">
                        <span>2024-12-20</span>
                        <span className="mx-2">•</span>
                        <span>조회 189</span>
                      </div>
                    </div>
                    <Link href="#" className="ml-4 text-indigo-600 hover:text-indigo-800">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                          대전광역시
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          주요 기사
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        대전사회서비스원, 노인 맞춤돌봄 서비스 만족도 조사 결과 발표
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        대전광역시사회서비스원이 실시한 노인 맞춤돌봄 서비스 만족도 조사 결과, 전체 만족도가 4.5점(5점 만점)으로 나타났습니다...
                      </p>
                      <div className="flex items-center text-sm text-gray-500">
                        <span>2024-12-19</span>
                        <span className="mx-2">•</span>
                        <span>조회 312</span>
                      </div>
                    </div>
                    <Link href="#" className="ml-4 text-indigo-600 hover:text-indigo-800">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : (
          /* 타임라인 뷰 */
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-indigo-200"></div>
            
            <div className="space-y-8">
              {/* 오늘 */}
              <div className="relative pl-20">
                <div className="absolute left-0 w-16 text-right">
                  <div className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded">
                    오늘
                  </div>
                </div>
                <div className="absolute left-6 w-5 h-5 bg-indigo-600 rounded-full border-4 border-white shadow"></div>
                
                <div className="space-y-4">
                  <div className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs font-medium">경기도</span>
                      <span className="text-sm text-gray-500">14:30</span>
                    </div>
                    <h4 className="font-bold text-gray-900 mb-1">경기도사회서비스원 돌봄 인력 채용 발표</h4>
                    <p className="text-sm text-gray-600">2025년 신규 채용 계획 공개</p>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">서울특별시</span>
                      <span className="text-sm text-gray-500">10:15</span>
                    </div>
                    <h4 className="font-bold text-gray-900 mb-1">요양보호사 처우 개선 방안 마련</h4>
                    <p className="text-sm text-gray-600">급여 인상 및 근무환경 개선</p>
                  </div>
                </div>
              </div>

              {/* 어제 */}
              <div className="relative pl-20">
                <div className="absolute left-0 w-16 text-right">
                  <div className="bg-gray-600 text-white text-xs font-bold px-2 py-1 rounded">
                    어제
                  </div>
                </div>
                <div className="absolute left-6 w-5 h-5 bg-gray-400 rounded-full border-4 border-white shadow"></div>
                
                <div className="space-y-4">
                  <div className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">부산광역시</span>
                      <span className="text-sm text-gray-500">2024-12-22 16:20</span>
                    </div>
                    <h4 className="font-bold text-gray-900 mb-1">2025년 상반기 채용 공고</h4>
                    <p className="text-sm text-gray-600">사회복지사, 요양보호사 등 모집</p>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">인천광역시</span>
                      <span className="text-sm text-gray-500">2024-12-22 11:45</span>
                    </div>
                    <h4 className="font-bold text-gray-900 mb-1">돌봄 거점센터 3개소 추가 개소</h4>
                    <p className="text-sm text-gray-600">남동구, 서구, 강화군</p>
                  </div>
                </div>
              </div>

              {/* 이번 주 */}
              <div className="relative pl-20">
                <div className="absolute left-0 w-16 text-right">
                  <div className="bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded">
                    이번주
                  </div>
                </div>
                <div className="absolute left-6 w-5 h-5 bg-gray-300 rounded-full border-4 border-white shadow"></div>
                
                <div className="space-y-4">
                  <div className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">대전광역시</span>
                      <span className="text-sm text-gray-500">2024-12-19</span>
                    </div>
                    <h4 className="font-bold text-gray-900 mb-1">노인 맞춤돌봄 만족도 조사 결과</h4>
                    <p className="text-sm text-gray-600">전체 만족도 4.5점(5점 만점)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 페이지네이션 */}
        {viewMode === 'list' && (
          <div className="mt-8 flex justify-center">
            <nav className="inline-flex rounded-md shadow">
              <button className="px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-l-md">
                이전
              </button>
              <button className="px-4 py-2 border-t border-b border-gray-300 bg-indigo-600 text-sm font-medium text-white">
                1
              </button>
              <button className="px-4 py-2 border-t border-b border-r border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                2
              </button>
              <button className="px-4 py-2 border-t border-b border-r border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                3
              </button>
              <button className="px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-r-md">
                다음
              </button>
            </nav>
          </div>
        )}
      </main>
    </div>
  );
}
