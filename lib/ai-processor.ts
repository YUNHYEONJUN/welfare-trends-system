import { Content } from './types';

export interface AIProcessorConfig {
  apiKey?: string;
  model?: string;
}

export class AIContentProcessor {
  private apiKey: string;
  private model: string;

  constructor(config: AIProcessorConfig = {}) {
    this.apiKey = config.apiKey || process.env.OPENAI_API_KEY || '';
    this.model = config.model || 'gpt-4';
  }

  /**
   * 콘텐츠 요약 생성
   */
  async summarize(content: string): Promise<string> {
    if (!this.apiKey) {
      return this.fallbackSummarize(content);
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
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

      if (!response.ok) {
        throw new Error(`API 오류: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || this.fallbackSummarize(content);
    } catch (error) {
      console.error('AI 요약 오류:', error);
      return this.fallbackSummarize(content);
    }
  }

  /**
   * 에디터 의견 생성
   */
  async generateEditorNote(content: Partial<Content>): Promise<string> {
    if (!this.apiKey) {
      return '에디터 의견: 이 내용은 복지 현장에서 참고할 만한 중요한 정보입니다.';
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: '당신은 경기북서부노인보호전문기관의 복지 전문가입니다. 정책이나 연구 자료를 읽고, 현장 실무자들에게 도움이 될 수 있는 통찰과 의견을 제공합니다.',
            },
            {
              role: 'user',
              content: `제목: ${content.title}\n\n내용: ${content.summary || content.fullContent}\n\n위 내용에 대해 복지 현장 실무자의 관점에서 2-3문장의 에디터 의견을 작성해주세요. 실무에 어떻게 적용할 수 있는지, 주의할 점은 무엇인지 등을 포함해주세요.`,
            },
          ],
          max_tokens: 300,
          temperature: 0.8,
        }),
      });

      if (!response.ok) {
        throw new Error(`API 오류: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '에디터 의견: 이 내용은 복지 현장에서 참고할 만한 중요한 정보입니다.';
    } catch (error) {
      console.error('에디터 의견 생성 오류:', error);
      return '에디터 의견: 이 내용은 복지 현장에서 참고할 만한 중요한 정보입니다.';
    }
  }

  /**
   * 카테고리 자동 분류
   */
  async categorize(title: string, content: string): Promise<'academy' | 'policy' | 'thoughts'> {
    const lowerTitle = title.toLowerCase();
    const lowerContent = content.toLowerCase();

    // 키워드 기반 분류
    const policyKeywords = ['정책', '법안', '지원', '사업', '예산', '보도자료', '발표'];
    const academyKeywords = ['연구', '논문', '학술', '조사', '분석', '연구자'];
    const thoughtKeywords = ['단상', '생각', '의견', '에세이'];

    const text = `${lowerTitle} ${lowerContent}`;

    if (thoughtKeywords.some(keyword => text.includes(keyword))) {
      return 'thoughts';
    }
    
    if (academyKeywords.some(keyword => text.includes(keyword))) {
      return 'academy';
    }
    
    if (policyKeywords.some(keyword => text.includes(keyword))) {
      return 'policy';
    }

    // 기본값
    return 'policy';
  }

  /**
   * 키워드 추출
   */
  async extractKeywords(content: string): Promise<string[]> {
    if (!this.apiKey) {
      return this.fallbackExtractKeywords(content);
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: '사회복지 관련 문서에서 핵심 키워드를 추출하는 전문가입니다.',
            },
            {
              role: 'user',
              content: `다음 텍스트에서 5-7개의 핵심 키워드를 추출해주세요. 쉼표로 구분해서 답변해주세요:\n\n${content}`,
            },
          ],
          max_tokens: 100,
          temperature: 0.5,
        }),
      });

      if (!response.ok) {
        throw new Error(`API 오류: ${response.status}`);
      }

      const data = await response.json();
      const keywords = data.choices[0]?.message?.content || '';
      return keywords.split(',').map((k: string) => k.trim()).filter((k: string) => k.length > 0);
    } catch (error) {
      console.error('키워드 추출 오류:', error);
      return this.fallbackExtractKeywords(content);
    }
  }

  /**
   * Fallback 요약 (AI API 없을 때)
   */
  private fallbackSummarize(content: string): string {
    // 첫 3-4 문장 추출
    const sentences = content.split(/[.!?]\s+/).filter(s => s.trim().length > 0);
    return sentences.slice(0, 3).join('. ') + '.';
  }

  /**
   * Fallback 키워드 추출
   */
  private fallbackExtractKeywords(content: string): string[] {
    const commonKeywords = [
      '노인', '장애인', '아동', '청소년', '여성', '가족',
      '돌봄', '복지', '정책', '지원', '서비스', '교육',
      '건강', '의료', '주거', '일자리', '소득'
    ];

    return commonKeywords.filter(keyword => 
      content.includes(keyword)
    ).slice(0, 7);
  }
}

// 싱글톤 인스턴스
export const aiProcessor = new AIContentProcessor();
