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
  published_at: string;
  is_highlight: boolean;
  importance_score: number | null;
  key_points: string[] | null;
  source_urls: string[] | null;
  source_count: number | null;
}

export default function ThoughtsPage() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchContents();
  }, [page]);

  const fetchContents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/contents?category=thoughts&page=${page}&limit=10`);
      const data = await response.json();
      setContents(data.contents || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch contents:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (score: number | null) => {
    if (!score) return null;
    const stars = '⭐'.repeat(Math.min(score, 10));
    return (
      <div className="flex items-center gap-2">
        <span className="text-yellow-500">{stars}</span>
        <span className="text-sm text-gray-600">({score}/10)</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/" className="text-purple-600 hover:text-purple-800 mb-2 inline-block">
            ← 홈으로
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">짧은생각</h1>
          <p className="mt-2 text-lg text-gray-600">
            복지 현장의 단상과 인사이트 (AI 큐레이션)
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">콘텐츠를 불러오는 중...</p>
          </div>
        ) : contents.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">아직 콘텐츠가 없습니다</h3>
            <p className="mt-2 text-gray-600">크롤링 및 큐레이션을 실행하면 콘텐츠가 표시됩니다.</p>
          </div>
        ) : (
          <>
            {/* 콘텐츠 그리드 */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contents.map((content) => (
                <div 
                  key={content.id} 
                  className={`bg-white rounded-lg shadow hover:shadow-xl transition-shadow overflow-hidden ${
                    content.is_highlight ? 'ring-2 ring-purple-500' : ''
                  }`}
                >
                  {/* 그라데이션 헤더 */}
                  <div className="h-40 bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                    <div className="text-white text-center p-6">
                      <div className="text-sm font-bold mb-2">💭 단상</div>
                      {content.importance_score && (
                        <div className="text-xs">
                          {renderStars(content.importance_score)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 콘텐츠 */}
                  <div className="p-6">
                    {/* 배지 */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                        {content.source}
                      </span>
                      {content.is_highlight && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                          ⭐
                        </span>
                      )}
                    </div>

                    {/* 제목 */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {content.title}
                    </h3>

                    {/* 요약 */}
                    {content.ai_summary ? (
                      <div className="mb-3">
                        <div className="flex items-center gap-1 mb-1">
                          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          <span className="text-xs font-semibold text-purple-600">AI 요약</span>
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-3">
                          {content.ai_summary}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                        {content.summary}
                      </p>
                    )}

                    {/* 핵심 포인트 */}
                    {content.key_points && content.key_points.length > 0 && (
                      <div className="mb-3 bg-purple-50 rounded-lg p-3">
                        <div className="text-xs font-semibold text-purple-900 mb-1">✓ 핵심 포인트</div>
                        <ul className="space-y-1">
                          {content.key_points.slice(0, 2).map((point, idx) => (
                            <li key={idx} className="text-purple-800 text-xs flex items-start">
                              <span className="mr-1">•</span>
                              <span className="line-clamp-1">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 하단 */}
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t">
                      <span>
                        {new Date(content.published_at).toLocaleDateString('ko-KR')}
                      </span>
                      <Link 
                        href={`/contents/${content.id}`} 
                        className="text-purple-600 hover:text-purple-800 font-medium"
                      >
                        더보기 →
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
                            ? 'bg-purple-600 text-white border-purple-600'
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
