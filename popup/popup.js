/**
 * popup/popup.js
 * 확장 프로그램 팝업 로직 - 모드 선택 및 API 키 관리
 */

// 현재 모드 불러오기
chrome.storage.local.get(['currentMode'], (result) => {
  const mode = result.currentMode || 'real-time';
  updateModeDisplay(mode);
  
  // 라디오 버튼 선택
  if (mode === 'real-time') {
    document.getElementById('radio-realtime').checked = true;
    document.getElementById('mode-realtime').classList.add('active');
  } else if (mode === 'quiz') {
    document.getElementById('radio-quiz').checked = true;
    document.getElementById('mode-quiz').classList.add('active');
  }
});

// 모드 선택 이벤트
document.getElementById('mode-realtime').addEventListener('click', () => {
  setMode('real-time');
});

document.getElementById('mode-quiz').addEventListener('click', () => {
  setMode('quiz');
});

// 라디오 버튼 직접 클릭
document.getElementById('radio-realtime').addEventListener('change', () => {
  setMode('real-time');
});

document.getElementById('radio-quiz').addEventListener('change', () => {
  setMode('quiz');
});

/**
 * 모드 설정
 */
function setMode(mode) {
  chrome.storage.local.set({ currentMode: mode }, () => {
    updateModeDisplay(mode);
    showToast(`${mode === 'real-time' ? '실시간 설명' : '퀴즈'} 모드로 변경되었습니다`, 'success');
    
    // 라디오 버튼 업데이트
    if (mode === 'real-time') {
      document.getElementById('radio-realtime').checked = true;
      document.getElementById('mode-realtime').classList.add('active');
      document.getElementById('mode-quiz').classList.remove('active');
    } else {
      document.getElementById('radio-quiz').checked = true;
      document.getElementById('mode-quiz').classList.add('active');
      document.getElementById('mode-realtime').classList.remove('active');
    }
  });
}

/**
 * 모드 표시 업데이트
 */
function updateModeDisplay(mode) {
  const display = document.getElementById('currentModeDisplay');
  if (mode === 'real-time') {
    display.textContent = '실시간 설명 💡';
  } else if (mode === 'quiz') {
    display.textContent = '퀴즈 모드 ❓';
  }
}

/**
 * API 키 저장
 */
document.getElementById('saveBtn').addEventListener('click', async () => {
  const openaiKey = document.getElementById('apiKey').value.trim();
  const elevenlabsKey = document.getElementById('elevenlabsApiKey').value.trim();
  
  if (!openaiKey && !elevenlabsKey) {
    showToast('최소 하나의 API 키를 입력해주세요', 'error');
    return;
  }
  
  try {
    const dataToSave = {};
    
    // OpenAI 키 검증 및 저장
    if (openaiKey) {
      if (!openaiKey.startsWith('sk-')) {
        showToast('올바른 OpenAI API 키 형식이 아닙니다', 'error');
        return;
      }
      dataToSave.openaiApiKey = openaiKey;
    }
    
    // ElevenLabs 키 저장 (보이스 ID는 config.js에서 관리)
    if (elevenlabsKey) {
      dataToSave.elevenlabsApiKey = elevenlabsKey;
    }
    
    await chrome.storage.local.set(dataToSave);
    showToast('API 키가 저장되었습니다!', 'success');
    
    // 입력란 초기화
    if (openaiKey) {
      document.getElementById('apiKey').value = '';
      document.getElementById('apiKey').placeholder = 'OpenAI API 키 저장됨';
    }
    if (elevenlabsKey) {
      document.getElementById('elevenlabsApiKey').value = '';
      document.getElementById('elevenlabsApiKey').placeholder = 'ElevenLabs API 키 저장됨';
    }
  } catch (error) {
    console.error('API 키 저장 실패:', error);
    showToast('저장에 실패했습니다', 'error');
  }
});

/**
 * 페이지 로드 시 저장된 API 키 확인
 */
chrome.storage.local.get(['openaiApiKey', 'elevenlabsApiKey'], (result) => {
  if (result.openaiApiKey) {
    document.getElementById('apiKey').placeholder = 'OpenAI API 키 저장됨';
  }
  if (result.elevenlabsApiKey) {
    document.getElementById('elevenlabsApiKey').placeholder = 'ElevenLabs API 키 저장됨';
  }
});

/**
 * 토스트 알림 표시
 */
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 2000);
}

/**
 * Enter 키로 API 키 저장
 */
document.getElementById('apiKey').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('saveBtn').click();
  }
});

document.getElementById('elevenlabsApiKey').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('saveBtn').click();
  }
});

