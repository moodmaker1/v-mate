/**
 * real-time/content.js
 * 실시간 맥락 이해 도우미 - 텍스트 드래그 시 즉시 설명
 */

// 전역 변수 (real-time 네임스페이스)
let realTimeCurrentPopup = null;
let realTimeCurrentIcon = null;
let isRealTimeMode = false;

// 초기화 - 모드 확인
chrome.storage.local.get(['currentMode'], (result) => {
  const mode = result.currentMode || 'real-time';
  isRealTimeMode = (mode === 'real-time');
  
  if (isRealTimeMode) {
    console.log('v-mate real-time mode activated 💡');
    initRealTimeMode();
  }
});

// 모드 변경 감지
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.currentMode) {
    const newMode = changes.currentMode.newValue;
    isRealTimeMode = (newMode === 'real-time');
    
    if (isRealTimeMode) {
      console.log('Switched to real-time mode 💡');
      initRealTimeMode();
    } else {
      console.log('Real-time mode deactivated');
      realTimeRemoveIcon();
      realTimeClosePopup();
    }
  }
});

/**
 * 실시간 설명 모드 초기화
 */
function initRealTimeMode() {
  // 이미 초기화되어 있으면 중복 방지
  if (document.vmateRealTimeInitialized) return;
  document.vmateRealTimeInitialized = true;
  
  // 텍스트 선택 이벤트
  document.addEventListener('mouseup', realTimeHandleTextSelection);
  
  // ESC 키 이벤트
  document.addEventListener('keydown', realTimeHandleEscKey);
  
  // 다른 곳 클릭 이벤트
  document.addEventListener('mousedown', realTimeHandleOutsideClick);
}

/**
 * 텍스트 선택 처리
 */
function realTimeHandleTextSelection(event) {
  if (!isRealTimeMode) return;
  
  // 약간의 지연
  setTimeout(() => {
    // 기존 아이콘 제거
    realTimeRemoveIcon();
    
    // 선택된 텍스트 가져오기
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    // 3글자 미만이면 무시
    if (!selectedText || selectedText.length < 3) {
      return;
    }
    
    // input, textarea 제외
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
    
    // 선택 영역 위치
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    // 💡 아이콘 표시
    realTimeShowIcon(rect, pageInfo);
  }, 10);
}

/**
 * 💡 아이콘 표시
 */
function realTimeShowIcon(rect, pageInfo) {
  // 기존 아이콘 제거
  realTimeRemoveIcon();
  
  // 아이콘 생성
  const icon = document.createElement('div');
  icon.className = 'vmate-realtime-icon';
  
  // 툴팁
  const tooltip = document.createElement('div');
  tooltip.className = 'vmate-realtime-tooltip';
  tooltip.textContent = '설명 보기';
  icon.appendChild(tooltip);
  
  // 위치 계산
  const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
  const scrollY = window.pageYOffset || document.documentElement.scrollTop;
  
  icon.style.left = `${rect.right + scrollX + 5}px`;
  icon.style.top = `${rect.top + scrollY - 5}px`;
  
  // 클릭 이벤트
  icon.addEventListener('click', (e) => {
    e.stopPropagation();
    realTimeRemoveIcon();
    realTimeSendExplanationRequest(pageInfo);
  });
  
  // DOM에 추가
  document.body.appendChild(icon);
  realTimeCurrentIcon = icon;
}

/**
 * 설명 요청 전송
 */
function realTimeSendExplanationRequest(pageInfo) {
  console.log('Requesting explanation...');
  
  // 로딩 팝업 표시
  realTimeShowPopup('loading');
  
  // 메시지 전송
  chrome.runtime.sendMessage({
    action: 'real-time:explain',
    data: pageInfo
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Message error:', chrome.runtime.lastError);
      realTimeShowPopup('error', '메시지 전송에 실패했습니다.\n페이지를 새로고침(F5)해주세요.');
      return;
    }
    
    if (response && response.success) {
      realTimeShowPopup('success', response.explanation);
    } else {
      realTimeShowPopup('error', response?.error || '설명 생성에 실패했습니다.');
    }
  });
}

/**
 * 팝업 표시
 */
function realTimeShowPopup(type, content = '') {
  realTimeClosePopup();
  
  // 오버레이
  const overlay = document.createElement('div');
  overlay.className = 'vmate-realtime-overlay';
  overlay.addEventListener('click', realTimeClosePopup);
  
  // 팝업
  const popup = document.createElement('div');
  popup.className = 'vmate-realtime-popup';
  
  // 헤더
  const header = document.createElement('div');
  header.className = 'vmate-realtime-header';
  header.textContent = 'v-mate 💡 실시간 설명';
  
  // 닫기 버튼
  const closeBtn = document.createElement('button');
  closeBtn.className = 'vmate-realtime-close';
  closeBtn.innerHTML = '×';
  closeBtn.addEventListener('click', realTimeClosePopup);
  header.appendChild(closeBtn);
  
  // 컨텐츠
  const contentDiv = document.createElement('div');
  contentDiv.className = 'vmate-realtime-content';
  
  if (type === 'loading') {
    contentDiv.innerHTML = `
      <div class="vmate-realtime-loading">
        <div class="vmate-realtime-spinner"></div>
        <div class="vmate-realtime-loading-text">AI가 설명을 생성하고 있습니다...</div>
      </div>
    `;
  } else if (type === 'success') {
    const explanation = document.createElement('div');
    explanation.className = 'vmate-realtime-explanation';
    explanation.textContent = content;
    contentDiv.appendChild(explanation);
    
    // 🔊 음성 재생 버튼 추가
    const audioBtn = document.createElement('button');
    audioBtn.className = 'vmate-realtime-audio-btn';
    audioBtn.innerHTML = '🔊 음성으로 듣기';
    audioBtn.dataset.text = content;  // 텍스트 저장
    
    // 클릭 이벤트 (항상 playTextToSpeech 호출)
    audioBtn.addEventListener('click', function() {
      playTextToSpeech(this.dataset.text, this);
    });
    
    contentDiv.appendChild(audioBtn);
    
  } else if (type === 'error') {
    const error = document.createElement('div');
    error.className = 'vmate-realtime-error';
    error.textContent = content;
    contentDiv.appendChild(error);
  }
  
  popup.appendChild(header);
  popup.appendChild(contentDiv);
  
  document.body.appendChild(overlay);
  document.body.appendChild(popup);
  
  realTimeCurrentPopup = { overlay, popup };
}

/**
 * 팝업 닫기
 */
function realTimeClosePopup() {
  if (realTimeCurrentPopup) {
    realTimeCurrentPopup.overlay?.remove();
    realTimeCurrentPopup.popup?.remove();
    realTimeCurrentPopup = null;
  }
  
  // 오디오 재생 중이면 정지
  if (typeof stopCurrentAudio === 'function') {
    stopCurrentAudio();
  }
}

/**
 * 아이콘 제거
 */
function realTimeRemoveIcon() {
  if (realTimeCurrentIcon) {
    realTimeCurrentIcon.remove();
    realTimeCurrentIcon = null;
  }
}

/**
 * ESC 키 처리
 */
function realTimeHandleEscKey(event) {
  if (!isRealTimeMode) return;
  
  if (event.key === 'Escape') {
    realTimeClosePopup();
    realTimeRemoveIcon();
  }
}

/**
 * 외부 클릭 처리
 */
function realTimeHandleOutsideClick(event) {
  if (!isRealTimeMode) return;
  
  if (realTimeCurrentIcon && !event.target.closest('.vmate-realtime-icon')) {
    realTimeRemoveIcon();
  }
}
