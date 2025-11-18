/**
 * popup.js
 * 역할: 확장 프로그램 팝업(설정) UI의 동작을 제어합니다.
 * 
 * 주요 기능:
 * - API 키 저장 및 불러오기
 * - 설정 관리
 */

// API 키 저장
document.getElementById('saveBtn').addEventListener('click', async () => {
  const apiKey = document.getElementById('apiKey').value.trim();
  
  if (!apiKey) {
    alert('API 키를 입력해주세요.');
    return;
  }
  
  try {
    await chrome.storage.local.set({ openaiApiKey: apiKey });
    alert('API 키가 저장되었습니다!');
    document.getElementById('apiKey').value = '';
  } catch (error) {
    console.error('API 키 저장 실패:', error);
    alert('저장에 실패했습니다.');
  }
});

// 페이지 로드 시 저장된 API 키 확인
chrome.storage.local.get(['openaiApiKey'], (result) => {
  if (result.openaiApiKey) {
    document.getElementById('apiKey').placeholder = 'API 키가 저장되어 있습니다';
  }
});

