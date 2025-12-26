'use client';

import Link from "next/link";
import { useEffect, useState } from "react";

interface Content {
  id: string;
  title: string;
  summary: string;
  ai_summary: string | null;
  category: string;
  source: string;
  region: string | null;
  content_type: string | null;
  published_at: string;
  is_highlight: boolean;
  importance_score: number | null;
  key_points: string[] | null;
  source_urls: string[] | null;
  source_count: number | null;
}

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
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRegion, setSelectedRegion] = useState('전체');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    fetchContents();
  }, [page, selectedRegion, selectedType]);

  const fetchContents = async () => {
    setLoading(true);
    try {
      let url = `/api/contents?category=social-service&page=${page}&limit=10`;
      
      if (selectedRegion !== '전체') {
        url += `&region=${encodeURIComponent(selectedRegion)}`;
      }
      
      if (selectedType !== 'all') {
        url += `&content_type=${selectedType}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      setContents(data.contents || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch contents:', error);
    } finally {
      setLoading(false);
    }
  };

  const getContentTypeLabel = (type: string | null) => {
    if (!type) return '일반';
    const found = CONTENT_TYPES.find(t => t.id === type);
    return found ? found.name : type;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/" className="text-indigo-100 hover:text-white mb-3 inline-block">
            ← 홈으로
          </Link>
          <h1 className="text-4xl font-bold">사회서비스원</h1>
          <p className="mt-2 text-xl text-indigo-100">
            전국 17개 지역 사회서비스원 실시간 동향 (AI 큐레이션)
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                    onClick={() => {
                      setSelectedType(type.id);
                      setPage(1);
                    }}
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
                onChange={(e) => {
                  setSelectedRegion(e.target.value);
                  setPage(1);
                }}
                className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {REGIONS.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 콘텐츠 리스트 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">콘텐츠를 불러오는 중...</p>
          </div>
        ) : contents.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">선택한 조건에 맞는 콘텐츠가 없습니다</h3>
            <p className="mt-2 text-gray-600">다른 지역이나 유형을 선택해보세요.</p>
          </div>
        ) : (
          <>
            {/* 콘텐츠 카드 */}
            <div className="space-y-6">
              {contents.map((content) => (
                <div 
                  key={content.id} 
                  className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden ${
                    content.is_highlight ? 'border-l-4 border-yellow-500' : ''
                  }`}
                >
                  <div className="p-6">
                    {/* 헤더: 지역 + 타입 + 중요도 */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {content.region && (
                          <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                            {content.region}
                          </span>
                        )}
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                          {getContentTypeLabel(content.content_type)}
                        </span>
                        {content.is_highlight && (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                            ⭐ 주요
                          </span>
                        )}
                        {content.source_count && content.source_count > 1 && (
                          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                            📚 {content.source_count}개 출처 통합
                          </span>
                        )}
                      </div>
                      {content.importance_score && (
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-500">{'⭐'.repeat(Math.min(content.importance_score, 10))}</span>
                          <span className="text-sm text-gray-600">({content.importance_score}/10)</span>
                        </div>
                      )}
                    </div>

                    {/* 제목 */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {content.title}
                    </h3>

                    {/* AI 요약 */}
                    {content.ai_summary ? (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          <span className="text-sm font-semibold text-purple-600">AI 통합 요약</span>
                        </div>
                        <p className="text-gray-700 leading-relaxed pl-7">
                          {content.ai_summary}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        {content.summary}
                      </p>
                    )}

                    {/* 핵심 포인트 */}
                    {content.key_points && content.key_points.length > 0 && (
                      <div className="mb-4 bg-indigo-50 rounded-lg p-4">
                        <div className="font-semibold text-indigo-900 mb-2">✓ 핵심 포인트</div>
                        <ul className="space-y-1">
                          {content.key_points.map((point, idx) => (
                            <li key={idx} className="text-indigo-800 text-sm flex items-start">
                              <span className="mr-2">•</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 출처 링크 */}
                    {content.source_urls && content.source_urls.length > 0 && (
                      <div className="mb-4 border-t pt-4">
                        <div className="font-semibold text-gray-700 mb-2">
                          📎 원본 출처 ({content.source_urls.length}개)
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {content.source_urls.map((url, idx) => (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
                            >
                              출처 {idx + 1} →
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 하단 */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4 text-gray-500">
                        <span>{content.source}</span>
                        <span>•</span>
                        <span>
                          {new Date(content.published_at).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <Link 
                        href={`/contents/${content.id}`} 
                        className="text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        자세히 보기 →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="inline-flex rounded-md shadow">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-l-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    이전
                  </button>
                  {[...Array(Math.min(totalPages, 5))].map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-4 py-2 border-t border-b ${
                          pageNum === page
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        } ${idx === 0 ? '' : 'border-l'}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-r-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    다음
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
