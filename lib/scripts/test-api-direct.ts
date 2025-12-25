#!/usr/bin/env node

/**
 * GenSpark API 직접 테스트
 */

import { getOpenAIConfig } from '../genspark-config';

async function testDirectAPI() {
  console.log('🔍 GenSpark API 직접 테스트...\n');

  const config = getOpenAIConfig();
  
  console.log('설정 정보:');
  console.log('- API Key:', config.apiKey.substring(0, 20) + '...');
  console.log('- Base URL:', config.baseURL);
  console.log();

  try {
    console.log('API 호출 중...');
    
    const response = await fetch(`${config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-5',
        messages: [
          {
            role: 'user',
            content: '안녕하세요! 간단하게 "테스트 성공"이라고만 답변해주세요.',
          },
        ],
        max_tokens: 50,
      }),
    });

    console.log('응답 상태:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 오류 응답:', errorText);
      return;
    }

    const data = await response.json();
    console.log('\n✅ API 응답 성공!');
    console.log('응답 내용:', data.choices[0]?.message?.content);

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

testDirectAPI();
