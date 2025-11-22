/**
 * shared/background.js
 * 통합 백그라운드 스크립트 - 모든 모듈의 메시지를 라우팅합니다.
 */

// ========================================
// Service Worker 초기화
// ========================================
// 참고: config.js는 popup.html에서 로드됩니다 (보안상 안전)
// Service Worker는 Chrome Storage에서만 API 키를 읽습니다

chrome.runtime.onInstalled.addListener(() => {
  console.log('✅ v-mate 설치/업데이트 완료 - 팝업을 열어서 config.js를 자동 로드하세요');
});

// ========================================
// GPT API 함수 (gpt-api.js 내용을 직접 포함)
// ========================================
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * GPT API 호출 공통 함수
 */
async function callGPTAPI(systemPrompt, userPrompt, options = {}) {
  try {
    // Chrome Storage에서 API 키 가져오기
    const result = await chrome.storage.local.get(['openaiApiKey']);
    const apiKey = result.openaiApiKey;
    
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
      throw new Error('API 키가 설정되지 않았습니다. 확장 프로그램 팝업에서 API 키를 설정해주세요.');
    }
    
    // 기본 옵션
    const defaultOptions = {
      model: 'gpt-4o-mini',
      max_tokens: 200,
      temperature: 0.7
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    console.log('💬 GPT API 호출 중...');
    
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
    
    console.log('✅ GPT 응답 완료');
    
    return {
      success: true,
      content: content
    };
    
  } catch (error) {
    console.error('❌ GPT API 호출 실패:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

console.log('✅ v-mate background service worker loaded');

/**
 * 메시지 라우터
 * action 형식: 'module:method' (예: 'real-time:explain', 'quiz:generate')
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  
  const action = request.action || '';
  const [module, method] = action.split(':');
  
  // real-time 모듈
  if (module === 'real-time' || action === 'explain') {
    handleRealTime(method || action, request.data)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  // quiz 모듈
  if (module === 'quiz') {
    handleQuiz(method, request.data)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  // notion 모듈
  if (module === 'notion') {
    handleNotion(method, request.data)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  // notion-save 액션 (Content Script에서 직접 호출)
  if (action === 'notion-save') {
    handleNotionSave(request.data)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  // 알 수 없는 액션
  console.warn('Unknown action:', action);
  sendResponse({ success: false, error: 'Unknown action' });
  return true;
});

/**
 * real-time 모듈 핸들러
 */
async function handleRealTime(method, data) {
  if (method === 'explain') {
    return await generateExplanation(data);
  }
  throw new Error('Unknown real-time method: ' + method);
}

/**
 * quiz 모듈 핸들러
 */
async function handleQuiz(method, data) {
  if (method === 'generate') {
    return await generateQuiz(data);
  }
  else if (method === 'grade') {
    return await gradeSubjective(data);
  }
  throw new Error('Unknown quiz method: ' + method);
}

/**
 * 실시간 설명 생성
 */
async function generateExplanation(data) {
  const { selectedText, pageTitle, pageUrl } = data;
  
  const systemPrompt = '당신은 대학생의 학습을 돕는 AI 도우미입니다. 전문 용어는 쉽게 풀어서 설명하고, 구체적인 예시를 포함하여 3-5줄로 간결하게 설명해주세요.';
  
  const userPrompt = `페이지: ${pageTitle}
URL: ${pageUrl}
선택된 텍스트: "${selectedText}"

이 텍스트를 현재 페이지의 맥락에 맞춰 쉽고 명확하게 설명해주세요.`;
  
  const result = await callGPTAPI(systemPrompt, userPrompt);
  
  if (result.success) {
    return {
      success: true,
      explanation: result.content
    };
  } else {
    return result;
  }
}

/**
 * 퀴즈 생성
 */
async function generateQuiz(data) {
  const { selectedText, pageTitle, pageUrl, quizType } = data;
  
  let systemPrompt = '당신은 교육용 퀴즈를 만드는 전문가입니다.';
  let userPrompt = '';
  
  // 퀴즈 타입별 프롬프트
  if (quizType === 'ox') {
    userPrompt = `다음 내용으로 OX 퀴즈 1개를 만들어주세요:

내용: "${selectedText}"
페이지: ${pageTitle}

형식:
문제: [참/거짓을 판단할 명확한 진술]
정답: O 또는 X
해설: [왜 그런지 간단히]`;
  }
  else if (quizType === 'multiple-choice') {
    userPrompt = `다음 내용으로 4지선다 퀴즈 1개를 만들어주세요:

내용: "${selectedText}"
페이지: ${pageTitle}

형식:
질문: [명확한 질문]
1) [보기1]
2) [보기2]
3) [보기3]
4) [보기4]
정답: [번호]
해설: [설명]`;
  }
  else if (quizType === 'subjective') {
    userPrompt = `다음 내용으로 주관식 문제 1개를 만들어주세요:

내용: "${selectedText}"
페이지: ${pageTitle}

형식:
문제: [서술형 질문]
모범답안: [핵심 키워드 포함한 답]
채점기준: [반드시 포함되어야 할 키워드 3개, 콤마로 구분]`;
  }
  
  const result = await callGPTAPI(systemPrompt, userPrompt, { max_tokens: 300 });
  
  if (result.success) {
    // 퀴즈 데이터 파싱
    const quiz = parseQuizResponse(result.content, quizType);
    return {
      success: true,
      quiz: quiz,
      rawContent: result.content
    };
  } else {
    return result;
  }
}

/**
 * 퀴즈 응답 파싱
 */
function parseQuizResponse(content, quizType) {
  // 간단한 파싱 (추후 개선 가능)
  return {
    type: quizType,
    rawContent: content,
    // 실제 파싱 로직은 클라이언트에서 처리
  };
}

/**
 * 주관식 채점
 */
async function gradeSubjective(data) {
  const { userAnswer, correctAnswer, keywords, question } = data;
  
  const systemPrompt = '당신은 공정한 채점자입니다.';
  const userPrompt = `다음 답안을 채점해주세요:

문제: ${question}
학생 답안: ${userAnswer}
모범 답안: ${correctAnswer}
필수 키워드: ${keywords.join(', ')}

채점 기준:
- 필수 키워드 포함 여부
- 내용의 정확성
- 논리적 서술

형식:
점수: [0-100]
평가: [잘한 점과 보완할 점]`;
  
  const result = await callGPTAPI(systemPrompt, userPrompt);
  
  if (result.success) {
    return {
      success: true,
      grading: result.content
    };
  } else {
    return result;
  }
}

/**
 * notion 모듈 핸들러
 */
async function handleNotion(method, data) {
  if (method === 'classify-subject') {
    return await classifySubject(data);
  }
  throw new Error('Unknown notion method: ' + method);
}

/**
 * Notion 저장 핸들러 (날짜별 하위 페이지 생성)
 */
async function handleNotionSave(data) {
  try {
    console.log('🔵 [Background] Notion 저장 시작');
    
    const { selectedText, pageUrl, pageTitle, timestamp } = data;
    
    // Chrome Storage에서 Notion 설정 가져오기
    const config = await chrome.storage.local.get(['notionToken', 'notionParentPageId']);
    
    console.log('🔵 [Background] Notion 설정:', {
      hasToken: !!config.notionToken,
      hasParentPageId: !!config.notionParentPageId
    });
    
    if (!config.notionToken || !config.notionParentPageId) {
      throw new Error('Notion 설정이 필요합니다. 팝업에서 Token과 상위 페이지 ID를 설정해주세요.');
    }
    
    // 날짜 및 시간 포맷팅
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const timeStr = `${hours}:${minutes}`;
    
    console.log('🔵 [Background] 날짜:', dateStr, '시간:', timeStr);
    
    // 1. 오늘 날짜 페이지 찾기 또는 생성
    const dailyPageId = await findOrCreateDailyPage(
      config.notionToken,
      config.notionParentPageId,
      dateStr
    );
    
    console.log('🔵 [Background] 날짜 페이지 ID:', dailyPageId);
    
    // 2. 날짜 페이지에 내용 추가
    const blocks = [
      {
        object: 'block',
        type: 'divider',
        divider: {}
      },
      {
        object: 'block',
        type: 'heading_3',
        heading_3: {
          rich_text: [{
            text: { content: `⏰ ${timeStr}` }
          }],
          color: 'blue'
        }
      },
      {
        object: 'block',
        type: 'quote',
        quote: {
          rich_text: [{
            text: { content: selectedText.substring(0, 2000) }
          }],
          color: 'blue_background'
        }
      },
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            { text: { content: '🔗 ' } },
            { 
              text: { 
                content: pageTitle.substring(0, 100),
                link: { url: pageUrl }
              }
            }
          ]
        }
      }
    ];
    
    console.log('🔵 [Background] 날짜 페이지에 내용 추가 중...');
    
    const response = await fetch(
      `https://api.notion.com/v1/blocks/${dailyPageId}/children`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${config.notionToken}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ children: blocks })
      }
    );
    
    console.log('🔵 [Background] Notion API 응답:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ [Background] Notion API 에러:', errorData);
      throw new Error(`Notion API 오류: ${errorData.message || response.statusText}`);
    }
    
    await response.json();
    console.log('✅ [Background] Notion 저장 완료!');
    
    return {
      success: true,
      message: '노션에 저장 완료!'
    };
    
  } catch (error) {
    console.error('❌ [Background] Notion 저장 실패:', error);
    throw error;
  }
}

/**
 * 날짜별 페이지 찾기 또는 생성
 */
async function findOrCreateDailyPage(token, parentPageId, dateStr) {
  console.log('📅 [Background] 날짜 페이지 검색 중:', dateStr);
  
  // 1. 상위 페이지의 하위 페이지들 조회
  const listResponse = await fetch(
    `https://api.notion.com/v1/blocks/${parentPageId}/children`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': '2022-06-28'
      }
    }
  );
  
  if (listResponse.ok) {
    const data = await listResponse.json();
    const targetTitle = `📅 ${dateStr}`;
    
    // 오늘 날짜 페이지 찾기
    for (const block of data.results) {
      if (block.type === 'child_page') {
        const title = block.child_page?.title || '';
        if (title === targetTitle) {
          console.log('📅 [Background] 기존 날짜 페이지 발견!');
          return block.id;
        }
      }
    }
  }
  
  // 2. 없으면 새로 생성
  console.log('📅 [Background] 새 날짜 페이지 생성 중...');
  
  const createResponse = await fetch(
    'https://api.notion.com/v1/pages',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        parent: {
          page_id: parentPageId
        },
        properties: {
          title: {
            title: [{
              text: {
                content: `📅 ${dateStr}`
              }
            }]
          }
        },
        icon: {
          type: 'emoji',
          emoji: '📚'
        }
      })
    }
  );
  
  if (!createResponse.ok) {
    const errorData = await createResponse.json();
    throw new Error(`날짜 페이지 생성 실패: ${errorData.message}`);
  }
  
  const pageData = await createResponse.json();
  console.log('📅 [Background] 새 날짜 페이지 생성 완료!');
  
  return pageData.id;
}

/**
 * AI 과목 자동 분류
 */
async function classifySubject(data) {
  const { selectedText, pageTitle, pageUrl } = data;
  
  const systemPrompt = '당신은 학습 내용을 과목별로 분류하는 전문가입니다.';
  
  const userPrompt = `다음 텍스트가 어떤 과목/분야에 해당하는지 **한 단어로만** 답해줘.

📖 페이지 정보:
- 제목: ${pageTitle}
- URL: ${pageUrl}

📝 선택한 텍스트:
${selectedText.substring(0, 300)}${selectedText.length > 300 ? '...' : ''}

과목 예시:
- 컴퓨터: 프로그래밍, 데이터베이스, 알고리즘, 운영체제, 네트워크, 웹개발, 자료구조
- 수학: 미적분학, 선형대수, 통계학, 이산수학
- 언어: 영어, 일본어, 중국어
- 기타: 경제학, 물리학, 화학, 생물학, 심리학 등

**규칙:**
1. 반드시 **한 단어**로만 답할 것 (예: "데이터베이스", "영어")
2. 학문 분야를 구체적으로 (예: "컴퓨터" 대신 "데이터베이스")
3. 한글로 답할 것
4. 추가 설명 없이 과목명만

과목명:`;
  
  const result = await callGPTAPI(systemPrompt, userPrompt, { max_tokens: 20 });
  
  if (result.success) {
    // 응답에서 과목명만 추출 (공백 제거)
    const subject = result.content.trim();
    return {
      success: true,
      subject: subject
    };
  } else {
    return result;
  }
}

