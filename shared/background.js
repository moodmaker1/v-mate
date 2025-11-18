/**
 * shared/background.js
 * 통합 백그라운드 스크립트 - 모든 모듈의 메시지를 라우팅합니다.
 */

// config.js와 gpt-api.js 로드
try {
  importScripts('../config.js');
  console.log('config.js 로드 완료');
} catch (e) {
  console.warn('config.js 파일을 찾을 수 없습니다.');
}

try {
  importScripts('gpt-api.js');
  console.log('gpt-api.js 로드 완료');
} catch (e) {
  console.error('gpt-api.js 로드 실패:', e);
}

console.log('v-mate shared background service worker loaded');

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

