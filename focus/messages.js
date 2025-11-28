/**
 * 하드코딩된 잔소리 문구들
 */

const WARNING_MESSAGES = {
  // 1분 경과
  minute1: [
    "조금만 더 보면 안 될까요? 🤔",
    "아직 1분이에요, 괜찮아요!",
    "이제 돌아갈 시간이에요~"
  ],
  
  // 3분 경과
  minute3: [
    "벌써 3분이에요... 😅",
    "조금만 더 보면 안 될까요?",
    "공부할 시간이에요!"
  ],
  
  // 5분 경과
  minute5: [
    "야, {subject} 해야 한다며? 😤",
    "벌써 5분이에요! 돌아와요!",
    "{subject} 공부 안 할 거예요?",
    "5분이나 지났어요! 😱"
  ],
  
  // 10분 경과
  minute10: [
    "진짜로 그만하세요! 😡",
    "10분이나 딴짓했어요!",
    "{subject} 목표 달성 포기하시는 거예요?",
    "이제 정말 돌아와야 해요!"
  ],
  
  // 15분 경과
  minute15: [
    "15분이에요! 정말 심각해요! 😠",
    "목표 시간이 줄어들고 있어요!",
    "이대로 가면 목표 달성 못 해요!"
  ],
  
  // 30분 경과
  minute30: [
    "30분이나 지났어요! 😱",
    "목표의 절반을 딴짓으로 보냈어요!",
    "정말 심각한 상황이에요!"
  ]
};

/**
 * 경고 메시지 가져오기
 */
function getWarningMessage(duration, subject) {
  let messages;
  
  if (duration >= 30) {
    messages = WARNING_MESSAGES.minute30;
  } else if (duration >= 15) {
    messages = WARNING_MESSAGES.minute15;
  } else if (duration >= 10) {
    messages = WARNING_MESSAGES.minute10;
  } else if (duration >= 5) {
    messages = WARNING_MESSAGES.minute5;
  } else if (duration >= 3) {
    messages = WARNING_MESSAGES.minute3;
  } else {
    messages = WARNING_MESSAGES.minute1;
  }
  
  // 랜덤 선택
  const message = messages[Math.floor(Math.random() * messages.length)];
  
  // {subject} 치환
  return message.replace('{subject}', subject || '공부');
}

// 전역으로 노출
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getWarningMessage };
}

