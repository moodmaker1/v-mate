/**
 * Focus Guard Content Script
 * 탭 감지 및 알림 표시
 */

// 알림 요소
let notificationElement = null;

// 초기화
function initializeFocusGuard() {
  chrome.storage.local.get(['focusGoals'], (result) => {
    const activeGoals = (result.focusGoals || []).filter(g => g.status === 'active');
    if (activeGoals.length > 0) {
      startMonitoring();
    }
  });
}

// 메시지 리스너 (Background에서 경고 전송)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'focus:warning') {
    displayNotification(
      request.message || '집중 깨짐 감지!',
      request.duration || 0
    );
  }
});

// 초기화 실행
initializeFocusGuard();

// 목표 상태 변경 감지
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.focusGoals) {
    const goals = changes.focusGoals.newValue || [];
    const activeGoals = goals.filter(g => g.status === 'active');
    
    if (activeGoals.length > 0) {
      startMonitoring();
    } else {
      stopMonitoring();
    }
  }
});

// 모니터링 인터벌 ID
let monitoringIntervalId = null;

/**
 * 모니터링 시작
 */
function startMonitoring() {
  // 이미 시작되어 있으면 중복 방지
  if (monitoringIntervalId !== null) return;
  
  // 주기적으로 현재 탭 확인
  monitoringIntervalId = setInterval(() => {
    checkCurrentTab();
  }, 5000); // 5초마다 체크
}

/**
 * 모니터링 중지
 */
function stopMonitoring() {
  if (monitoringIntervalId !== null) {
    clearInterval(monitoringIntervalId);
    monitoringIntervalId = null;
  }
  removeNotification();
}

/**
 * 현재 탭 확인
 */
function checkCurrentTab() {
  chrome.runtime.sendMessage({
    action: 'focus:check-tab',
    url: window.location.href,
    title: document.title
  }, (response) => {
    if (chrome.runtime.lastError) {
      // 확장 프로그램이 리로드되었을 수 있음
      return;
    }
    if (response && response.isDistraction) {
      showWarning(response.duration, response.subject);
    } else {
      removeNotification();
    }
  });
}

/**
 * 경고 표시
 */
function showWarning(duration, subject) {
  // 메시지 가져오기
  chrome.runtime.sendMessage({
    action: 'focus:get-message',
    duration: duration,
    subject: subject
  }, (response) => {
    if (chrome.runtime.lastError) {
      return;
    }
    if (response && response.message) {
      displayNotification(response.message, duration);
    }
  });
}

/**
 * 알림 표시
 */
function displayNotification(message, duration) {
  // 기존 알림 제거
  removeNotification();
  
  // 새 알림 생성
  notificationElement = document.createElement('div');
  notificationElement.id = 'focus-guard-notification';
  notificationElement.className = 'focus-notification';
  notificationElement.innerHTML = `
    <div class="focus-notification-content">
      <div class="focus-notification-icon">⚠️</div>
      <div class="focus-notification-text">
        <div class="focus-notification-title">집중 깨짐 감지!</div>
        <div class="focus-notification-message">${escapeHtml(message)}</div>
        <div class="focus-notification-time">${duration}분 경과</div>
      </div>
      <button class="focus-notification-close">✕</button>
    </div>
  `;
  
  document.body.appendChild(notificationElement);
  
  // 닫기 버튼
  notificationElement.querySelector('.focus-notification-close').addEventListener('click', () => {
    removeNotification();
  });
  
  // 10초 후 자동 제거
  setTimeout(() => {
    removeNotification();
  }, 10000);
}

/**
 * 알림 제거
 */
function removeNotification() {
  if (notificationElement) {
    notificationElement.remove();
    notificationElement = null;
  }
}

/**
 * HTML 이스케이프
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

