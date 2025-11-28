/**
 * Research Assistant 팝업 로직
 */

let searchResults = [];
let selectedResults = [];

// 페이지 로드 시
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  loadSavedResults();
});

/**
 * 이벤트 리스너 설정
 */
function setupEventListeners() {
  // 검색 버튼
  document.getElementById('searchBtn').addEventListener('click', performSearch);
  
  // Enter 키로 검색
  document.getElementById('researchQuery').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  });
  
  // 정렬 변경
  document.getElementById('sortBy').addEventListener('change', () => {
    sortAndDisplayResults();
  });
  
  // 전체 선택 체크박스
  document.getElementById('selectAllCheckbox').addEventListener('change', (e) => {
    if (e.target.checked) {
      selectAllResults();
    } else {
      deselectAllResults();
    }
  });
  
  // 노션 내보내기
  document.getElementById('exportToNotionBtn').addEventListener('click', exportToNotion);
  
  // 결과 지우기
  document.getElementById('clearResultsBtn').addEventListener('click', clearResults);
  
  // 결과 카드 체크박스 클릭 처리
  document.addEventListener('change', (e) => {
    if (e.target.classList.contains('result-checkbox')) {
      const cardId = e.target.dataset.id;
      if (e.target.checked) {
        if (!selectedResults.includes(cardId)) {
          selectedResults.push(cardId);
        }
      } else {
        const index = selectedResults.indexOf(cardId);
        if (index > -1) {
          selectedResults.splice(index, 1);
        }
      }
      updateSelectionUI();
    }
  });
  
  // 결과 카드 클릭 처리 (체크박스 제외)
  document.addEventListener('click', (e) => {
    // 링크 클릭은 기본 동작 (새 탭에서 열기)
    if (e.target.closest('a')) {
      return; // 링크 클릭은 그대로 진행
    }
    
    // 체크박스 클릭은 위의 change 이벤트에서 처리
    if (e.target.classList.contains('result-checkbox') || e.target.closest('.result-checkbox')) {
      return;
    }
    
    // 카드의 다른 부분 클릭 시 선택 토글
    const card = e.target.closest('.result-card');
    if (card) {
      const cardId = card.dataset.id;
      const checkbox = card.querySelector('.result-checkbox');
      if (checkbox) {
        checkbox.checked = !checkbox.checked;
        checkbox.dispatchEvent(new Event('change'));
      }
    }
  });
}

/**
 * 검색 수행
 */
async function performSearch() {
  const query = document.getElementById('researchQuery').value.trim();
  
  if (!query) {
    alert('검색어를 입력해주세요');
    return;
  }
  
  const searchWeb = document.getElementById('sourceWeb').checked;
  const searchPapers = document.getElementById('sourcePapers').checked;
  
  if (!searchWeb && !searchPapers) {
    alert('최소 하나의 검색 소스를 선택해주세요');
    return;
  }
  
  // UI 업데이트
  document.getElementById('emptyState').style.display = 'none';
  document.getElementById('resultsSection').style.display = 'none';
  document.getElementById('loadingState').style.display = 'block';
  document.getElementById('searchBtn').disabled = true;
  
  try {
    // Background에 검색 요청
    console.log('[Research Popup] 검색 요청:', query, { web: searchWeb, papers: searchPapers });
    
    const response = await chrome.runtime.sendMessage({
      action: 'research:search',
      query: query,
      sources: {
        web: searchWeb,
        papers: searchPapers
      }
    });
    
    console.log('[Research Popup] 검색 응답:', response);
    
    if (chrome.runtime.lastError) {
      console.error('[Research Popup] Runtime 오류:', chrome.runtime.lastError);
      alert('검색 중 오류가 발생했습니다: ' + chrome.runtime.lastError.message);
      return;
    }
    
    if (response && response.success) {
      searchResults = response.results || [];
      selectedResults = [];
      console.log('[Research Popup] 검색 결과:', searchResults.length, '개');
      sortAndDisplayResults();
      document.getElementById('resultsSection').style.display = 'block';
      updateSelectionUI();
    } else {
      const errorMsg = response?.error || '알 수 없는 오류';
      console.error('[Research Popup] 검색 실패:', errorMsg);
      alert('검색 실패: ' + errorMsg);
    }
  } catch (error) {
    console.error('[Research Popup] 검색 오류:', error);
    alert('검색 중 오류가 발생했습니다: ' + error.message);
  } finally {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('searchBtn').disabled = false;
  }
}

/**
 * 결과 정렬 및 표시
 */
function sortAndDisplayResults() {
  const sortBy = document.getElementById('sortBy').value;
  
  let sorted = [...searchResults];
  
  switch(sortBy) {
    case 'credibility':
      sorted.sort((a, b) => (b.credibilityScore || 0) - (a.credibilityScore || 0));
      break;
    case 'relevance':
      sorted.sort((a, b) => (b.score || 0) - (a.score || 0));
      break;
    case 'date':
      sorted.sort((a, b) => {
        const yearA = a.year || 0;
        const yearB = b.year || 0;
        return yearB - yearA;
      });
      break;
  }
  
  displayResults(sorted);
  updateResultsCount(sorted.length);
}

/**
 * 결과 표시
 */
function displayResults(results) {
  const resultsList = document.getElementById('resultsList');
  
  if (results.length === 0) {
    resultsList.innerHTML = '<p style="text-align: center; color: #9ca3af; padding: 40px;">검색 결과가 없습니다</p>';
    updateSelectionUI();
    return;
  }
  
  resultsList.innerHTML = results.map(result => {
    const isSelected = selectedResults.includes(result.id);
    const grade = result.credibilityGrade || { grade: 'C', label: '보통', color: 'medium' };
    
    return `
      <div class="result-card ${isSelected ? 'selected' : ''}" data-id="${result.id}">
        <div class="result-card-checkbox">
          <input type="checkbox" class="result-checkbox" data-id="${result.id}" ${isSelected ? 'checked' : ''}>
        </div>
        <div class="result-card-content">
          <div class="result-card-header">
            <div class="result-title">
              <a href="${result.url}" target="_blank" rel="noopener noreferrer" class="result-link">${escapeHtml(result.title)}</a>
            </div>
            <div class="result-badges">
              <span class="result-badge badge-type">${result.type === 'paper' ? '📄 논문' : '🌐 웹'}</span>
              <span class="result-badge badge-credibility ${grade.color}">${grade.grade}등급 (${result.credibilityScore || 0}점)</span>
            </div>
          </div>
          <div class="result-content">${escapeHtml(result.content || '')}</div>
          <div class="result-meta">
            <div class="result-source">
              <span>${result.domain || result.source}</span>
              ${result.year ? `<span>• ${result.year}년</span>` : ''}
              ${result.citationCount ? `<span>• 인용 ${result.citationCount}회</span>` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  updateSelectionUI();
}

/**
 * 결과 개수 업데이트
 */
function updateResultsCount(count) {
  document.getElementById('resultsCount').textContent = `${count}개`;
}

/**
 * 결과 선택 토글
 */
function toggleResultSelection(id) {
  const index = selectedResults.indexOf(id);
  if (index > -1) {
    selectedResults.splice(index, 1);
  } else {
    selectedResults.push(id);
  }
  updateSelectionUI();
}

/**
 * 전체 선택
 */
function selectAllResults() {
  selectedResults = searchResults.map(r => r.id);
  updateSelectionUI();
}

/**
 * 전체 해제
 */
function deselectAllResults() {
  selectedResults = [];
  updateSelectionUI();
}

/**
 * 선택 UI 업데이트
 */
function updateSelectionUI() {
  // 전체 선택 체크박스 업데이트
  const selectAllCheckbox = document.getElementById('selectAllCheckbox');
  if (selectAllCheckbox) {
    const allSelected = searchResults.length > 0 && selectedResults.length === searchResults.length;
    const someSelected = selectedResults.length > 0 && selectedResults.length < searchResults.length;
    
    selectAllCheckbox.checked = allSelected;
    selectAllCheckbox.indeterminate = someSelected;
  }
  
  // 개별 체크박스 업데이트
  document.querySelectorAll('.result-checkbox').forEach(checkbox => {
    const cardId = checkbox.dataset.id;
    checkbox.checked = selectedResults.includes(cardId);
  });
  
  // 카드 selected 클래스 업데이트
  document.querySelectorAll('.result-card').forEach(card => {
    const cardId = card.dataset.id;
    if (selectedResults.includes(cardId)) {
      card.classList.add('selected');
    } else {
      card.classList.remove('selected');
    }
  });
  
  // 선택된 개수 표시
  const selectedCountEl = document.getElementById('selectedCount');
  const exportCountEl = document.getElementById('exportCount');
  if (selectedCountEl) {
    selectedCountEl.textContent = `선택됨: ${selectedResults.length}개`;
  }
  if (exportCountEl) {
    exportCountEl.textContent = selectedResults.length;
  }
}

/**
 * 노션에 내보내기
 */
async function exportToNotion() {
  if (selectedResults.length === 0) {
    alert('내보낼 자료를 선택해주세요 (체크박스 선택 또는 카드 클릭)');
    return;
  }
  
  const selected = searchResults.filter(r => selectedResults.includes(r.id));
  
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'research:export-notion',
      results: selected,
      query: document.getElementById('researchQuery').value
    });
    
    if (response.success) {
      alert('노션에 성공적으로 정리되었습니다!');
    } else {
      alert('노션 내보내기 실패: ' + (response.error || '알 수 없는 오류'));
    }
  } catch (error) {
    console.error('노션 내보내기 오류:', error);
    alert('노션 내보내기 중 오류가 발생했습니다: ' + error.message);
  }
}

/**
 * 결과 지우기
 */
function clearResults() {
  if (confirm('검색 결과를 모두 지우시겠습니까?')) {
    searchResults = [];
    selectedResults = [];
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('emptyState').style.display = 'block';
    document.getElementById('researchQuery').value = '';
    updateSelectionUI();
  }
}

/**
 * 저장된 결과 로드
 */
function loadSavedResults() {
  chrome.storage.local.get(['researchResults'], (result) => {
    if (result.researchResults) {
      searchResults = result.researchResults;
      selectedResults = [];
      if (searchResults.length > 0) {
        sortAndDisplayResults();
        document.getElementById('resultsSection').style.display = 'block';
        document.getElementById('emptyState').style.display = 'none';
        updateSelectionUI();
      }
    }
  });
}

/**
 * HTML 이스케이프
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

