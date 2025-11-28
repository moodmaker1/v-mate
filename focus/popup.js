/**
 * Focus Guard 팝업 로직
 */

let goals = [];
let currentEditingId = null;

// 페이지 로드 시
document.addEventListener('DOMContentLoaded', () => {
  loadGoals();
  setupEventListeners();
  startStatsUpdate();
});

/**
 * 이벤트 리스너 설정
 */
function setupEventListeners() {
  // 목표 추가 버튼
  document.getElementById('addGoalBtn').addEventListener('click', () => {
    openGoalModal();
  });

  // 모달 닫기
  document.querySelector('.modal-close').addEventListener('click', closeGoalModal);
  document.querySelector('.modal-overlay').addEventListener('click', closeGoalModal);
  document.querySelector('.btn-cancel').addEventListener('click', closeGoalModal);
  
  // 저장 버튼
  document.querySelector('.btn-save').addEventListener('click', saveGoal);
  
  // ESC 키로 모달 닫기
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeGoalModal();
    }
  });
  
  // 목표 카드 이벤트 위임
  setupGoalEventListeners();
}

// 이벤트 리스너가 이미 등록되었는지 확인
let goalEventListenersAttached = false;

/**
 * 목표 카드 버튼 이벤트 리스너 설정
 */
function setupGoalEventListeners() {
  const goalsList = document.getElementById('goalsList');
  if (!goalsList) return;
  
  // 이미 등록되어 있으면 스킵
  if (goalEventListenersAttached) return;
  
  // 이벤트 위임으로 모든 버튼 처리
  goalsList.addEventListener('click', (e) => {
    const button = e.target.closest('button');
    if (!button) return;
    
    const action = button.getAttribute('data-action');
    const goalId = button.getAttribute('data-goal-id');
    
    if (!action || !goalId) {
      // data-action이 없는 버튼은 무시 (모달 닫기 등)
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Button clicked:', action, goalId);
    
    try {
      switch(action) {
        case 'start':
          startGoal(goalId);
          break;
        case 'pause':
          pauseGoal(goalId);
          break;
        case 'stop':
          stopGoal(goalId);
          break;
        case 'edit':
          editGoal(goalId);
          break;
        case 'delete':
          deleteGoal(goalId);
          break;
        default:
          console.warn('Unknown action:', action);
      }
    } catch (error) {
      console.error('Error handling button click:', error);
      alert('오류가 발생했습니다: ' + error.message);
    }
  });
  
  goalEventListenersAttached = true;
  console.log('Goal event listeners attached');
}

/**
 * 목표 로드
 */
function loadGoals() {
  chrome.storage.local.get(['focusGoals'], (result) => {
    goals = result.focusGoals || [];
    renderGoals();
    updateStats();
  });
}

/**
 * 목표 저장
 */
function saveGoals() {
  chrome.storage.local.set({ focusGoals: goals }, () => {
    renderGoals();
    updateStats();
    // 실시간 업데이트 재시작
    startRealTimeUpdate();
  });
}

/**
 * 목표 렌더링
 */
function renderGoals() {
  const goalsList = document.getElementById('goalsList');
  const emptyState = document.getElementById('emptyState');
  
  if (goals.length === 0) {
    goalsList.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }
  
  goalsList.style.display = 'flex';
  emptyState.style.display = 'none';
  
  goalsList.innerHTML = goals.map((goal, index) => {
    const totalMinutes = goal.hours * 60 + goal.minutes;
    const studiedMinutes = goal.studiedMinutes || 0;
    const distractionMinutes = goal.distractionMinutes || 0;
    const isActive = goal.status === 'active';
    
    // 진행률 계산 (100% 초과 가능)
    const progress = totalMinutes > 0 ? (studiedMinutes / totalMinutes) * 100 : 0;
    const isOverGoal = studiedMinutes > totalMinutes;
    
    // 활성 목표의 경우 실시간 경과 시간 계산 (초 단위)
    let currentElapsedSeconds = studiedMinutes * 60;
    if (isActive && goal.startedAt) {
      const elapsedSeconds = Math.floor((Date.now() - goal.startedAt) / 1000);
      currentElapsedSeconds = (studiedMinutes * 60) + elapsedSeconds;
    }
    const currentElapsed = Math.floor(currentElapsedSeconds / 60);
    
    // 진행률 표시 (100% 초과 시 다르게 표시)
    const progressPercent = Math.min(progress, 100);
    const progressOverflow = progress > 100 ? progress - 100 : 0;
    
    return `
      <div class="goal-card ${isActive ? 'active' : ''} ${isOverGoal ? 'over-goal' : ''}" data-id="${goal.id}">
        <div class="goal-card-header">
          <div class="goal-title">${escapeHtml(goal.subject)}</div>
          <div class="goal-actions">
            <button class="goal-btn edit" data-action="edit" data-goal-id="${goal.id}" title="수정">✏️</button>
            <button class="goal-btn delete" data-action="delete" data-goal-id="${goal.id}" title="삭제">🗑️</button>
          </div>
        </div>
        ${isActive ? `
          <div class="goal-status-indicator">
            <span class="status-dot"></span>
            <span class="status-text">측정 중...</span>
          </div>
        ` : ''}
        <div class="goal-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progressPercent}%"></div>
            ${progressOverflow > 0 ? `<div class="progress-overflow" style="width: ${progressOverflow}%"></div>` : ''}
          </div>
          <div class="progress-text">
            <span>
              ${isActive 
                ? `<strong class="realtime-time" data-goal-id="${goal.id}" data-studied-minutes="${studiedMinutes}" data-started-at="${goal.startedAt}" data-total-minutes="${totalMinutes}">${formatTimeMMSS(currentElapsedSeconds)}</strong> 
                   / ${formatTimeMMSS(totalMinutes * 60)}
                   <span class="remaining-time" data-goal-id="${goal.id}" data-total-minutes="${totalMinutes}">(${formatTimeMMSS(Math.max(0, (totalMinutes * 60) - currentElapsedSeconds))} 남음)</span>`
                : `${formatTimeMMSS(studiedMinutes * 60)} / ${formatTimeMMSS(totalMinutes * 60)}`
              }
              ${isOverGoal ? ` <span class="over-goal-badge">+${formatTime(studiedMinutes - totalMinutes)}</span>` : ''}
            </span>
            <span class="${isOverGoal ? 'over-goal-percent' : ''}">
              ${Math.round(progress)}%
              ${isOverGoal ? ' 🎉' : ''}
            </span>
          </div>
        </div>
        <div class="goal-controls">
          ${isActive 
            ? `<button class="control-btn pause" data-action="pause" data-goal-id="${goal.id}">일시정지</button>
               <button class="control-btn stop" data-action="stop" data-goal-id="${goal.id}">종료</button>`
            : `<button class="control-btn start" data-action="start" data-goal-id="${goal.id}">시작</button>
               <button class="control-btn stop" data-action="delete" data-goal-id="${goal.id}" style="background: #6b7280;">삭제</button>`
          }
        </div>
      </div>
    `;
  }).join('');
  
  // 활성 목표의 실시간 시간 업데이트 시작
  startRealTimeUpdate();
  
  // 이벤트 리스너는 이미 설정되어 있음 (이벤트 위임 사용)
}

/**
 * 목표 추가 모달 열기
 */
function openGoalModal(goalId = null) {
  currentEditingId = goalId;
  const modal = document.getElementById('goalModal');
  const title = document.getElementById('modalTitle');
  const subjectInput = document.getElementById('goalSubject');
  const hoursInput = document.getElementById('goalHours');
  const minutesInput = document.getElementById('goalMinutes');
  
  if (goalId) {
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      title.textContent = '목표 수정';
      subjectInput.value = goal.subject;
      hoursInput.value = goal.hours;
      minutesInput.value = goal.minutes;
    }
  } else {
    title.textContent = '목표 추가';
    subjectInput.value = '';
    hoursInput.value = 1;
    minutesInput.value = 0;
  }
  
  modal.style.display = 'flex';
  subjectInput.focus();
}

/**
 * 목표 추가 모달 닫기
 */
function closeGoalModal() {
  document.getElementById('goalModal').style.display = 'none';
  currentEditingId = null;
}

/**
 * 목표 저장
 */
function saveGoal() {
  const subject = document.getElementById('goalSubject').value.trim();
  const hours = parseInt(document.getElementById('goalHours').value) || 0;
  const minutes = parseInt(document.getElementById('goalMinutes').value) || 0;
  
  if (!subject) {
    alert('과목/목표를 입력해주세요');
    return;
  }
  
  if (hours === 0 && minutes === 0) {
    alert('목표 시간을 입력해주세요');
    return;
  }
  
  if (currentEditingId) {
    // 수정
    const goal = goals.find(g => g.id === currentEditingId);
    if (goal) {
      goal.subject = subject;
      goal.hours = hours;
      goal.minutes = minutes;
    }
  } else {
    // 추가
    const newGoal = {
      id: Date.now().toString(),
      subject: subject,
      hours: hours,
      minutes: minutes,
      studiedMinutes: 0,
      distractionMinutes: 0,
      status: 'inactive',
      createdAt: Date.now()
    };
    goals.push(newGoal);
  }
  
  saveGoals();
  closeGoalModal();
}

/**
 * 목표 시작
 */
function startGoal(goalId) {
  console.log('startGoal called with:', goalId);
  
  // 여러 목표 동시 활성화 가능 - 다른 목표 일시정지하지 않음
  
  const goal = goals.find(g => g.id === goalId);
  if (!goal) {
    console.error('Goal not found:', goalId);
    alert('목표를 찾을 수 없습니다.');
    return;
  }
  
  // 이미 활성화되어 있으면 무시
  if (goal.status === 'active') {
    console.log('목표가 이미 활성화되어 있습니다:', goalId);
    return;
  }
  
  // 목표 상태 업데이트
  goal.status = 'active';
  goal.startedAt = Date.now();
  goal.distractionMinutes = goal.distractionMinutes || 0;
  goal.studiedMinutes = goal.studiedMinutes || 0;
  
  // 먼저 저장
  chrome.storage.local.set({ focusGoals: goals }, () => {
    console.log('목표 저장 완료:', goal);
    
    // Background에 알림
    chrome.runtime.sendMessage({
      action: 'focus:start',
      goalId: goalId
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('목표 시작 실패:', chrome.runtime.lastError);
        alert('목표 시작에 실패했습니다: ' + chrome.runtime.lastError.message);
      } else {
        console.log('목표 시작 성공:', response);
        // UI 업데이트
        renderGoals();
        updateStats();
      }
    });
  });
}

/**
 * 목표 일시정지
 */
function pauseGoal(goalId) {
  const goal = goals.find(g => g.id === goalId);
  if (goal && goal.status === 'active') {
    goal.status = 'paused';
    saveGoals();
    
    chrome.runtime.sendMessage({
      action: 'focus:pause',
      goalId: goalId
    });
  }
}

/**
 * 목표 종료
 */
function stopGoal(goalId) {
  const goal = goals.find(g => g.id === goalId);
  if (goal) {
    goal.status = 'inactive';
    saveGoals();
    
    chrome.runtime.sendMessage({
      action: 'focus:stop',
      goalId: goalId
    });
  }
}

/**
 * 목표 수정
 */
function editGoal(goalId) {
  openGoalModal(goalId);
}

/**
 * 목표 삭제
 */
function deleteGoal(goalId) {
  console.log('deleteGoal called with:', goalId);
  
  if (confirm('정말 삭제하시겠습니까?')) {
    goals = goals.filter(g => g.id !== goalId);
    saveGoals();
    
    chrome.runtime.sendMessage({
      action: 'focus:delete',
      goalId: goalId
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('목표 삭제 실패:', chrome.runtime.lastError);
      } else {
        console.log('목표 삭제 성공:', response);
      }
    });
  }
}

/**
 * 통계 업데이트
 */
function updateStats() {
  const totalStudy = goals.reduce((sum, g) => sum + (g.studiedMinutes || 0), 0);
  const totalDistraction = goals.reduce((sum, g) => sum + (g.distractionMinutes || 0), 0);
  const total = totalStudy + totalDistraction;
  const focusScore = total > 0 ? Math.round((totalStudy / total) * 100) : 0;
  
  const totalStudyEl = document.getElementById('totalStudyTime');
  const totalDistractionEl = document.getElementById('totalDistractionTime');
  const scoreEl = document.getElementById('focusScore');
  const statsSection = document.getElementById('statsSection');
  
  if (totalStudyEl) totalStudyEl.textContent = formatTime(totalStudy);
  if (totalDistractionEl) totalDistractionEl.textContent = formatTime(totalDistraction);
  
  if (scoreEl) {
    scoreEl.textContent = focusScore + '%';
    scoreEl.className = 'stat-value ' + 
      (focusScore >= 80 ? 'high' : focusScore >= 60 ? 'medium' : 'low');
  }
  
  if (goals.length > 0 && statsSection) {
    statsSection.style.display = 'block';
  }
}

// 통계 업데이트 인터벌 ID
let statsUpdateIntervalId = null;
// 실시간 시간 업데이트 인터벌 ID
let realTimeUpdateIntervalId = null;

/**
 * 통계 주기적 업데이트
 */
function startStatsUpdate() {
  // 이미 시작되어 있으면 중복 방지
  if (statsUpdateIntervalId !== null) return;
  
  statsUpdateIntervalId = setInterval(() => {
    loadGoals(); // 목표 다시 로드해서 최신 시간 반영
  }, 5000); // 5초마다
}

/**
 * 활성 목표의 실시간 시간 업데이트 (MM:SS 형식)
 * 여러 목표 동시 업데이트 지원
 */
function startRealTimeUpdate() {
  // 기존 인터벌 정리
  if (realTimeUpdateIntervalId !== null) {
    clearInterval(realTimeUpdateIntervalId);
  }
  
  // 1초마다 실시간 시간 업데이트 (MM:SS 형식)
  realTimeUpdateIntervalId = setInterval(() => {
    // 현재 저장된 목표 다시 로드 (최신 시간 반영)
    chrome.storage.local.get(['focusGoals'], (result) => {
      const currentGoals = result.focusGoals || [];
      
      // 활성 목표만 필터링
      const activeGoals = currentGoals.filter(g => g.status === 'active');
      
      activeGoals.forEach(goal => {
        if (goal.startedAt) {
          const now = Date.now();
          const startedAt = parseInt(goal.startedAt);
          const elapsedSeconds = Math.floor((now - startedAt) / 1000);
          const studiedMinutes = goal.studiedMinutes || 0;
          const currentElapsedSeconds = (studiedMinutes * 60) + elapsedSeconds;
          const totalMinutes = goal.hours * 60 + goal.minutes;
          const totalSeconds = totalMinutes * 60;
          const remainingSeconds = Math.max(0, totalSeconds - currentElapsedSeconds);
          const currentElapsedMinutes = Math.floor(currentElapsedSeconds / 60);
          const isOverGoal = currentElapsedMinutes > totalMinutes;
          
          // 진행률 텍스트의 실시간 시간 업데이트
          const realtimeTimeElement = document.querySelector(`.realtime-time[data-goal-id="${goal.id}"]`);
          if (realtimeTimeElement) {
            realtimeTimeElement.textContent = formatTimeMMSS(currentElapsedSeconds);
            
            // 남은 시간 업데이트
            const remainingTimeElement = document.querySelector(`.remaining-time[data-goal-id="${goal.id}"]`);
            if (remainingTimeElement) {
              if (isOverGoal) {
                remainingTimeElement.textContent = `(+${formatTimeMMSS(currentElapsedSeconds - totalSeconds)})`;
                remainingTimeElement.className = 'remaining-time over-time';
              } else {
                remainingTimeElement.textContent = `(${formatTimeMMSS(remainingSeconds)} 남음)`;
                remainingTimeElement.className = 'remaining-time';
              }
            }
            
            // 초과 배지도 업데이트
            const progressText = realtimeTimeElement.closest('.progress-text')?.querySelector('span');
            if (progressText) {
              const overBadge = progressText.querySelector('.over-goal-badge');
              if (isOverGoal) {
                const overMinutes = currentElapsedMinutes - totalMinutes;
                if (overBadge) {
                  overBadge.textContent = `+${formatTime(overMinutes)}`;
                } else {
                  const badge = document.createElement('span');
                  badge.className = 'over-goal-badge';
                  badge.textContent = `+${formatTime(overMinutes)}`;
                  realtimeTimeElement.parentNode.insertBefore(badge, realtimeTimeElement.nextSibling);
                }
              } else if (overBadge) {
                overBadge.remove();
              }
            }
          }
        }
      });
    });
  }, 1000); // 1초마다 업데이트
}

/**
 * 시간 포맷팅 (분 단위)
 */
function formatTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}시간 ${mins}분`;
  }
  return `${mins}분`;
}

/**
 * 시간 포맷팅 (MM:SS 형식)
 */
function formatTimeMMSS(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  } else {
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
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

// 전역 함수로 노출 (필요시)
window.editGoal = editGoal;
window.deleteGoal = deleteGoal;
window.startGoal = startGoal;
window.pauseGoal = pauseGoal;
window.stopGoal = stopGoal;

