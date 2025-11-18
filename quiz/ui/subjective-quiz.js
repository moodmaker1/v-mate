/**
 * quiz/ui/subjective-quiz.js
 * 서술형 퀴즈 UI 컴포넌트
 */

/**
 * 서술형 퀴즈 데이터 파싱
 */
function parseSubjectiveQuiz(rawContent) {
  const lines = rawContent.split('\n').map(line => line.trim()).filter(line => line);
  
  let question = '';
  let modelAnswer = '';
  let keywords = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.includes('문제:') || line.includes('Question:')) {
      question = line.replace(/문제:|Question:/gi, '').trim();
      // 다음 줄도 포함될 수 있음
      if (i + 1 < lines.length && !lines[i + 1].includes('모범') && !lines[i + 1].includes('채점')) {
        question += ' ' + lines[i + 1];
      }
    }
    else if (line.includes('모범답안:') || line.includes('모범 답안:') || line.includes('Answer:')) {
      modelAnswer = line.replace(/모범답안:|모범 답안:|Answer:/gi, '').trim();
      // 다음 줄들도 포함
      for (let j = i + 1; j < lines.length; j++) {
        if (!lines[j].includes('채점') && !lines[j].includes('키워드') && lines[j].length > 0) {
          if (!lines[j].includes(':')) {
            modelAnswer += ' ' + lines[j];
          } else {
            break;
          }
        } else {
          break;
        }
      }
    }
    else if (line.includes('채점기준:') || line.includes('키워드:') || line.includes('Keywords:')) {
      const keywordText = line.replace(/채점기준:|키워드:|Keywords:/gi, '').trim();
      // 콤마, 쉼표로 분리
      keywords = keywordText.split(/[,、]/gi).map(k => k.trim()).filter(k => k);
      
      // 다음 줄에도 키워드가 있을 수 있음
      if (i + 1 < lines.length && !lines[i + 1].includes(':')) {
        const moreKeywords = lines[i + 1].split(/[,、]/gi).map(k => k.trim()).filter(k => k);
        keywords = keywords.concat(moreKeywords);
      }
    }
  }
  
  return { question, modelAnswer, keywords };
}

/**
 * 서술형 퀴즈 UI 생성
 */
function createSubjectiveQuizUI(quizData, rawContent) {
  const parsed = parseSubjectiveQuiz(rawContent);
  
  const container = document.createElement('div');
  container.className = 'vmate-quiz-sub-container';
  
  // 문제
  const questionDiv = document.createElement('div');
  questionDiv.className = 'vmate-quiz-question';
  questionDiv.textContent = parsed.question || '문제를 불러올 수 없습니다.';
  
  // 답변 입력란
  const textarea = document.createElement('textarea');
  textarea.className = 'vmate-quiz-sub-textarea';
  textarea.placeholder = '답변을 입력하세요...';
  textarea.rows = 5;
  
  // 글자 수 표시
  const charCount = document.createElement('div');
  charCount.className = 'vmate-quiz-char-count';
  charCount.textContent = '0자';
  
  textarea.addEventListener('input', () => {
    charCount.textContent = `${textarea.value.length}자`;
  });
  
  // 제출 버튼
  const submitBtn = document.createElement('button');
  submitBtn.className = 'vmate-quiz-submit-btn';
  submitBtn.textContent = '제출하기';
  submitBtn.onclick = () => checkSubjectiveAnswer(textarea.value, parsed, container, textarea, submitBtn);
  
  container.appendChild(questionDiv);
  container.appendChild(textarea);
  container.appendChild(charCount);
  container.appendChild(submitBtn);
  
  return container;
}

/**
 * 서술형 정답 채점
 */
function checkSubjectiveAnswer(userAnswer, parsed, container, textarea, submitBtn) {
  if (!userAnswer.trim()) {
    alert('답변을 입력해주세요!');
    return;
  }
  
  // 버튼/입력란 비활성화
  textarea.disabled = true;
  submitBtn.disabled = true;
  submitBtn.textContent = '채점 중...';
  
  // 간단한 키워드 기반 채점
  const score = calculateScore(userAnswer, parsed.keywords, parsed.modelAnswer);
  
  // 결과 표시
  displaySubjectiveResult(score, parsed, container, textarea, submitBtn);
}

/**
 * 점수 계산 (간단한 키워드 기반)
 */
function calculateScore(userAnswer, keywords, modelAnswer) {
  let score = 0;
  const maxScore = 100;
  
  if (keywords.length === 0) {
    // 키워드가 없으면 모범답안과 유사도로 판단
    const similarity = calculateSimilarity(userAnswer, modelAnswer);
    score = Math.round(similarity * 100);
  } else {
    // 키워드 기반 채점
    const foundKeywords = [];
    keywords.forEach(keyword => {
      if (userAnswer.includes(keyword)) {
        foundKeywords.push(keyword);
      }
    });
    
    score = Math.round((foundKeywords.length / keywords.length) * maxScore);
    
    // 최소 20점 보장
    if (score < 20 && userAnswer.length > 10) {
      score = 20;
    }
  }
  
  return { score, foundKeywords: keywords.filter(k => userAnswer.includes(k)) };
}

/**
 * 간단한 유사도 계산
 */
function calculateSimilarity(text1, text2) {
  const words1 = text1.split(/\s+/);
  const words2 = text2.split(/\s+/);
  
  let matchCount = 0;
  words1.forEach(word => {
    if (words2.some(w => w.includes(word) || word.includes(w))) {
      matchCount++;
    }
  });
  
  return matchCount / Math.max(words1.length, words2.length);
}

/**
 * 서술형 결과 표시
 */
function displaySubjectiveResult(scoreData, parsed, container, textarea, submitBtn) {
  const { score, foundKeywords } = scoreData;
  
  const resultDiv = document.createElement('div');
  resultDiv.className = 'vmate-quiz-result';
  
  // 점수에 따른 등급
  let grade = '';
  let emoji = '';
  if (score >= 80) {
    grade = '훌륭합니다!';
    emoji = '🌟';
    resultDiv.classList.add('correct');
  } else if (score >= 60) {
    grade = '좋습니다!';
    emoji = '✅';
    resultDiv.classList.add('correct');
  } else if (score >= 40) {
    grade = '괜찮습니다';
    emoji = '👍';
  } else {
    grade = '조금 더 보완이 필요합니다';
    emoji = '💪';
    resultDiv.classList.add('wrong');
  }
  
  resultDiv.innerHTML = `
    <div class="vmate-quiz-result-icon">${emoji}</div>
    <div class="vmate-quiz-result-text">${grade}</div>
    <div class="vmate-quiz-score">점수: ${score}/100</div>
  `;
  
  // 키워드 포함 여부
  if (parsed.keywords.length > 0) {
    const keywordDiv = document.createElement('div');
    keywordDiv.className = 'vmate-quiz-keyword-check';
    keywordDiv.innerHTML = `
      <strong>핵심 키워드 포함:</strong><br>
      ${parsed.keywords.map(k => 
        foundKeywords && foundKeywords.includes(k) 
          ? `<span class="keyword-found">✓ ${k}</span>` 
          : `<span class="keyword-missing">✗ ${k}</span>`
      ).join(' ')}
    `;
    resultDiv.appendChild(keywordDiv);
  }
  
  // 모범 답안
  if (parsed.modelAnswer) {
    const modelAnswerDiv = document.createElement('div');
    modelAnswerDiv.className = 'vmate-quiz-model-answer';
    modelAnswerDiv.innerHTML = `<strong>💡 모범 답안:</strong><br>${parsed.modelAnswer}`;
    resultDiv.appendChild(modelAnswerDiv);
  }
  
  // 다시 풀기 버튼
  const retryBtn = document.createElement('button');
  retryBtn.className = 'vmate-quiz-retry-btn';
  retryBtn.textContent = '다시 풀기';
  retryBtn.onclick = () => {
    resultDiv.remove();
    textarea.disabled = false;
    textarea.value = '';
    submitBtn.disabled = false;
    submitBtn.textContent = '제출하기';
    container.querySelector('.vmate-quiz-char-count').textContent = '0자';
  };
  resultDiv.appendChild(retryBtn);
  
  container.appendChild(resultDiv);
}

