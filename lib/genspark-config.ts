import fs from 'fs';
import path from 'path';
import os from 'os';

interface GenSparkConfig {
  openai?: {
    api_key?: string;
    base_url?: string;
  };
}

/**
 * GenSpark LLM 설정 로드
 * ~/.genspark_llm.yaml 파일에서 설정을 읽어옵니다
 */
export function loadGenSparkConfig(): GenSparkConfig | null {
  try {
    const configPath = path.join(os.homedir(), '.genspark_llm.yaml');
    
    if (!fs.existsSync(configPath)) {
      console.log('GenSpark 설정 파일이 없습니다. 환경 변수를 사용합니다.');
      return null;
    }

    // 간단한 YAML 파싱 (js-yaml 대신 수동 파싱)
    const fileContents = fs.readFileSync(configPath, 'utf8');
    const lines = fileContents.split('\n');
    
    const config: GenSparkConfig = { openai: {} };
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.includes('api_key:')) {
        config.openai!.api_key = trimmed.split('api_key:')[1].trim();
      }
      if (trimmed.includes('base_url:')) {
        config.openai!.base_url = trimmed.split('base_url:')[1].trim();
      }
    }

    return config;
  } catch (error) {
    console.error('GenSpark 설정 로드 실패:', error);
    return null;
  }
}

/**
 * OpenAI API 설정 가져오기
 * GenSpark 설정 또는 환경 변수에서 가져옵니다
 */
export function getOpenAIConfig(): {
  apiKey: string;
  baseURL: string;
} {
  const config = loadGenSparkConfig();
  
  return {
    apiKey: config?.openai?.api_key || process.env.OPENAI_API_KEY || '',
    baseURL: config?.openai?.base_url || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  };
}
