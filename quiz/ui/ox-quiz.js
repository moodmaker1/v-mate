/**
 * quiz/ui/ox-quiz.js
 * OX 퀴즈 UI 컴포넌트
 */

/**
 * OX 퀴즈 데이터 파싱
 */
function parseOXQuiz(rawContent) {
  const lines = rawContent.split('\n').map(line => line.trim()).filter(line => line);
  
  let question = '';
  let answer = '';
  let explanation = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.includes('문제:') || line.includes('Question:')) {
      question = line.replace(/문제:|Question:/gi, '').trim();
      // 다음 줄도 포함될 수 있음
      if (i + 1 < lines.length && !lines[i + 1].includes('정답') && !lines[i + 1].includes('해설')) {
        question += ' ' + lines[i + 1];
      }
    }
    else if (line.includes('정답:') || line.includes('Answer:')) {
      answer = line.replace(/정답:|Answer:/gi, '').trim().toUpperCase();
      // O, X만 추출
      if (answer.includes('O') && !answer.includes('X')) answer = 'O';
      else if (answer.includes('X')) answer = 'X';
    }
    else if (line.includes('해설:') || line.includes('설명:') || line.includes('Explanation:')) {
      explanation = line.replace(/해설:|설명:|Explanation:/gi, '').trim();
      // 다음 줄들도 포함
      for (let j = i + 1; j < lines.length; j++) {
        if (!lines[j].includes(':')) {
          explanation += ' ' + lines[j];
        }
      }
    }
  }
  
  return { question, answer, explanation };
}

/**
 * OX 퀴즈 UI 생성
 */
function createOXQuizUI(quizData, rawContent) {
  const parsed = parseOXQuiz(rawContent);
  
  const container = document.createElement('div');
  container.className = 'vmate-quiz-ox-container';
  
  // 문제
  const questionDiv = document.createElement('div');
  questionDiv.className = 'vmate-quiz-question';
  questionDiv.textContent = parsed.question || '문제를 불러올 수 없습니다.';
  
  // 버튼 컨테이너
  const buttonsDiv = document.createElement('div');
  buttonsDiv.className = 'vmate-quiz-ox-buttons';
  
  // O 버튼
  const oButton = document.createElement('button');
  oButton.className = 'vmate-quiz-ox-btn vmate-quiz-ox-o';
  oButton.textContent = 'O';
  oButton.onclick = () => checkOXAnswer('O', parsed.answer, parsed.explanation, container);
  
  // X 버튼
  const xButton = document.createElement('button');
  xButton.className = 'vmate-quiz-ox-btn vmate-quiz-ox-x';
  xButton.textContent = 'X';
  xButton.onclick = () => checkOXAnswer('X', parsed.answer, parsed.explanation, container);
  
  buttonsDiv.appendChild(oButton);
  buttonsDiv.appendChild(xButton);
  
  container.appendChild(questionDiv);
  container.appendChild(buttonsDiv);
  
  return container;
}

/**
 * OX 정답 확인
 */
function checkOXAnswer(userAnswer, correctAnswer, explanation, container) {
  // 버튼 비활성화
  const buttons = container.querySelectorAll('.vmate-quiz-ox-btn');
  buttons.forEach(btn => btn.disabled = true);
  
  const isCorrect = userAnswer === correctAnswer;
  
  // 결과 표시
  const resultDiv = document.createElement('div');
  resultDiv.className = `vmate-quiz-result ${isCorrect ? 'correct' : 'wrong'}`;
  
  if (isCorrect) {
    resultDiv.innerHTML = `
      <div class="vmate-quiz-result-icon">✅</div>
      <div class="vmate-quiz-result-text">정답입니다!</div>
    `;
  } else {
    resultDiv.innerHTML = `
      <div class="vmate-quiz-result-icon">❌</div>
      <div class="vmate-quiz-result-text">틀렸습니다</div>
      <div class="vmate-quiz-correct-answer">정답: ${correctAnswer}</div>
    `;
  }
  
  // 해설
  if (explanation) {
    const explanationDiv = document.createElement('div');
    explanationDiv.className = 'vmate-quiz-explanation';
    explanationDiv.innerHTML = `<strong>💡 해설:</strong><br>${explanation}`;
    resultDiv.appendChild(explanationDiv);
  }
  
  // 다시 풀기 버튼
  const retryBtn = document.createElement('button');
  retryBtn.className = 'vmate-quiz-retry-btn';
  retryBtn.textContent = '다시 풀기';
  retryBtn.onclick = () => {
    resultDiv.remove();
    buttons.forEach(btn => btn.disabled = false);
  };
  resultDiv.appendChild(retryBtn);
  
  container.appendChild(resultDiv);
  
  // 선택한 버튼 하이라이트
  buttons.forEach(btn => {
    if (btn.textContent === userAnswer) {
      btn.classList.add(isCorrect ? 'selected-correct' : 'selected-wrong');
    }
  });
}

