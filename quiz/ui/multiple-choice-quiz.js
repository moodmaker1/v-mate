/**
 * quiz/ui/multiple-choice-quiz.js
 * 객관식 퀴즈 UI 컴포넌트
 */

/**
 * 객관식 퀴즈 데이터 파싱
 */
function parseMultipleChoiceQuiz(rawContent) {
  const lines = rawContent.split('\n').map(line => line.trim()).filter(line => line);
  
  let question = '';
  let options = [];
  let correctAnswer = 0;
  let explanation = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.includes('질문:') || line.includes('Question:')) {
      question = line.replace(/질문:|Question:/gi, '').trim();
    }
    // 보기 (1), 2), 3), 4) 형식)
    else if (/^[1-4][).\s]/.test(line)) {
      const optionText = line.replace(/^[1-4][).\s]+/, '').trim();
      options.push(optionText);
    }
    // 정답
    else if (line.includes('정답:') || line.includes('Answer:')) {
      const answerText = line.replace(/정답:|Answer:/gi, '').trim();
      // 숫자 추출 (1, 2, 3, 4)
      const match = answerText.match(/[1-4]/);
      if (match) {
        correctAnswer = parseInt(match[0]) - 1; // 0-based index
      }
    }
    // 해설
    else if (line.includes('해설:') || line.includes('설명:') || line.includes('Explanation:')) {
      explanation = line.replace(/해설:|설명:|Explanation:/gi, '').trim();
      for (let j = i + 1; j < lines.length; j++) {
        if (!lines[j].includes(':') && lines[j].length > 0) {
          explanation += ' ' + lines[j];
        }
      }
    }
  }
  
  return { question, options, correctAnswer, explanation };
}

/**
 * 객관식 퀴즈 UI 생성
 */
function createMultipleChoiceQuizUI(quizData, rawContent) {
  const parsed = parseMultipleChoiceQuiz(rawContent);
  
  const container = document.createElement('div');
  container.className = 'vmate-quiz-mc-container';
  
  // 질문
  const questionDiv = document.createElement('div');
  questionDiv.className = 'vmate-quiz-question';
  questionDiv.textContent = parsed.question || '질문을 불러올 수 없습니다.';
  
  // 선택지
  const optionsDiv = document.createElement('div');
  optionsDiv.className = 'vmate-quiz-mc-options';
  
  parsed.options.forEach((option, index) => {
    const optionLabel = document.createElement('label');
    optionLabel.className = 'vmate-quiz-mc-option';
    
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'mc-quiz';
    radio.value = index;
    radio.id = `mc-option-${index}`;
    
    const span = document.createElement('span');
    span.textContent = `${index + 1}) ${option}`;
    
    optionLabel.appendChild(radio);
    optionLabel.appendChild(span);
    optionsDiv.appendChild(optionLabel);
  });
  
  // 정답 확인 버튼
  const submitBtn = document.createElement('button');
  submitBtn.className = 'vmate-quiz-submit-btn';
  submitBtn.textContent = '정답 확인하기';
  submitBtn.onclick = () => checkMultipleChoiceAnswer(parsed, container);
  
  container.appendChild(questionDiv);
  container.appendChild(optionsDiv);
  container.appendChild(submitBtn);
  
  return container;
}

/**
 * 객관식 정답 확인
 */
function checkMultipleChoiceAnswer(parsed, container) {
  const selectedRadio = container.querySelector('input[name="mc-quiz"]:checked');
  
  if (!selectedRadio) {
    alert('답을 선택해주세요!');
    return;
  }
  
  const userAnswer = parseInt(selectedRadio.value);
  const isCorrect = userAnswer === parsed.correctAnswer;
  
  // 라디오 버튼 비활성화
  const radios = container.querySelectorAll('input[name="mc-quiz"]');
  radios.forEach(radio => radio.disabled = true);
  
  // 버튼 비활성화
  const submitBtn = container.querySelector('.vmate-quiz-submit-btn');
  submitBtn.disabled = true;
  
  // 선택지에 정답/오답 표시
  const options = container.querySelectorAll('.vmate-quiz-mc-option');
  options.forEach((option, index) => {
    if (index === parsed.correctAnswer) {
      option.classList.add('correct-answer');
    }
    if (index === userAnswer && !isCorrect) {
      option.classList.add('wrong-answer');
    }
  });
  
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
      <div class="vmate-quiz-correct-answer">정답: ${parsed.correctAnswer + 1}번</div>
    `;
  }
  
  // 해설
  if (parsed.explanation) {
    const explanationDiv = document.createElement('div');
    explanationDiv.className = 'vmate-quiz-explanation';
    explanationDiv.innerHTML = `<strong>💡 해설:</strong><br>${parsed.explanation}`;
    resultDiv.appendChild(explanationDiv);
  }
  
  // 다시 풀기 버튼
  const retryBtn = document.createElement('button');
  retryBtn.className = 'vmate-quiz-retry-btn';
  retryBtn.textContent = '다시 풀기';
  retryBtn.onclick = () => {
    resultDiv.remove();
    radios.forEach(radio => {
      radio.disabled = false;
      radio.checked = false;
    });
    submitBtn.disabled = false;
    options.forEach(option => {
      option.classList.remove('correct-answer', 'wrong-answer');
    });
  };
  resultDiv.appendChild(retryBtn);
  
  container.appendChild(resultDiv);
}

