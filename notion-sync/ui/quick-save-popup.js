/**
 * 노션 빠른 저장 팝업 UI
 * 드래그한 내용을 노션에 저장하기 위한 인터랙티브 팝업
 */

const QuickSavePopup = {
  /**
   * 빠른 저장 팝업 생성
   */
  create(selectedText, suggestedSubject, pageContext) {
    // 기존 팝업이 있다면 제거
    this.remove();

    const popup = document.createElement('div');
    popup.id = 'vmate-notion-popup';
    popup.className = 'vmate-notion-popup';
    
    popup.innerHTML = `
      <div class="vmate-notion-container">
        <!-- 헤더 -->
        <div class="vmate-notion-header">
          <h3>📚 노션에 저장</h3>
          <button class="vmate-notion-close" aria-label="닫기">✕</button>
        </div>
        
        <!-- 콘텐츠 -->
        <div class="vmate-notion-content">
          <!-- 과목/분야 입력 -->
          <div class="vmate-notion-form-group">
            <label>
              <span class="label-text">과목/분야</span>
              <span class="label-hint">AI가 자동으로 분류했어요 🤖</span>
            </label>
            <div class="subject-input-wrapper">
              <input type="text" 
                     class="vmate-notion-subject-input" 
                     value="${suggestedSubject}"
                     placeholder="예: 데이터베이스, 영어, 알고리즘">
              <div class="recent-subjects-dropdown" style="display: none;">
                <!-- 최근 사용한 과목 목록 -->
              </div>
            </div>
          </div>
          
          <!-- 선택한 내용 미리보기 -->
          <div class="vmate-notion-form-group">
            <label>
              <span class="label-text">선택한 내용</span>
              <span class="text-count">${selectedText.length}자</span>
            </label>
            <div class="vmate-notion-text-preview">
              ${this.escapeHtml(selectedText.substring(0, 200))}${selectedText.length > 200 ? '...' : ''}
            </div>
          </div>
          
          <!-- 메모 입력 (선택) -->
          <div class="vmate-notion-form-group">
            <label>
              <span class="label-text">💡 메모</span>
              <span class="label-hint">(선택사항)</span>
            </label>
            <textarea class="vmate-notion-note-input" 
                      placeholder="질문이나 생각을 적어보세요...
예: 이 개념이 실제로 어떻게 쓰이는지 궁금함
예: 시험 출제 가능성 높음"></textarea>
            <div class="note-helper">
              <span>💬 나중에 복습할 때 도움이 될 메모를 남겨보세요</span>
            </div>
          </div>
          
          <!-- 출처 정보 -->
          <div class="vmate-notion-source-info">
            <div class="source-icon">🔗</div>
            <div class="source-details">
              <div class="source-title">${this.escapeHtml(pageContext.title)}</div>
              <div class="source-url">${this.shortenUrl(pageContext.url)}</div>
            </div>
          </div>
          
          <!-- 저장 버튼 -->
          <button class="vmate-notion-save-btn">
            <span class="btn-icon">✅</span>
            <span class="btn-text">노션에 저장</span>
          </button>
          
          <!-- 로딩 상태 -->
          <div class="vmate-notion-loading" style="display: none;">
            <div class="loading-spinner"></div>
            <span>노션에 저장 중...</span>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(popup);
    
    // 이벤트 리스너 등록
    this.attachEventListeners(popup, selectedText, pageContext);
    
    // 애니메이션
    requestAnimationFrame(() => {
      popup.classList.add('vmate-notion-show');
    });

    // 과목 입력란에 포커스
    const subjectInput = popup.querySelector('.vmate-notion-subject-input');
    subjectInput.focus();
    subjectInput.select();

    // 최근 과목 목록 로드
    this.loadRecentSubjects(popup);

    return popup;
  },

  /**
   * 이벤트 리스너 등록
   */
  attachEventListeners(popup, selectedText, pageContext) {
    // 닫기 버튼
    const closeBtn = popup.querySelector('.vmate-notion-close');
    closeBtn.addEventListener('click', () => this.remove());

    // ESC 키로 닫기
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        this.remove();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);

    // 외부 클릭으로 닫기
    popup.addEventListener('click', (e) => {
      if (e.target === popup) {
        this.remove();
      }
    });

    // 저장 버튼
    const saveBtn = popup.querySelector('.vmate-notion-save-btn');
    saveBtn.addEventListener('click', () => this.handleSave(popup, selectedText, pageContext));

    // Enter 키로 저장 (textarea 제외)
    popup.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        this.handleSave(popup, selectedText, pageContext);
      }
    });

    // 과목 입력란 포커스 시 최근 목록 표시
    const subjectInput = popup.querySelector('.vmate-notion-subject-input');
    const dropdown = popup.querySelector('.recent-subjects-dropdown');
    
    subjectInput.addEventListener('focus', () => {
      dropdown.style.display = 'block';
    });

    subjectInput.addEventListener('blur', () => {
      // 드롭다운 클릭을 위해 약간 지연
      setTimeout(() => {
        dropdown.style.display = 'none';
      }, 200);
    });
  },

  /**
   * 저장 처리
   */
  async handleSave(popup, selectedText, pageContext) {
    try {
      const subjectInput = popup.querySelector('.vmate-notion-subject-input');
      const noteInput = popup.querySelector('.vmate-notion-note-input');
      const saveBtn = popup.querySelector('.vmate-notion-save-btn');
      const loading = popup.querySelector('.vmate-notion-loading');

      const subject = subjectInput.value.trim();
      const note = noteInput.value.trim();

      if (!subject) {
        subjectInput.focus();
        subjectInput.classList.add('error-shake');
        setTimeout(() => subjectInput.classList.remove('error-shake'), 500);
        return;
      }

      // 로딩 상태
      saveBtn.style.display = 'none';
      loading.style.display = 'flex';

      // Notion API 호출
      const result = await NotionAPI.saveToNotion({
        subject,
        selectedText,
        note,
        pageUrl: pageContext.url,
        pageTitle: pageContext.title,
        timestamp: Date.now()
      });

      // 최근 과목에 저장
      await SubjectClassifier.saveRecentSubject(subject);

      // 성공 토스트
      this.showToast('✅ 노션에 저장 완료!', 'success');
      
      // 팝업 닫기
      this.remove();

      console.log('✅ Notion 저장 성공:', result);
    } catch (error) {
      console.error('❌ Notion 저장 실패:', error);
      
      // 에러 토스트
      this.showToast(`❌ 저장 실패: ${error.message}`, 'error');
      
      // 버튼 다시 표시
      const saveBtn = popup.querySelector('.vmate-notion-save-btn');
      const loading = popup.querySelector('.vmate-notion-loading');
      saveBtn.style.display = 'block';
      loading.style.display = 'none';
    }
  },

  /**
   * 최근 사용한 과목 목록 로드
   */
  async loadRecentSubjects(popup) {
    const recentSubjects = await SubjectClassifier.getRecentSubjects();
    const dropdown = popup.querySelector('.recent-subjects-dropdown');
    const subjectInput = popup.querySelector('.vmate-notion-subject-input');

    if (recentSubjects.length === 0) {
      dropdown.innerHTML = '<div class="dropdown-empty">최근 사용한 과목이 없습니다</div>';
      return;
    }

    dropdown.innerHTML = recentSubjects.map(subject => `
      <div class="dropdown-item" data-subject="${this.escapeHtml(subject)}">
        📌 ${this.escapeHtml(subject)}
      </div>
    `).join('');

    // 과목 선택 이벤트
    dropdown.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('click', () => {
        subjectInput.value = item.dataset.subject;
        dropdown.style.display = 'none';
      });
    });
  },

  /**
   * 토스트 알림 표시
   */
  showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `vmate-notion-toast vmate-notion-toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    requestAnimationFrame(() => {
      toast.classList.add('vmate-notion-toast-show');
    });

    setTimeout(() => {
      toast.classList.remove('vmate-notion-toast-show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  /**
   * 팝업 제거
   */
  remove() {
    const popup = document.getElementById('vmate-notion-popup');
    if (popup) {
      popup.classList.remove('vmate-notion-show');
      setTimeout(() => popup.remove(), 300);
    }
  },

  /**
   * HTML 이스케이프
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  /**
   * URL 단축
   */
  shortenUrl(url) {
    if (url.length > 60) {
      return url.substring(0, 57) + '...';
    }
    return url;
  }
};

// Content script에서 사용 가능하도록 전역 객체로 노출
if (typeof window !== 'undefined') {
  window.QuickSavePopup = QuickSavePopup;
}

