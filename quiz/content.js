/**
 * quiz/content.js
 * 스마트 퀴즈 생성기 - 텍스트 드래그 시 퀴즈 생성
 */

// 전역 변수 (quiz 네임스페이스)
let quizCurrentTypeSelector = null;
let quizCurrentQuizPopup = null;
let quizCurrentIcon = null;
let isQuizMode = false;
let quizSelectedTextData = null;

// 초기화 - 모드 확인
chrome.storage.local.get(['currentMode'], (result) => {
  const mode = result.currentMode || 'real-time';
  isQuizMode = (mode === 'quiz');
  
  if (isQuizMode) {
    console.log('v-mate quiz mode activated ❓');
    initQuizMode();
  }
});

// 모드 변경 감지
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.currentMode) {
    const newMode = changes.currentMode.newValue;
    isQuizMode = (newMode === 'quiz');
    
    if (isQuizMode) {
      console.log('Switched to quiz mode ❓');
      initQuizMode();
    } else {
      console.log('Quiz mode deactivated');
      quizRemoveIcon();
      quizCloseTypeSelector();
      quizCloseQuizPopup();
    }
  }
});

/**
 * 퀴즈 모드 초기화
 */
function initQuizMode() {
  // 중복 방지
  if (document.vmateQuizInitialized) return;
  document.vmateQuizInitialized = true;
  
  // 이벤트 리스너
  document.addEventListener('mouseup', quizHandleTextSelection);
  document.addEventListener('keydown', quizHandleEscKey);
  document.addEventListener('mousedown', quizHandleOutsideClick);
}

/**
 * 텍스트 선택 처리
 */
function quizHandleTextSelection(event) {
  if (!isQuizMode) return;
  
  setTimeout(() => {
    quizRemoveIcon();
    
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    if (!selectedText || selectedText.length < 3) {
      return;
    }
    
    const targetElement = event.target;
    if (targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA') {
      return;
    }
    
    // 페이지 정보 저장
    quizSelectedTextData = {
      selectedText: selectedText,
      pageTitle: document.title,
      pageUrl: window.location.href
    };
    
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    // ❓ 아이콘 표시
    quizShowIcon(rect);
  }, 10);
}

/**
 * ❓ 아이콘 표시
 */
function quizShowIcon(rect) {
  quizRemoveIcon();
  
  const icon = document.createElement('div');
  icon.className = 'vmate-quiz-icon';
  
  const tooltip = document.createElement('div');
  tooltip.className = 'vmate-quiz-tooltip';
  tooltip.textContent = '퀴즈 만들기';
  icon.appendChild(tooltip);
  
  const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
  const scrollY = window.pageYOffset || document.documentElement.scrollTop;
  
  icon.style.left = `${rect.right + scrollX + 5}px`;
  icon.style.top = `${rect.top + scrollY - 5}px`;
  
  icon.addEventListener('click', (e) => {
    e.stopPropagation();
    quizRemoveIcon();
    quizShowQuizTypeSelector();
  });
  
  document.body.appendChild(icon);
  quizCurrentIcon = icon;
}

/**
 * 퀴즈 타입 선택 팝업 표시
 */
function quizShowQuizTypeSelector() {
  quizCloseTypeSelector();
  
  // 오버레이
  const overlay = document.createElement('div');
  overlay.className = 'vmate-quiz-overlay';
  overlay.addEventListener('click', quizCloseTypeSelector);
  
  // 선택 팝업
  const selector = document.createElement('div');
  selector.className = 'vmate-quiz-type-selector';
  
  // 헤더
  const header = document.createElement('div');
  header.className = 'vmate-quiz-selector-header';
  header.textContent = '❓ 퀴즈 유형 선택';
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'vmate-quiz-selector-close';
  closeBtn.innerHTML = '×';
  closeBtn.addEventListener('click', quizCloseTypeSelector);
  header.appendChild(closeBtn);
  
  // 타입 옵션들
  const content = document.createElement('div');
  content.className = 'vmate-quiz-selector-content';
  
  // OX 퀴즈
  const oxOption = createTypeOption(
    '⭕',
    'OX 퀴즈',
    '참/거짓 판단 문제',
    'ox'
  );
  
  // 객관식
  const mcOption = createTypeOption(
    '📝',
    '객관식 (4지선다)',
    '4개 보기 중 정답 선택',
    'multiple-choice'
  );
  
  // 서술형
  const subOption = createTypeOption(
    '✏️',
    '서술형',
    '직접 답 작성하기',
    'subjective'
  );
  
  content.appendChild(oxOption);
  content.appendChild(mcOption);
  content.appendChild(subOption);
  
  selector.appendChild(header);
  selector.appendChild(content);
  
  document.body.appendChild(overlay);
  document.body.appendChild(selector);
  
  quizCurrentTypeSelector = { overlay, selector };
}

/**
 * 타입 옵션 생성
 */
function createTypeOption(icon, title, description, quizType) {
  const option = document.createElement('div');
  option.className = 'vmate-quiz-type-option';
  
  option.innerHTML = `
    <div class="vmate-quiz-type-icon">${icon}</div>
    <div class="vmate-quiz-type-info">
      <h3>${title}</h3>
      <p>${description}</p>
    </div>
  `;
  
  option.addEventListener('click', () => {
    quizCloseTypeSelector();
    quizGenerateQuiz(quizType);
  });
  
  return option;
}

/**
 * 퀴즈 생성 요청
 */
function quizGenerateQuiz(quizType) {
  console.log(`Generating ${quizType} quiz...`);
  
  // 로딩 팝업
  quizShowQuizPopup('loading', quizType);
  
  // 메시지 전송
  chrome.runtime.sendMessage({
    action: 'quiz:generate',
    data: {
      ...quizSelectedTextData,
      quizType: quizType
    }
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Message error:', chrome.runtime.lastError);
      quizShowQuizPopup('error', quizType, '메시지 전송에 실패했습니다.\n페이지를 새로고침(F5)해주세요.');
      return;
    }
    
    if (response && response.success) {
      quizShowQuizPopup('quiz', quizType, response.rawContent);
    } else {
      quizShowQuizPopup('error', quizType, response?.error || '퀴즈 생성에 실패했습니다.');
    }
  });
}

/**
 * 퀴즈 팝업 표시
 * @param {string} type - 'loading', 'quiz', 'error'
 * @param {string} quizType - 'ox', 'multiple-choice', 'subjective'
 * @param {string} content - 퀴즈 내용 또는 에러 메시지
 */
function quizShowQuizPopup(type, quizType, content = '') {
  quizCloseQuizPopup();
  
  const overlay = document.createElement('div');
  overlay.className = 'vmate-quiz-overlay';
  overlay.addEventListener('click', quizCloseQuizPopup);
  
  const popup = document.createElement('div');
  popup.className = 'vmate-quiz-popup';
  
  // 헤더
  const header = document.createElement('div');
  header.className = 'vmate-quiz-popup-header';
  
  const typeNames = {
    'ox': '⭕ OX 퀴즈',
    'multiple-choice': '📝 객관식',
    'subjective': '✏️ 서술형'
  };
  
  header.textContent = typeNames[quizType] || '❓ 퀴즈';
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'vmate-quiz-popup-close';
  closeBtn.innerHTML = '×';
  closeBtn.addEventListener('click', quizCloseQuizPopup);
  header.appendChild(closeBtn);
  
  // 컨텐츠
  const contentDiv = document.createElement('div');
  contentDiv.className = 'vmate-quiz-popup-content';
  
  if (type === 'loading') {
    contentDiv.innerHTML = `
      <div class="vmate-quiz-loading">
        <div class="vmate-quiz-spinner"></div>
        <div class="vmate-quiz-loading-text">AI가 퀴즈를 생성하고 있습니다...</div>
      </div>
    `;
  } else if (type === 'quiz') {
    // 퀴즈 타입별 UI 생성
    let quizUI;
    if (quizType === 'ox') {
      quizUI = createOXQuizUI(null, content);
    } else if (quizType === 'multiple-choice') {
      quizUI = createMultipleChoiceQuizUI(null, content);
    } else if (quizType === 'subjective') {
      quizUI = createSubjectiveQuizUI(null, content);
    } else {
      // 기본: 텍스트로 표시
      quizUI = document.createElement('div');
      quizUI.className = 'vmate-quiz-content';
      quizUI.innerHTML = `<pre>${content}</pre>`;
    }
    contentDiv.appendChild(quizUI);
  } else if (type === 'error') {
    const error = document.createElement('div');
    error.className = 'vmate-quiz-error';
    error.textContent = content;
    contentDiv.appendChild(error);
  }
  
  popup.appendChild(header);
  popup.appendChild(contentDiv);
  
  document.body.appendChild(overlay);
  document.body.appendChild(popup);
  
  quizCurrentQuizPopup = { overlay, popup };
}

/**
 * 팝업/선택창 닫기
 */
function quizCloseTypeSelector() {
  if (quizCurrentTypeSelector) {
    quizCurrentTypeSelector.overlay?.remove();
    quizCurrentTypeSelector.selector?.remove();
    quizCurrentTypeSelector = null;
  }
}

function quizCloseQuizPopup() {
  if (quizCurrentQuizPopup) {
    quizCurrentQuizPopup.overlay?.remove();
    quizCurrentQuizPopup.popup?.remove();
    quizCurrentQuizPopup = null;
  }
  
  // 오디오 재생 중이면 정지
  if (typeof stopCurrentAudio === 'function') {
    stopCurrentAudio();
  }
}

function quizRemoveIcon() {
  if (quizCurrentIcon) {
    quizCurrentIcon.remove();
    quizCurrentIcon = null;
  }
}

/**
 * 키보드/클릭 이벤트
 */
function quizHandleEscKey(event) {
  if (!isQuizMode) return;
  
  if (event.key === 'Escape') {
    quizCloseTypeSelector();
    quizCloseQuizPopup();
    quizRemoveIcon();
  }
}

function quizHandleOutsideClick(event) {
  if (!isQuizMode) return;
  
  if (quizCurrentIcon && !event.target.closest('.vmate-quiz-icon')) {
    quizRemoveIcon();
  }
}

