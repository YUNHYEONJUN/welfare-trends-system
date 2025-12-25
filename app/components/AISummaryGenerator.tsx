"use client";

import { useState } from 'react';

interface AISummaryGeneratorProps {
  content: string;
  onSummaryGenerated?: (summary: string) => void;
}

export default function AISummaryGenerator({ content, onSummaryGenerated }: AISummaryGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');

  const generateSummary = async () => {
    setLoading(true);
    setError('');
    
    try {
      // 서버 API 호출
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      const data = await response.json();

      if (data.fallback) {
        // Fallback 요약 사용
        setSummary(data.summary);
        if (onSummaryGenerated) onSummaryGenerated(data.summary);
        return;
      }

      if (data.useClient) {
        // 클라이언트에서 직접 GenSpark API 호출
        const aiResponse = await fetch(`${data.config.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.config.apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-5',
            messages: [
              {
                role: 'system',
                content: '당신은 사회복지 분야 전문가입니다. 복지 정책 및 학술 자료를 간결하고 명확하게 요약하는 역할을 합니다.',
              },
              {
                role: 'user',
                content: `다음 내용을 3-4문장으로 요약해주세요. 핵심 내용과 중요한 정책 사항을 중심으로 정리해주세요:\n\n${content}`,
              },
            ],
            max_tokens: 500,
            temperature: 0.7,
          }),
        });

        if (!aiResponse.ok) {
          throw new Error('AI 요약 생성 실패');
        }

        const aiData = await aiResponse.json();
        const generatedSummary = aiData.choices[0]?.message?.content || '';
        
        setSummary(generatedSummary);
        if (onSummaryGenerated) onSummaryGenerated(generatedSummary);
      }

    } catch (err) {
      console.error('요약 생성 오류:', err);
      setError('요약 생성에 실패했습니다. 기본 요약을 사용합니다.');
      
      // Fallback
      const sentences = content.split(/[.!?]\s+/).filter(s => s.trim().length > 0);
      const fallbackSummary = sentences.slice(0, 3).join('. ') + '.';
      setSummary(fallbackSummary);
      if (onSummaryGenerated) onSummaryGenerated(fallbackSummary);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">AI 요약 생성</h3>
        <button
          onClick={generateSummary}
          disabled={loading}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            loading
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              생성 중...
            </span>
          ) : (
            '✨ AI 요약 생성'
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
          {error}
        </div>
      )}

      {summary && (
        <div className="space-y-3">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2 font-medium">원본 텍스트:</p>
            <p className="text-sm text-gray-700 line-clamp-3">{content}</p>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-600 mb-2 font-medium">✨ AI 요약:</p>
            <p className="text-gray-900">{summary}</p>
          </div>
        </div>
      )}

      {!summary && !loading && (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <p>버튼을 클릭하여 AI 요약을 생성하세요</p>
        </div>
      )}
    </div>
  );
}
