/**
 * config.example.js
 * API 키 설정 템플릿 파일
 * 
 * 사용 방법:
 * 1. 이 파일을 복사하여 'config.js' 파일을 만듭니다
 * 2. YOUR_API_KEY_HERE를 실제 API 키로 교체합니다
 * 3. config.js는 git에 커밋되지 않습니다 (.gitignore에 포함)
 */

const CONFIG = {
  // OpenAI GPT API (필수)
  OPENAI_API_KEY: 'YOUR_OPENAI_API_KEY_HERE',
  
  // ElevenLabs TTS API (선택)
  ELEVENLABS_API_KEY: 'YOUR_ELEVENLABS_API_KEY_HERE',
  ELEVENLABS_VOICE_ID: 'uyVNoMrnUku1dZyVEXwD',  // 보이스 ID
  
  // Notion API (선택)
  NOTION_TOKEN: 'YOUR_NOTION_INTEGRATION_TOKEN_HERE',  // secret_xxxxx
  NOTION_PARENT_PAGE_ID: 'YOUR_NOTION_PAGE_ID_HERE'    // 상위 페이지 ID (32자리)
};

// background.js에서 사용할 수 있도록 내보내기
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}

