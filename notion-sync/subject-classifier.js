/**
 * AI 과목 자동 분류 모듈
 * GPT를 사용해서 드래그한 텍스트가 어떤 과목/분야인지 분류
 */

const SubjectClassifier = {
  /**
   * 텍스트와 페이지 맥락을 분석해서 과목 분류
   * @param {string} selectedText - 드래그한 텍스트
   * @param {Object} pageContext - 페이지 맥락 정보
   * @returns {Promise<string>} 분류된 과목명
   */
  async classify(selectedText, pageContext) {
    try {
      console.log('🤖 AI 과목 분류 시작...');

      // Background script에 GPT 요청
      const response = await chrome.runtime.sendMessage({
        action: 'notion:classify-subject',
        data: {
          selectedText,
          pageTitle: pageContext.title,
          pageUrl: pageContext.url
        }
      });

      if (response.error) {
        console.error('과목 분류 실패:', response.error);
        return this.getFallbackSubject(pageContext);
      }

      console.log('✅ 분류 완료:', response.subject);
      return response.subject;
    } catch (error) {
      console.error('과목 분류 오류:', error);
      return this.getFallbackSubject(pageContext);
    }
  },

  /**
   * GPT 프롬프트 생성
   */
  createPrompt(selectedText, pageTitle, pageUrl) {
    return `다음 텍스트가 어떤 과목/분야에 해당하는지 **한 단어로만** 답해줘.

📖 페이지 정보:
- 제목: ${pageTitle}
- URL: ${pageUrl}

📝 선택한 텍스트:
${selectedText.substring(0, 300)}${selectedText.length > 300 ? '...' : ''}

과목 예시:
- 컴퓨터: 프로그래밍, 데이터베이스, 알고리즘, 운영체제, 네트워크, 웹개발, 자료구조
- 수학: 미적분학, 선형대수, 통계학, 이산수학
- 언어: 영어, 일본어, 중국어
- 기타: 경제학, 물리학, 화학, 생물학, 심리학 등

**규칙:**
1. 반드시 **한 단어**로만 답할 것 (예: "데이터베이스", "영어")
2. 학문 분야를 구체적으로 (예: "컴퓨터" 대신 "데이터베이스")
3. 한글로 답할 것
4. 추가 설명 없이 과목명만

과목명:`;
  },

  /**
   * GPT 실패 시 URL/제목 기반 폴백 분류
   */
  getFallbackSubject(pageContext) {
    const url = pageContext.url.toLowerCase();
    const title = pageContext.title.toLowerCase();
    const combined = url + ' ' + title;

    // URL/제목 키워드 매칭
    const keywords = {
      '프로그래밍': ['programming', 'code', 'python', 'java', 'javascript', 'github'],
      '데이터베이스': ['database', 'sql', 'mysql', 'postgresql', 'mongodb'],
      '알고리즘': ['algorithm', 'leetcode', 'baekjoon', '백준', '알고리즘'],
      '네트워크': ['network', 'http', 'tcp', 'ip', 'socket'],
      '운영체제': ['os', 'operating system', 'linux', 'unix', 'windows'],
      '웹개발': ['react', 'vue', 'angular', 'html', 'css', 'frontend', 'backend'],
      '영어': ['english', 'vocabulary', 'grammar', '영어', 'toeic', 'toefl'],
      '수학': ['math', 'calculus', '수학', 'linear algebra', 'statistics'],
      '물리학': ['physics', '물리'],
      '경제학': ['economics', '경제'],
    };

    for (const [subject, terms] of Object.entries(keywords)) {
      if (terms.some(term => combined.includes(term))) {
        console.log(`📌 키워드 기반 분류: ${subject}`);
        return subject;
      }
    }

    // 기본값
    console.log('📌 기본 분류: 학습자료');
    return '학습자료';
  },

  /**
   * 사용자가 직접 입력한 과목을 최근 사용 목록에 저장
   */
  async saveRecentSubject(subject) {
    try {
      const result = await chrome.storage.local.get(['recentSubjects']);
      let recentSubjects = result.recentSubjects || [];

      // 중복 제거 및 최신 항목을 앞에 추가
      recentSubjects = recentSubjects.filter(s => s !== subject);
      recentSubjects.unshift(subject);

      // 최대 10개까지만 저장
      if (recentSubjects.length > 10) {
        recentSubjects = recentSubjects.slice(0, 10);
      }

      await chrome.storage.local.set({ recentSubjects });
    } catch (error) {
      console.error('최근 과목 저장 실패:', error);
    }
  },

  /**
   * 최근 사용한 과목 목록 가져오기
   */
  async getRecentSubjects() {
    try {
      const result = await chrome.storage.local.get(['recentSubjects']);
      return result.recentSubjects || [];
    } catch (error) {
      console.error('최근 과목 불러오기 실패:', error);
      return [];
    }
  }
};

// Content script에서 사용 가능하도록 전역 객체로 노출
if (typeof window !== 'undefined') {
  window.SubjectClassifier = SubjectClassifier;
}

