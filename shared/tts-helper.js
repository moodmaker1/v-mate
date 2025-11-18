/**
 * shared/tts-helper.js
 * ElevenLabs TTS 헬퍼 함수 (content script에서 사용)
 */

// 전역 오디오 객체 (재생/일시정지 제어용)
let currentAudio = null;
let currentAudioButton = null;
let currentAudioText = null;

/**
 * 음성 재생/일시정지 토글
 * @param {string} text - 읽을 텍스트
 * @param {HTMLButtonElement} button - 버튼 요소
 */
async function playTextToSpeech(text, button = null) {
  // 이미 같은 텍스트가 재생 중이면 일시정지/재개
  if (currentAudio && currentAudioText === text) {
    toggleAudioPlayback(button);
    return;
  }
  
  // 다른 오디오가 재생 중이면 정지
  if (currentAudio) {
    stopCurrentAudio();
  }
  
  // 새로운 오디오 생성
  await generateAndPlayAudio(text, button);
}

/**
 * 재생/일시정지 토글
 */
function toggleAudioPlayback(button) {
  if (!currentAudio) return;
  
  if (currentAudio.paused) {
    // 재생
    currentAudio.play();
    if (button) {
      button.innerHTML = '⏸ 일시정지';
      button.classList.add('playing');
    }
    console.log('TTS 재개');
  } else {
    // 일시정지
    currentAudio.pause();
    if (button) {
      button.innerHTML = '▶️ 계속 듣기';
      button.classList.remove('playing');
    }
    console.log('TTS 일시정지');
  }
}

/**
 * 현재 오디오 정지 및 정리
 */
function stopCurrentAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    
    // 메모리 정리
    if (currentAudio.src && currentAudio.src.startsWith('blob:')) {
      URL.revokeObjectURL(currentAudio.src);
    }
    
    currentAudio = null;
  }
  
  // 버튼 초기화
  if (currentAudioButton) {
    currentAudioButton.disabled = false;
    currentAudioButton.innerHTML = '🔊 음성으로 듣기';
    currentAudioButton.classList.remove('playing');
    currentAudioButton = null;
  }
  
  currentAudioText = null;
}

/**
 * 새 오디오 생성 및 재생
 */
async function generateAndPlayAudio(text, button = null) {
  try {
    // API 키는 Chrome Storage에서, 보이스 ID는 항상 config.js에서
    const result = await chrome.storage.local.get(['elevenlabsApiKey']);
    let apiKey = result.elevenlabsApiKey;
    
    // 보이스 ID는 config.js에서만 (기본값)
    let voiceId = 'uyVNoMrnUku1dZyVEXwD';
    
    if (!apiKey) {
      throw new Error('ElevenLabs API 키가 설정되지 않았습니다.\n확장 프로그램 팝업에서 설정해주세요.');
    }
    
    // 버튼 상태: 로딩
    if (button) {
      button.disabled = true;
      button.innerHTML = '⏳ 음성 생성 중...';
    }
    
    console.log('ElevenLabs TTS 호출 중...');
    
    // ElevenLabs API 호출
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',  // 한국어 지원
          voice_settings: {
            stability: 0.45,              // 자연스러운 표현력 (낮을수록 다양한 억양)
            similarity_boost: 0.85,       // 원본 목소리 충실히 재현
            style: 0.25,                  // 약간의 감정 표현 (너무 높으면 과장)
            use_speaker_boost: true       // 명확한 발음
          }
        })
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API 오류: ${response.status} - ${errorText}`);
    }
    
    // 오디오 Blob 받기
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    
    // 오디오 생성
    const audio = new Audio(audioUrl);
    
    // 전역 변수에 저장
    currentAudio = audio;
    currentAudioButton = button;
    currentAudioText = text;
    
    // 버튼 상태: 재생 중
    if (button) {
      button.innerHTML = '⏸ 일시정지';
      button.classList.add('playing');  // 애니메이션 추가
    }
    
    // 재생 시작
    audio.play();
    console.log('TTS 재생 시작');
    
    // 재생 완료 시
    audio.onended = () => {
      console.log('TTS 재생 완료');
      
      // 메모리 정리
      URL.revokeObjectURL(audioUrl);
      
      // 버튼 원래대로
      if (button) {
        button.disabled = false;
        button.innerHTML = '🔊 음성으로 듣기';
        button.classList.remove('playing');
      }
      
      // 전역 변수 정리
      currentAudio = null;
      currentAudioButton = null;
      currentAudioText = null;
    };
    
    // 재생 에러 시
    audio.onerror = (e) => {
      console.error('오디오 재생 실패:', e);
      URL.revokeObjectURL(audioUrl);
      stopCurrentAudio();
      alert('음성 재생에 실패했습니다.');
    };
    
    return audio;
    
  } catch (error) {
    console.error('TTS 오류:', error);
    
    if (button) {
      button.disabled = false;
      button.innerHTML = '🔊 음성으로 듣기';
    }
    
    alert('음성 생성에 실패했습니다.\n' + error.message);
    throw error;
  }
}

