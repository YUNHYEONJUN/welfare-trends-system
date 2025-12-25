import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

// GenSpark 설정 읽기
function getGenSparkConfig() {
  try {
    const configPath = path.join(os.homedir(), '.genspark_llm.yaml');
    if (!fs.existsSync(configPath)) {
      return null;
    }
    
    const fileContents = fs.readFileSync(configPath, 'utf8');
    const lines = fileContents.split('\n');
    
    let apiKey = '';
    let baseUrl = '';
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.includes('api_key:')) {
        apiKey = trimmed.split('api_key:')[1].trim();
      }
      if (trimmed.includes('base_url:')) {
        baseUrl = trimmed.split('base_url:')[1].trim();
      }
    }
    
    return { apiKey, baseUrl };
  } catch (error) {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();
    
    if (!content) {
      return NextResponse.json(
        { error: '콘텐츠가 필요합니다' },
        { status: 400 }
      );
    }

    // GenSpark 설정 가져오기
    const config = getGenSparkConfig();
    
    if (!config || !config.apiKey) {
      // Fallback: 간단한 요약
      const sentences = content.split(/[.!?]\s+/).filter((s: string) => s.trim().length > 0);
      const summary = sentences.slice(0, 3).join('. ') + '.';
      
      return NextResponse.json({
        summary,
        fallback: true,
        message: 'AI 없이 기본 요약 사용'
      });
    }

    // GenSpark API 호출 (서버에서는 작동하지 않을 수 있음)
    // 브라우저에서 호출하도록 클라이언트로 전달
    return NextResponse.json({
      useClient: true,
      config: {
        apiKey: config.apiKey,
        baseUrl: config.baseUrl,
      },
      content,
    });

  } catch (error) {
    console.error('요약 API 오류:', error);
    return NextResponse.json(
      { error: '요약 생성 실패' },
      { status: 500 }
    );
  }
}
