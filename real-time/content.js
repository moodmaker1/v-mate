/**
 * content.js
 * 역할: 웹페이지에 삽입되어 사용자의 텍스트 선택을 감지하고 UI를 표시합니다.
 * 
 * 주요 기능:
 * - 텍스트 드래그 감지
 * - 선택된 텍스트 정보 수집
 * - background.js와 메시지 통신
 * - 설명 팝업 UI 표시
 */

// 전역 변수
let currentPopup = null;
let currentIcon = null;

// 초기화
console.log('v-mate content script loaded');

/**
 * Step 1: 텍스트 드래그 감지
 * mouseup 이벤트로 텍스트 선택을 감지합니다.
 */
document.addEventListener('mouseup', (event) => {
  // 약간의 지연을 두어 선택이 완료되도록 함
  setTimeout(() => {
    handleTextSelection(event);
  }, 10);
});

/**
 * 텍스트 선택 처리 함수
 */
function handleTextSelection(event) {
  // 기존 아이콘 제거
  removeIcon();
  
  // 선택된 텍스트 가져오기
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();
  
  // 선택된 텍스트가 없거나 3글자 미만이면 무시
  if (!selectedText || selectedText.length < 3) {
    return;
  }
  
  // input, textarea 요소에서의 선택은 제외
  const targetElement = event.target;
  if (targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA') {
    return;
  }
  
  // 페이지 정보 수집
  const pageInfo = {
    selectedText: selectedText,
    pageTitle: document.title,
    pageUrl: window.location.href
  };
  
  // 콘솔에 출력하여 테스트
  console.log('=== v-mate 텍스트 선택 감지 ===');
  console.log('선택된 텍스트:', pageInfo.selectedText);
  console.log('페이지 제목:', pageInfo.pageTitle);
  console.log('URL:', pageInfo.pageUrl);
  console.log('==============================');
  
  // 선택 영역의 위치 정보
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  
  console.log('선택 영역 위치:', {
    top: rect.top,
    left: rect.left,
    bottom: rect.bottom,
    right: rect.right
  });
  
  // Step 5: 아이콘 표시 (바로 팝업 대신)
  showIcon(rect, pageInfo);
}

/**
 * Step 2: 메시지 통신
 * background.js로 설명 요청 메시지를 전송합니다.
 */
function sendExplanationRequest(pageInfo, rect) {
  console.log('background.js로 메시지 전송 중...');
  
  // Step 4: 로딩 팝업 표시
  showPopup('loading');
  
  // 메시지 데이터 구조
  const message = {
    action: 'explain',
    data: {
      selectedText: pageInfo.selectedText,
      pageTitle: pageInfo.pageTitle,
      pageUrl: pageInfo.pageUrl
    }
  };
  
  // background.js로 메시지 전송
  chrome.runtime.sendMessage(message, (response) => {
    if (chrome.runtime.lastError) {
      console.error('메시지 전송 오류:', chrome.runtime.lastError);
      showPopup('error', '메시지 전송에 실패했습니다.');
      return;
    }
    
    console.log('background.js로부터 응답 받음:', response);
    
    if (response && response.success) {
      console.log('설명:', response.explanation);
      // Step 4: 설명 팝업 표시
      showPopup('success', response.explanation);
    } else {
      console.error('설명 생성 실패:', response?.error);
      showPopup('error', response?.error || '설명 생성에 실패했습니다.');
    }
  });
}

/**
 * Step 4: 팝업 UI 표시
 * @param {string} type - 'loading', 'success', 'error'
 * @param {string} content - 표시할 내용 (success, error일 때)
 */
function showPopup(type, content = '') {
  // 기존 팝업 제거
  closePopup();
  
  // 오버레이 생성
  const overlay = document.createElement('div');
  overlay.className = 'vmate-overlay';
  overlay.addEventListener('click', closePopup);
  
  // 팝업 컨테이너 생성
  const popup = document.createElement('div');
  popup.className = 'vmate-popup';
  
  // 헤더
  const header = document.createElement('div');
  header.className = 'vmate-popup-header';
  header.textContent = 'v-mate';
  
  // 닫기 버튼
  const closeBtn = document.createElement('button');
  closeBtn.className = 'vmate-popup-close';
  closeBtn.innerHTML = '×';
  closeBtn.addEventListener('click', closePopup);
  header.appendChild(closeBtn);
  
  // 컨텐츠
  const contentDiv = document.createElement('div');
  contentDiv.className = 'vmate-popup-content';
  
  if (type === 'loading') {
    const loading = document.createElement('div');
    loading.className = 'vmate-loading';
    loading.innerHTML = `
      <div class="vmate-loading-spinner"></div>
      <div class="vmate-loading-text">AI가 설명을 생성하고 있습니다...</div>
    `;
    contentDiv.appendChild(loading);
  } else if (type === 'success') {
    const explanation = document.createElement('div');
    explanation.className = 'vmate-explanation';
    explanation.textContent = content;
    contentDiv.appendChild(explanation);
  } else if (type === 'error') {
    const error = document.createElement('div');
    error.className = 'vmate-error';
    error.textContent = content;
    contentDiv.appendChild(error);
  }
  
  popup.appendChild(header);
  popup.appendChild(contentDiv);
  
  // DOM에 추가
  document.body.appendChild(overlay);
  document.body.appendChild(popup);
  
  // 전역 변수에 저장
  currentPopup = { overlay, popup };
}

/**
 * 팝업 닫기
 */
function closePopup() {
  if (currentPopup) {
    currentPopup.overlay?.remove();
    currentPopup.popup?.remove();
    currentPopup = null;
  }
}

/**
 * ESC 키로 팝업 닫기
 */
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closePopup();
    removeIcon();
  }
});

/**
 * Step 5: 아이콘 버튼 표시
 * 드래그한 텍스트 위치에 💡 아이콘을 표시합니다.
 */
function showIcon(rect, pageInfo) {
  // 기존 아이콘 제거
  removeIcon();
  
  // 아이콘 버튼 생성
  const icon = document.createElement('div');
  icon.className = 'vmate-icon-button';
  
  // 툴팁 추가
  const tooltip = document.createElement('div');
  tooltip.className = 'vmate-tooltip';
  tooltip.textContent = '설명 보기';
  icon.appendChild(tooltip);
  
  // 위치 계산 (선택 영역 오른쪽 상단)
  const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
  const scrollY = window.pageYOffset || document.documentElement.scrollTop;
  
  icon.style.left = `${rect.right + scrollX + 5}px`;
  icon.style.top = `${rect.top + scrollY - 5}px`;
  
  // 클릭 이벤트: 설명 요청
  icon.addEventListener('click', (e) => {
    e.stopPropagation();
    removeIcon();
    sendExplanationRequest(pageInfo, rect);
  });
  
  // DOM에 추가
  document.body.appendChild(icon);
  
  // 전역 변수에 저장
  currentIcon = icon;
}

/**
 * 아이콘 제거
 */
function removeIcon() {
  if (currentIcon) {
    currentIcon.remove();
    currentIcon = null;
  }
}

/**
 * 다른 곳 클릭 시 아이콘 제거
 */
document.addEventListener('mousedown', (event) => {
  // 아이콘이나 팝업을 클릭한 게 아니면 아이콘 제거
  if (currentIcon && !event.target.closest('.vmate-icon-button')) {
    removeIcon();
  }
});

