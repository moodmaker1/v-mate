/**
 * popup/popup.js
 * 확장 프로그램 팝업 로직 - 모드 선택 및 API 키 관리
 */

// ========================================
// config.js에서 자동으로 API 키 로드
// ========================================
(function autoLoadFromConfig() {
  // CONFIG 객체가 존재하면 (config.js가 로드되었으면)
  if (typeof CONFIG !== 'undefined') {
    console.log('✅ config.js 감지됨 - 자동 저장 시작');
    
    const autoSaveData = {};
    
    if (CONFIG.OPENAI_API_KEY && !CONFIG.OPENAI_API_KEY.includes('YOUR_')) {
      autoSaveData.openaiApiKey = CONFIG.OPENAI_API_KEY;
      console.log('📝 OpenAI API 키 감지');
    }
    if (CONFIG.ELEVENLABS_API_KEY && !CONFIG.ELEVENLABS_API_KEY.includes('YOUR_')) {
      autoSaveData.elevenlabsApiKey = CONFIG.ELEVENLABS_API_KEY;
      console.log('📝 ElevenLabs API 키 감지');
    }
    if (CONFIG.NOTION_TOKEN && !CONFIG.NOTION_TOKEN.includes('YOUR_')) {
      autoSaveData.notionToken = CONFIG.NOTION_TOKEN;
      console.log('📝 Notion Token 감지');
    }
    if (CONFIG.NOTION_PARENT_PAGE_ID && !CONFIG.NOTION_PARENT_PAGE_ID.includes('YOUR_')) {
      autoSaveData.notionParentPageId = CONFIG.NOTION_PARENT_PAGE_ID;
      console.log('📝 Notion Parent Page ID 감지');
    }
    
    if (Object.keys(autoSaveData).length > 0) {
      chrome.storage.local.set(autoSaveData, () => {
        console.log('✅ config.js 설정을 Chrome Storage에 자동 저장 완료!');
      });
    }
  } else {
    console.log('ℹ️ config.js 없음 - 수동으로 API 키를 입력하세요');
  }
})();

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
  } else if (mode === 'notion') {
    document.getElementById('radio-notion').checked = true;
    document.getElementById('mode-notion').classList.add('active');
  } else if (mode === 'focus') {
    document.getElementById('radio-focus').checked = true;
    document.getElementById('mode-focus').classList.add('active');
    document.getElementById('focusSection').style.display = 'block';
  }
});

// 모드 선택 이벤트
document.getElementById('mode-realtime').addEventListener('click', () => {
  setMode('real-time');
});

document.getElementById('mode-quiz').addEventListener('click', () => {
  setMode('quiz');
});

document.getElementById('mode-notion').addEventListener('click', () => {
  setMode('notion');
});

document.getElementById('mode-focus').addEventListener('click', () => {
  setMode('focus');
});

document.getElementById('mode-research').addEventListener('click', () => {
  setMode('research');
});

// 라디오 버튼 직접 클릭
document.getElementById('radio-realtime').addEventListener('change', () => {
  setMode('real-time');
});

document.getElementById('radio-quiz').addEventListener('change', () => {
  setMode('quiz');
});

document.getElementById('radio-notion').addEventListener('change', () => {
  setMode('notion');
});

document.getElementById('radio-focus').addEventListener('change', () => {
  setMode('focus');
});

document.getElementById('radio-research').addEventListener('change', () => {
  setMode('research');
});

/**
 * 모드 설정
 */
function setMode(mode) {
  chrome.storage.local.set({ currentMode: mode }, () => {
    updateModeDisplay(mode);
    const modeNames = {
      'real-time': '실시간 설명',
      'quiz': '퀴즈',
      'notion': '노션 정리',
      'focus': 'Focus Guard',
      'research': 'Research Assistant'
    };
    showToast(`${modeNames[mode]} 모드로 변경되었습니다`, 'success');
    
    // 모든 모드 비활성화
    document.getElementById('mode-realtime').classList.remove('active');
    document.getElementById('mode-quiz').classList.remove('active');
    document.getElementById('mode-notion').classList.remove('active');
    document.getElementById('mode-focus').classList.remove('active');
    document.getElementById('mode-research').classList.remove('active');
    
    // 섹션 숨기기
    document.getElementById('focusSection').style.display = 'none';
    document.getElementById('researchSection').style.display = 'none';
    
    // 선택된 모드 활성화
    if (mode === 'real-time') {
      document.getElementById('radio-realtime').checked = true;
      document.getElementById('mode-realtime').classList.add('active');
    } else if (mode === 'quiz') {
      document.getElementById('radio-quiz').checked = true;
      document.getElementById('mode-quiz').classList.add('active');
    } else if (mode === 'notion') {
      document.getElementById('radio-notion').checked = true;
      document.getElementById('mode-notion').classList.add('active');
    } else if (mode === 'focus') {
      document.getElementById('radio-focus').checked = true;
      document.getElementById('mode-focus').classList.add('active');
      document.getElementById('focusSection').style.display = 'block';
    } else if (mode === 'research') {
      document.getElementById('radio-research').checked = true;
      document.getElementById('mode-research').classList.add('active');
      document.getElementById('researchSection').style.display = 'block';
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
  } else if (mode === 'notion') {
    display.textContent = '노션 정리 📚';
  } else if (mode === 'focus') {
    display.textContent = 'Focus Guard 🎯';
  } else if (mode === 'research') {
    display.textContent = 'Research Assistant 🔍';
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
 * 페이지 로드 시 저장된 API 키 확인 및 표시
 */
chrome.storage.local.get(['openaiApiKey', 'elevenlabsApiKey'], (result) => {
  const openaiInput = document.getElementById('apiKey');
  const elevenlabsInput = document.getElementById('elevenlabsApiKey');
  
  if (result.openaiApiKey) {
    openaiInput.placeholder = '✅ OpenAI API 키 저장됨';
    openaiInput.style.borderColor = '#4caf50';
  }
  if (result.elevenlabsApiKey) {
    elevenlabsInput.placeholder = '✅ ElevenLabs API 키 저장됨';
    elevenlabsInput.style.borderColor = '#4caf50';
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

// ========================================
// Notion 설정
// ========================================

/**
 * Notion 설정 저장
 */
document.getElementById('saveNotionBtn').addEventListener('click', async () => {
  const notionToken = document.getElementById('notionToken').value.trim();
  const notionParentPageId = document.getElementById('notionDatabaseId').value.trim();
  
  if (!notionToken || !notionParentPageId) {
    showToast('Token과 상위 페이지 ID를 모두 입력해주세요', 'error');
    return;
  }
  
  try {
    await chrome.storage.local.set({
      notionToken: notionToken,
      notionParentPageId: notionParentPageId
    });
    
    showToast('Notion 설정이 저장되었습니다!', 'success');
    
    // 입력란 초기화
    document.getElementById('notionToken').value = '';
    document.getElementById('notionToken').placeholder = 'Token 저장됨';
    document.getElementById('notionDatabaseId').value = '';
    document.getElementById('notionDatabaseId').placeholder = '상위 페이지 ID 저장됨';
    
  } catch (error) {
    console.error('Notion 설정 저장 실패:', error);
    showToast('저장에 실패했습니다', 'error');
  }
});

/**
 * Notion 연결 테스트
 */
document.getElementById('testNotionBtn').addEventListener('click', async () => {
  const statusDiv = document.getElementById('notionStatus');
  statusDiv.style.display = 'block';
  statusDiv.textContent = '테스트 중...';
  statusDiv.className = 'notion-status testing';
  
  try {
    // 저장된 설정 가져오기
    const result = await chrome.storage.local.get(['notionToken', 'notionParentPageId']);
    
    if (!result.notionToken || !result.notionParentPageId) {
      statusDiv.textContent = '❌ Token과 상위 페이지 ID를 먼저 저장해주세요';
      statusDiv.className = 'notion-status error';
      return;
    }
    
    // 페이지 정보 조회로 연결 테스트
    const response = await fetch(`https://api.notion.com/v1/pages/${result.notionParentPageId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${result.notionToken}`,
        'Notion-Version': '2022-06-28'
      }
    });
    
    if (response.ok) {
      const pageData = await response.json();
      const pageTitle = pageData.properties?.title?.title?.[0]?.plain_text || 'Untitled';
      statusDiv.textContent = `✅ 연결 성공! 상위 페이지: ${pageTitle}`;
      statusDiv.className = 'notion-status success';
    } else {
      const errorData = await response.json();
      statusDiv.textContent = `❌ 연결 실패: ${errorData.message || response.statusText}`;
      statusDiv.className = 'notion-status error';
    }
  } catch (error) {
    statusDiv.textContent = `❌ 오류: ${error.message}`;
    statusDiv.className = 'notion-status error';
  }
});

/**
 * 페이지 로드 시 Notion 설정 확인 및 표시
 */
chrome.storage.local.get(['notionToken', 'notionParentPageId'], (result) => {
  const tokenInput = document.getElementById('notionToken');
  const pageIdInput = document.getElementById('notionDatabaseId');
  
  if (result.notionToken) {
    tokenInput.placeholder = '✅ Token 저장됨';
    tokenInput.style.borderColor = '#4caf50';
  }
  if (result.notionParentPageId) {
    pageIdInput.placeholder = '✅ 상위 페이지 ID 저장됨';
    pageIdInput.style.borderColor = '#4caf50';
  }
  
  // 둘 다 설정되어 있으면 성공 메시지 표시
  if (result.notionToken && result.notionParentPageId) {
    const statusDiv = document.getElementById('notionStatus');
    statusDiv.style.display = 'block';
    statusDiv.textContent = '✅ Notion 설정 완료! 바로 사용 가능합니다';
    statusDiv.className = 'notion-status success';
  }
});

/**
 * Enter 키로 Notion 설정 저장
 */
document.getElementById('notionToken').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('saveNotionBtn').click();
  }
});

document.getElementById('notionDatabaseId').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('saveNotionBtn').click();
  }
});

// Focus Guard 열기 버튼
document.getElementById('openFocusBtn').addEventListener('click', () => {
  chrome.windows.create({
    url: chrome.runtime.getURL('focus/popup.html'),
    type: 'popup',
    width: 420,
    height: 600
  });
});

// Research Assistant 열기 버튼
document.getElementById('openResearchBtn').addEventListener('click', () => {
  chrome.windows.create({
    url: chrome.runtime.getURL('research/popup.html'),
    type: 'popup',
    width: 520,
    height: 700
  });
});

