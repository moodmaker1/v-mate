/**
 * background.js
 * 역할: 백그라운드에서 실행되며 API 통신을 담당합니다.
 * 
 * 주요 기능:
 * - content.js로부터 메시지 수신
 * - OpenAI GPT API 호출
 * - API 응답을 content.js로 전달
 */

// config.js 파일 로드 (API 키 설정)
try {
  importScripts('config.js');
} catch (e) {
  console.warn('config.js 파일을 찾을 수 없습니다. Chrome Storage의 API 키를 사용합니다.');
}

// OpenAI API 설정
const OPENAI_API_KEY = (typeof CONFIG !== 'undefined' && CONFIG.OPENAI_API_KEY) || 'YOUR_API_KEY_HERE';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

console.log('v-mate background service worker loaded');
console.log('API 키 소스:', OPENAI_API_KEY !== 'YOUR_API_KEY_HERE' ? 'config.js' : 'Chrome Storage');

/**
 * Step 3: GPT API 연동
 * OpenAI GPT API를 호출하여 텍스트 설명을 생성합니다.
 */
async function callGPTAPI(selectedText, pageTitle, pageUrl) {
  try {
    // storage에서 API 키 가져오기
    const result = await chrome.storage.local.get(['openaiApiKey']);
    const apiKey = result.openaiApiKey || OPENAI_API_KEY;
    
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
      throw new Error('API 키가 설정되지 않았습니다. 확장 프로그램 팝업에서 API 키를 설정해주세요.');
    }
    
    // GPT 프롬프트 구성
    const systemPrompt = '당신은 대학생의 학습을 돕는 AI 도우미입니다. 전문 용어는 쉽게 풀어서 설명하고, 구체적인 예시를 포함하여 3-5줄로 간결하게 설명해주세요.';
    
    const userPrompt = `페이지: ${pageTitle}
URL: ${pageUrl}
선택된 텍스트: "${selectedText}"

이 텍스트를 현재 페이지의 맥락에 맞춰 쉽고 명확하게 설명해주세요.`;
    
    console.log('GPT API 호출 중...');
    console.log('프롬프트:', userPrompt);
    
    // API 호출
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 200,
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API 오류: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    const explanation = data.choices[0].message.content.trim();
    
    console.log('GPT 응답:', explanation);
    
    return {
      success: true,
      explanation: explanation
    };
    
  } catch (error) {
    console.error('GPT API 호출 실패:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Step 2 & 3: 메시지 통신 및 GPT API 호출
 * content.js로부터 메시지를 수신하고 GPT API를 호출한 후 응답을 전송합니다.
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  
  // 'explain' 액션 처리
  if (request.action === 'explain') {
    console.log('설명 요청 받음:', request.data);
    
    // GPT API 호출 (비동기)
    callGPTAPI(
      request.data.selectedText,
      request.data.pageTitle,
      request.data.pageUrl
    ).then(result => {
      sendResponse(result);
    });
    
    // 비동기 응답을 위해 true 반환
    return true;
  }
  
  return true;
});

