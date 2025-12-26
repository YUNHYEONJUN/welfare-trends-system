'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Content {
  id: string;
  title: string;
  summary: string;
  full_content: string;
  ai_summary: string | null;
  category: string;
  source: string;
  source_url: string | null;
  region: string | null;
  content_type: string | null;
  published_at: string;
  created_at: string;
  is_highlight: boolean;
  is_curated: boolean;
  importance_score: number | null;
  key_points: string[] | null;
  source_urls: string[] | null;
  source_count: number | null;
  tags: string[] | null;
}

export default function ContentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchContent(params.id as string);
    }
  }, [params.id]);

  const fetchContent = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/contents/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setContent(data.content);
      } else {
        setError(data.message || '콘텐츠를 찾을 수 없습니다.');
      }
    } catch (err) {
      console.error('Failed to fetch content:', err);
      setError('콘텐츠를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryInfo = (category: string) => {
    const categories: Record<string, { name: string; color: string; bg: string }> = {
      'policy': { name: '정책', color: 'text-green-800', bg: 'bg-green-100' },
      'academy': { name: '학술', color: 'text-blue-800', bg: 'bg-blue-100' },
      'thoughts': { name: '짧은생각', color: 'text-purple-800', bg: 'bg-purple-100' },
      'social-service': { name: '사회서비스원', color: 'text-indigo-800', bg: 'bg-indigo-100' },
      'elder-protection': { name: '노인보호전문기관', color: 'text-red-800', bg: 'bg-red-100' },
    };
    return categories[category] || { name: category, color: 'text-gray-800', bg: 'bg-gray-100' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">콘텐츠를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">콘텐츠를 찾을 수 없습니다</h3>
          <p className="mt-2 text-gray-600">{error || '요청하신 콘텐츠가 존재하지 않습니다.'}</p>
          <button
            onClick={() => router.back()}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  const categoryInfo = getCategoryInfo(content.category);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            돌아가기
          </button>
        </div>
      </header>

      {/* 콘텐츠 */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* 상단 메타 정보 */}
          <div className="px-8 pt-8 pb-6 border-b">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className={`px-3 py-1 ${categoryInfo.bg} ${categoryInfo.color} rounded-full text-sm font-medium`}>
                {categoryInfo.name}
              </span>
              
              {content.region && (
                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                  {content.region}
                </span>
              )}

              {content.is_curated && (
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  🤖 AI 큐레이션
                </span>
              )}

              {content.is_highlight && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                  ⭐ 주요
                </span>
              )}

              {content.source_count && content.source_count > 1 && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  📚 {content.source_count}개 출처 통합
                </span>
              )}

              {content.importance_score && (
                <span className="px-3 py-1 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-full text-sm font-medium">
                  중요도 {content.importance_score}/10
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
              {content.title}
            </h1>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="font-medium">{content.source}</span>
              <span>•</span>
              <span>{new Date(content.published_at).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>

            {/* 태그 */}
            {content.tags && content.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {content.tags.map((tag, idx) => (
                  <span key={idx} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* AI 요약 */}
          {content.ai_summary && (
            <div className="px-8 py-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h2 className="text-lg font-bold text-purple-900">AI 통합 요약</h2>
              </div>
              <p className="text-gray-800 leading-relaxed">
                {content.ai_summary}
              </p>
            </div>
          )}

          {/* 핵심 포인트 */}
          {content.key_points && content.key_points.length > 0 && (
            <div className="px-8 py-6 bg-blue-50 border-b">
              <h2 className="text-lg font-bold text-blue-900 mb-3">✓ 핵심 포인트</h2>
              <ul className="space-y-2">
                {content.key_points.map((point, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      {idx + 1}
                    </span>
                    <span className="text-blue-900 pt-0.5">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 본문 */}
          <div className="px-8 py-8">
            <div className="prose prose-lg max-w-none">
              {content.full_content ? (
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {content.full_content}
                </div>
              ) : (
                <p className="text-gray-600">{content.summary}</p>
              )}
            </div>
          </div>

          {/* 출처 링크 */}
          {content.source_urls && content.source_urls.length > 0 && (
            <div className="px-8 py-6 bg-gray-50 border-t">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                📎 원본 출처 ({content.source_urls.length}개)
              </h2>
              <div className="space-y-2">
                {content.source_urls.map((url, idx) => (
                  <div key={idx} className="flex items-start">
                    <span className="text-gray-500 mr-3">{idx + 1}.</span>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                    >
                      {url}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 단일 출처 URL */}
          {content.source_url && (!content.source_urls || content.source_urls.length === 0) && (
            <div className="px-8 py-6 bg-gray-50 border-t">
              <h2 className="text-lg font-bold text-gray-900 mb-3">📎 원본 출처</h2>
              <a
                href={content.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline break-all"
              >
                {content.source_url}
              </a>
            </div>
          )}
        </article>

        {/* 목록으로 버튼 */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            목록으로 돌아가기
          </button>
        </div>
      </main>
    </div>
  );
}
