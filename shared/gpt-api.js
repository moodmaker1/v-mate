/**
 * shared/gpt-api.js
 * GPT API 공통 함수
 */

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * GPT API 호출 공통 함수
 * @param {string} systemPrompt - 시스템 프롬프트
 * @param {string} userPrompt - 사용자 프롬프트
 * @param {object} options - 추가 옵션 (model, max_tokens, temperature)
 * @returns {Promise} GPT 응답
 */
async function callGPTAPI(systemPrompt, userPrompt, options = {}) {
  try {
    // API 키 가져오기
    let apiKey;
    
    // config.js에서 먼저 시도
    if (typeof CONFIG !== 'undefined' && CONFIG.OPENAI_API_KEY) {
      apiKey = CONFIG.OPENAI_API_KEY;
    }
    
    // Chrome Storage에서 가져오기
    const result = await chrome.storage.local.get(['openaiApiKey']);
    if (result.openaiApiKey) {
      apiKey = result.openaiApiKey;
    }
    
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
      throw new Error('API 키가 설정되지 않았습니다. 확장 프로그램에서 API 키를 설정해주세요.');
    }
    
    // 기본 옵션
    const defaultOptions = {
      model: 'gpt-4o-mini',
      max_tokens: 200,
      temperature: 0.7
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    console.log('GPT API 호출 중...');
    
    // API 호출
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: finalOptions.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: finalOptions.max_tokens,
        temperature: finalOptions.temperature
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API 오류: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    
    console.log('GPT 응답 완료');
    
    return {
      success: true,
      content: content
    };
    
  } catch (error) {
    console.error('GPT API 호출 실패:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

