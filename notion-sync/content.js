/**
 * v-mate Notion Sync - Content Script
 * 드래그한 텍스트를 노션에 자동 저장
 */

let isNotionMode = false;
let notionIcon = null;

// 모드 확인
chrome.storage.local.get(['currentMode'], (result) => {
  isNotionMode = (result.currentMode === 'notion');
  if (isNotionMode) {
    console.log('📚 v-mate notion mode activated');
    initNotionMode();
  }
});

// 모드 변경 감지
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.currentMode) {
    const newMode = changes.currentMode.newValue;
    isNotionMode = (newMode === 'notion');
    
    if (isNotionMode) {
      console.log('📚 Switched to notion mode');
      initNotionMode();
    } else {
      console.log('📚 Notion mode deactivated');
      removeNotionIcon();
    }
  }
});

/**
 * 노션 모드 초기화
 */
function initNotionMode() {
  // 텍스트 선택 이벤트 리스너
  document.addEventListener('mouseup', handleTextSelection);
  console.log('📚 Notion mode initialized - ready to save to Notion!');
}

/**
 * 텍스트 선택 처리
 */
function handleTextSelection(event) {
  if (!isNotionMode) return;

  // 기존 아이콘 제거
  removeNotionIcon();

  const selectedText = window.getSelection().toString().trim();
  
  // 3글자 이상 선택 시에만 아이콘 표시
  if (selectedText.length < 3) return;

  // 팝업 내부 클릭 무시
  if (event.target.closest('.vmate-notion-popup') || 
      event.target.closest('.vmate-notion-icon')) {
    return;
  }

  // 선택 영역 위치 계산
  const selection = window.getSelection();
  if (selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  // 📚 초록색 아이콘 생성
  createNotionIcon(rect, selectedText);
}

/**
 * 노션 아이콘 생성
 */
function createNotionIcon(rect, selectedText) {
  notionIcon = document.createElement('div');
  notionIcon.className = 'vmate-notion-icon';
  notionIcon.innerHTML = '📚';
  notionIcon.title = '노션에 저장 (클릭하세요!)';

  // 위치 설정 (선택 영역 위쪽 중앙)
  notionIcon.style.position = 'absolute';
  notionIcon.style.left = `${rect.left + rect.width / 2 + window.scrollX}px`;
  notionIcon.style.top = `${rect.top + window.scrollY - 45}px`;
  notionIcon.style.zIndex = '2147483647'; // 최대 z-index
  notionIcon.style.cursor = 'pointer';
  notionIcon.style.pointerEvents = 'auto'; // 클릭 이벤트 활성화

  document.body.appendChild(notionIcon);
  
  console.log('📚 노션 아이콘 생성됨, 위치:', {
    left: notionIcon.style.left,
    top: notionIcon.style.top
  });

  // 아이콘 클릭 이벤트 (mousedown, click 둘 다 처리)
  const handleClick = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('🖱️ 노션 아이콘 클릭됨!');
    
    // 아이콘 즉시 제거 (중복 클릭 방지)
    removeNotionIcon();
    
    try {
      await handleNotionSave(selectedText);
    } catch (error) {
      console.error('🔴 handleNotionSave 실행 중 에러:', error);
      alert(`노션 저장 실패: ${error.message}`);
    }
  };
  
  notionIcon.addEventListener('mousedown', handleClick);
  notionIcon.addEventListener('click', handleClick);

  // 외부 클릭 시 아이콘 제거
  setTimeout(() => {
    document.addEventListener('mousedown', outsideClickHandler);
  }, 100);
}


/**
 * 노션 저장 처리 (Background Script 통해 저장)
 */
async function handleNotionSave(selectedText) {
  try {
    console.log('📚 [Content] 노션 저장 시작...');
    console.log('📚 선택된 텍스트:', selectedText.substring(0, 100) + '...');
    
    // 로딩 표시
    showLoadingToast();
    console.log('📚 [Content] 로딩 토스트 표시됨');

    // 페이지 맥락 정보
    const pageContext = {
      title: document.title,
      url: window.location.href
    };
    
    console.log('📚 [Content] 페이지 정보:', pageContext);
    console.log('📚 [Content] Background로 저장 요청 전송 중...');

    // Background Script에 저장 요청 (CORS 회피)
    const result = await chrome.runtime.sendMessage({
      action: 'notion-save',
      data: {
        selectedText,
        pageUrl: pageContext.url,
        pageTitle: pageContext.title,
        timestamp: Date.now()
      }
    });

    if (result.success) {
      console.log('✅ [Content] 노션 저장 완료!', result);
      showSuccessToast('✅ 노션에 저장 완료!');
    } else {
      throw new Error(result.error || '저장 실패');
    }
    
    // 아이콘 제거
    removeNotionIcon();

  } catch (error) {
    console.error('❌ [Content] 노션 저장 오류:', error);
    console.error('❌ 에러 상세:', error.message);
    showErrorToast(`❌ 저장 실패: ${error.message}`);
  }
}

/**
 * 로딩 토스트 표시
 */
function showLoadingToast() {
  console.log('💬 로딩 토스트 생성 중...');
  removeToasts();
  const toast = document.createElement('div');
  toast.className = 'vmate-notion-toast vmate-notion-toast-loading';
  toast.innerHTML = '<div class="loading-spinner"></div><span>노션에 저장 중...</span>';
  toast.style.position = 'fixed';
  toast.style.bottom = '30px';
  toast.style.left = '50%';
  toast.style.zIndex = '9999999';
  document.body.appendChild(toast);
  console.log('💬 로딩 토스트 추가됨');
  
  setTimeout(() => {
    toast.classList.add('vmate-notion-toast-show');
    console.log('💬 로딩 토스트 표시');
  }, 10);
}

/**
 * 성공 토스트 표시
 */
function showSuccessToast(message) {
  console.log('💚 성공 토스트:', message);
  removeToasts();
  const toast = document.createElement('div');
  toast.className = 'vmate-notion-toast vmate-notion-toast-success';
  toast.textContent = message;
  toast.style.position = 'fixed';
  toast.style.bottom = '30px';
  toast.style.left = '50%';
  toast.style.zIndex = '9999999';
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('vmate-notion-toast-show');
  }, 10);

  setTimeout(() => {
    toast.classList.remove('vmate-notion-toast-show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * 에러 토스트 표시
 */
function showErrorToast(message) {
  console.log('🔴 에러 토스트:', message);
  removeToasts();
  const toast = document.createElement('div');
  toast.className = 'vmate-notion-toast vmate-notion-toast-error';
  toast.textContent = message;
  toast.style.position = 'fixed';
  toast.style.bottom = '30px';
  toast.style.left = '50%';
  toast.style.zIndex = '9999999';
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('vmate-notion-toast-show');
  }, 10);

  setTimeout(() => {
    toast.classList.remove('vmate-notion-toast-show');
    setTimeout(() => toast.remove(), 300);
  }, 5000); // 에러는 5초간 표시
}

/**
 * 모든 토스트 제거
 */
function removeToasts() {
  const toasts = document.querySelectorAll('.vmate-notion-toast');
  if (toasts.length > 0) {
    console.log('💬 기존 토스트 제거:', toasts.length, '개');
  }
  toasts.forEach(toast => toast.remove());
}

/**
 * 아이콘 제거
 */
function removeNotionIcon() {
  if (notionIcon) {
    notionIcon.remove();
    notionIcon = null;
    document.removeEventListener('mousedown', outsideClickHandler);
  }
}

/**
 * 외부 클릭 핸들러
 */
function outsideClickHandler(event) {
  if (!event.target.closest('.vmate-notion-icon') && 
      !event.target.closest('.vmate-notion-popup')) {
    removeNotionIcon();
  }
}

console.log('📚 v-mate notion-sync content script loaded');

