# v-mate 💡

> 대학생을 위한 AI 학습 도우미 Chrome Extension

웹서핑 중 모르는 개념을 발견하면? **드래그 → 클릭 → 이해!**  
GPT가 설명해주고, 퀴즈로 확인하고, 음성으로 들을 수 있습니다.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Chrome](https://img.shields.io/badge/Chrome-88%2B-green)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

## ✨ 주요 기능

### 1️⃣ 실시간 맥락 이해 💡
- 텍스트 드래그 → 💡 보라색 아이콘 클릭
- GPT가 페이지 맥락을 고려해서 3-5줄로 쉽게 설명
- 🔊 음성으로 들을 수 있음 (재생/일시정지)

### 2️⃣ 스마트 퀴즈 생성기 ❓
- 텍스트 드래그 → ❓ 파란색 아이콘 클릭
- **⭕ OX 퀴즈** - O/X 버튼으로 즉시 정답 확인
- **📝 객관식 (4지선다)** - 선택지 선택 후 정답 확인
- **✏️ 서술형** - 답변 입력 + 키워드 기반 자동 채점 (0-100점)
- 🔊 해설도 음성으로 들을 수 있음

### 3️⃣ 자동 노션 정리 📚 ✨ NEW!
- 텍스트 드래그 → 📚 초록색 아이콘 클릭
- **AI가 과목 자동 분류** (데이터베이스, 영어, 알고리즘 등)
- 메모 추가 가능 (질문이나 생각 기록)
- 출처 링크 자동 첨부
- Notion 데이터베이스에 **즉시 저장**
- 📊 날짜별 타임라인 자동 생성

### 4️⃣ AI 음성 읽기 🎵
- ElevenLabs TTS로 자연스러운 한국어 음성
- 재생/일시정지 컨트롤
- 실시간 스트리밍 (저장 없음)

---

## 🚀 빠른 시작

### 1️⃣ Chrome에 설치

```bash
1. chrome://extensions/ 접속
2. 우측 상단 "개발자 모드" 활성화
3. "압축해제된 확장 프로그램을 로드합니다" 클릭
4. v-mate 폴더 선택
```

### 2️⃣ API 키 설정

#### 방법 A: config.js 파일 (개발자용 - 권장)

```javascript
// config.js 파일 수정
const CONFIG = {
  // OpenAI GPT API (필수)
  OPENAI_API_KEY: 'sk-proj-your-openai-key',
  
  // ElevenLabs TTS API (선택)
  ELEVENLABS_API_KEY: 'sk_your-elevenlabs-key',
  ELEVENLABS_VOICE_ID: 'uyVNoMrnUku1dZyVEXwD'
};
```

**API 키 발급:**
- OpenAI: https://platform.openai.com/api-keys
- ElevenLabs: https://elevenlabs.io/app/settings/api-keys

#### 방법 B: 확장 프로그램 팝업 (일반 사용자용)

```
1. Chrome 툴바에서 v-mate 아이콘 클릭
2. API 키 입력 후 "저장" 클릭
```

### 3️⃣ Notion 설정 (선택)

노션 정리 기능을 사용하려면:

```
1. https://www.notion.so/my-integrations 에서 Integration 생성
2. Notion 데이터베이스 만들고 Integration 연결
3. v-mate 팝업에서 Token과 Database ID 입력
4. "연결 테스트" → 저장
```

👉 상세 가이드: [notion-sync/README.md](notion-sync/README.md)

### 4️⃣ 모드 선택

```
확장 프로그램 아이콘 클릭
→ 🔘 실시간 설명 💡  or  ○ 퀴즈 모드 ❓  or  ○ 노션 정리 📚
```

### 5️⃣ 사용하기!

```
1. 웹페이지에서 텍스트 드래그 (3글자 이상)
2. 아이콘 클릭 (💡 또는 ❓ 또는 📚)
3. 설명 확인 / 퀴즈 풀기 / 노션 저장
4. 🔊 버튼으로 음성 듣기
```

---

## 📁 프로젝트 구조

```
v-mate/
├── manifest.json              # Chrome Extension 메인 설정
├── config.js                  # API 키 설정 (git 제외)
├── config.example.js          # API 키 템플릿
├── .gitignore                 # Git 제외 파일 목록
│
├── shared/                    # 공통 모듈
│   ├── background.js          # 메시지 라우터 (real-time ↔ quiz)
│   ├── gpt-api.js             # GPT API 공통 함수
│   └── tts-helper.js          # ElevenLabs TTS 함수
│
├── real-time/                 # 실시간 설명 모드 💡
│   ├── content.js             # 드래그 감지 + UI 제어
│   ├── styles.css             # 보라색 테마 스타일
│   └── icons/                 # 확장 프로그램 아이콘
│       ├── icon16.png
│       ├── icon48.png
│       └── icon128.png
│
├── quiz/                      # 퀴즈 모드 ❓
│   ├── content.js             # 퀴즈 생성 및 타입 선택 로직
│   ├── styles.css             # 파란색 테마 스타일
│   └── ui/                    # 퀴즈 타입별 UI 컴포넌트
│       ├── ox-quiz.js         # ⭕ OX 퀴즈 UI + 채점
│       ├── multiple-choice-quiz.js  # 📝 객관식 UI + 채점
│       └── subjective-quiz.js       # ✏️ 서술형 UI + 채점
│
├── notion-sync/               # 노션 정리 모드 📚 ✨ NEW!
│   ├── content.js             # 드래그 감지 + 노션 저장 로직
│   ├── styles.css             # 초록색 테마 스타일
│   ├── notion-api.js          # Notion API 연동
│   ├── subject-classifier.js  # AI 과목 자동 분류
│   ├── README.md              # 노션 설정 가이드
│   └── ui/
│       └── quick-save-popup.js  # 빠른 저장 팝업
│
└── popup/                     # 설정 팝업
    ├── popup.html             # 모드 선택 + API 키 입력
    ├── popup.js               # 모드 전환 + 설정 저장 로직
    └── popup.css              # 팝업 스타일
```

---

## 🎯 사용 예시

### 실시간 설명 모드 💡

```
1. 모드: "실시간 설명" 선택
2. 위키백과에서 "데이터베이스 정규화" 드래그
3. 💡 보라색 아이콘 클릭
4. GPT 설명 팝업 표시
5. 🔊 버튼 클릭 → 음성으로 듣기
   - 재생 중: ⏸ 일시정지 클릭 → 정지
   - 일시정지 중: ▶️ 계속 듣기 클릭 → 재개
```

### 퀴즈 모드 ❓

```
1. 모드: "퀴즈 모드" 선택
2. 페이지 새로고침 (F5)
3. "REST API" 드래그
4. ❓ 파란색 아이콘 클릭
5. 퀴즈 타입 선택:
   
   ⭕ OX 퀴즈:
   - 문제 표시 → O 또는 X 버튼 클릭
   - 정답/오답 즉시 확인
   - 해설 표시 + 🔊 버튼
   
   📝 객관식:
   - 질문 + 4개 보기 표시
   - 선택 후 "정답 확인하기" 클릭
   - 정답은 초록색, 오답은 빨간색 표시
   - 해설 + 🔊 버튼
   
   ✏️ 서술형:
   - 문제 표시 + 답변 입력란
   - 답 작성 후 "제출하기" 클릭
   - AI가 키워드 기반 채점 (0-100점)
   - 키워드 포함 여부 + 모범 답안 + 🔊 버튼
```

### 노션 정리 모드 📚 ✨ NEW!

```
1. 모드: "노션 정리" 선택
2. 페이지 새로고침 (F5)
3. 중요한 내용 드래그
4. 📚 초록색 아이콘 클릭
5. 팝업 확인:
   - AI가 자동 분류한 과목명 (수정 가능)
   - 선택한 내용 미리보기
   - 메모 입력란 (선택사항)
   - 출처 정보 (자동)
6. "✅ 노션에 저장" 클릭
7. Notion 데이터베이스에서 확인!
   
   저장된 구조:
   🔑 핵심 개념: [드래그한 텍스트]
   💡 내 생각/질문: [메모]
   🔗 출처: [페이지 링크]
```

---

## 🛠️ 기술 스택

| 분야 | 기술 |
|-----|------|
| **프론트엔드** | Vanilla JavaScript (ES6+), HTML5, CSS3 |
| **플랫폼** | Chrome Extension (Manifest V3) |
| **AI API** | OpenAI GPT-4o-mini, ElevenLabs TTS |
| **통신** | Chrome Message Passing, Fetch API |
| **저장소** | Chrome Storage API (로컬) |
| **아키텍처** | 모듈형 구조 (real-time + quiz 분리) |
| **의존성** | Zero Dependencies ⚡ |

---

## 📊 핵심 아키텍처

### 메시지 플로우

```
웹페이지 (Content Script)
    ↓ chrome.runtime.sendMessage()
    { action: 'real-time:explain' 또는 'quiz:generate' }
    ↓
shared/background.js (Service Worker)
    ↓ 액션 라우팅
    ├─ real-time:explain → generateExplanation()
    └─ quiz:generate → generateQuiz()
    ↓ GPT API 호출
OpenAI API
    ↓ 응답
웹페이지 (Content Script)
    ↓ UI 표시
사용자에게 결과 표시
```

### 모드 전환 시스템

```
popup/popup.js
    ↓ chrome.storage.local.set({ currentMode: 'real-time' })
Chrome Storage
    ↓ chrome.storage.onChanged 이벤트
real-time/content.js & quiz/content.js
    ↓ 모드 확인
    ├─ real-time 모드면: 💡 아이콘 활성화
    └─ quiz 모드면: ❓ 아이콘 활성화
```

---

## ⚙️ 개발 가이드

### 로컬 개발 환경 설정

#### 1. 저장소 클론
```bash
git clone [repository-url]
cd v-mate
```

#### 2. API 키 설정
```bash
# config.example.js를 복사
cp config.example.js config.js

# config.js 편집
# YOUR_OPENAI_API_KEY_HERE를 실제 키로 교체
```

#### 3. Chrome에 로드
```
chrome://extensions/
→ 개발자 모드 ON
→ "압축해제된 확장 프로그램을 로드합니다"
→ v-mate 폴더 선택
```

#### 4. 코드 수정 후
```
chrome://extensions/
→ v-mate 🔄 새로고침 버튼 클릭
→ 테스트 페이지 F5
```

---

### 새 기능 모드 추가하기

#### Step 1: 폴더 생성
```bash
mkdir new-feature
mkdir new-feature/ui
```

#### Step 2: content.js 작성
```javascript
// new-feature/content.js
let isNewFeatureMode = false;

chrome.storage.local.get(['currentMode'], (result) => {
  isNewFeatureMode = (result.currentMode === 'new-feature');
  if (isNewFeatureMode) {
    initNewFeatureMode();
  }
});

function initNewFeatureMode() {
  document.addEventListener('mouseup', handleTextSelection);
}
```

#### Step 3: background.js 수정
```javascript
// shared/background.js
if (module === 'new-feature') {
  handleNewFeature(method, data)
    .then(result => sendResponse(result));
  return true;
}
```

#### Step 4: manifest.json 수정
```json
"content_scripts": [{
  "js": [
    "...",
    "new-feature/content.js"  // 추가
  ]
}]
```

#### Step 5: popup.html 수정
```html
<!-- 모드 선택에 추가 -->
<div class="mode-option" id="mode-newfeature">
  <div class="mode-icon">🆕</div>
  <h3>새 기능</h3>
</div>
```

---

### 코드 컨벤션

**변수 네이밍:**
- real-time 모듈: `realTimeXxx`
- quiz 모듈: `quizXxx`
- 공통: 모듈명 없이

**CSS 클래스:**
- real-time: `.vmate-realtime-*`
- quiz: `.vmate-quiz-*`

**메시지 액션:**
- 형식: `'module:method'`
- 예: `'real-time:explain'`, `'quiz:generate'`

---

## 🐛 문제 해결

### 아이콘이 나타나지 않음

**원인:**
- 잘못된 모드 선택
- 페이지 미 새로고침
- 3글자 미만 선택

**해결:**
1. 확장 프로그램 팝업에서 모드 확인
2. 웹페이지 F5 새로고침
3. 3글자 이상 텍스트 드래그
4. F12 → Console에서 로그 확인
   - `v-mate real-time mode activated 💡` 또는
   - `v-mate quiz mode activated ❓`

### "API 키가 설정되지 않았습니다"

**해결:**
1. `config.js`에 API 키가 있는지 확인
2. 또는 팝업에서 API 키 입력
3. `chrome://extensions/`에서 v-mate 새로고침

### 음성이 재생되지 않음

**원인:**
- ElevenLabs API 키 없음
- 키 권한 문제 (text_to_speech 권한 필요)
- 할당량 초과

**해결:**
1. 팝업에서 ElevenLabs API 키 입력
2. ElevenLabs에서 키 재생성 (권한 확인)
3. 계정 사용량 확인: https://elevenlabs.io/app/usage

### 모드 전환이 안 됨

**해결:**
1. 팝업에서 모드 변경 후 페이지 **반드시 F5**
2. 새 탭에서 테스트
3. Chrome 재시작

### Extension context invalidated 에러

**해결:**
```
확장 프로그램 새로고침 후에는
테스트 페이지도 반드시 새로고침!
```

---

## 💾 Chrome Storage 구조

```javascript
chrome.storage.local = {
  // 현재 모드
  currentMode: 'real-time' | 'quiz' | 'notion',
  
  // API 키들
  openaiApiKey: 'sk-proj-...',
  elevenlabsApiKey: 'sk_...',
  
  // Notion 설정
  notionToken: 'secret_...',
  notionDatabaseId: '...',
  recentSubjects: ['데이터베이스', '알고리즘', ...],
  
  // (향후) 퀴즈 히스토리
  quizHistory: [...],
  wrongAnswers: [...]
}
```

---

## 🎨 UI/UX 디자인

### 색상 테마
- **실시간 설명 💡**: 보라색 (#667eea → #764ba2)
- **퀴즈 모드 ❓**: 파란색 (#4facfe → #00f2fe)
- **노션 정리 📚**: 초록색 (#11998e → #38ef7d)

### 애니메이션
- 아이콘 등장: `fade-in` + `scale`
- 팝업 등장: `fade-in` + `slide-up`
- 오디오 재생: `pulse` (빛나는 효과)
- 정답: `bounce`, 오답: `shake`

### 반응형
- 최대 너비: 450px (설명), 500px (퀴즈)
- 스크롤 가능한 컨텐츠
- ESC 키로 닫기
- 외부 클릭으로 아이콘 제거

---

## 🔑 API 키 관리

### OpenAI API (필수)
- **용도**: GPT 설명 생성, 퀴즈 생성
- **모델**: gpt-4o-mini
- **비용**: ~$0.0001-0.0003/회
- **발급**: https://platform.openai.com/api-keys

### ElevenLabs API (선택)
- **용도**: 음성 TTS
- **무료**: 월 10,000 characters
- **비용**: Starter $5/month (30,000 chars)
- **발급**: https://elevenlabs.io/app/settings/api-keys
- **주의**: API 키 생성 시 "Text to Speech" 권한 반드시 체크!

### 보이스 ID
- **현재 설정**: `uyVNoMrnUku1dZyVEXwD`
- **변경 방법**: `config.js` 14번 줄 수정
- **보이스 탐색**: https://elevenlabs.io/app/voice-library

---

## 💰 비용 정보

### OpenAI GPT-4o-mini
| 기능 | 예상 비용 | 설명 |
|-----|----------|------|
| 실시간 설명 | ~$0.0001/회 | 매우 저렴 |
| OX 퀴즈 | ~$0.0001/회 | 간단한 생성 |
| 객관식 | ~$0.0002/회 | 4개 보기 생성 |
| 서술형 | ~$0.0003/회 | 모범답안 + 채점기준 |

**100회 사용 시: 약 $0.01-0.03**

### ElevenLabs TTS
- **무료**: 월 10,000 characters
- **GPT 설명**: 평균 100-200자
- **월 50-100회 무료 사용 가능**

---

## 🎵 음성 설정 (선택사항)

### 음성 파라미터 조정

**위치:** `shared/tts-helper.js` (45-49번 줄)

```javascript
voice_settings: {
  stability: 0.45,              // 억양 다양성 (낮을수록 자연스러움)
  similarity_boost: 0.85,       // 목소리 특성 유지
  style: 0.25,                  // 감정 표현
  use_speaker_boost: true       // 명확한 발음
}
```

**현재 설정:** 한국인 여성이 자연스럽게 설명하는 톤으로 최적화됨

### 보이스 변경

```javascript
// config.js 14번 줄
ELEVENLABS_VOICE_ID: 'your-voice-id'

// 보이스 탐색:
// https://elevenlabs.io/app/voice-library
// Language: Korean 필터
```

---

## 🔒 보안 및 개인정보

### 저장 위치
- ✅ API 키: 브라우저 로컬 스토리지 (암호화 안 됨)
- ✅ 설정: Chrome Storage (기기 내)
- ❌ 서버에 저장하지 않음

### 전송 데이터
- ✅ 선택한 텍스트
- ✅ 페이지 제목/URL
- ❌ 쿠키, 계정 정보 등은 전송하지 않음

### Git 관리
- ✅ `config.js`는 `.gitignore`에 포함
- ✅ API 키가 공개 저장소에 올라가지 않음
- ✅ `config.example.js`는 템플릿으로 제공

---

## 🧪 테스트 가이드

### 개발자 도구 활용

#### Content Script 디버깅 (웹페이지)
```
F12 → Console 탭

확인할 로그:
- v-mate real-time mode activated 💡
- v-mate quiz mode activated ❓
- Requesting explanation...
- Generating ox quiz...
```

#### Background Script 디버깅
```
chrome://extensions/
→ v-mate의 "service worker" 링크 클릭
→ Console 탭

확인할 로그:
- v-mate shared background service worker loaded
- Background received message: ...
- GPT API 호출 중...
- GPT 응답 완료
```

---

## 🌟 로드맵

### v2.1 (현재) ✅
- [x] 실시간 설명 모드
- [x] 퀴즈 모드 (OX/객관식/서술형)
- [x] 모드 전환 시스템
- [x] 인터랙티브 퀴즈 UI
- [x] 키워드 기반 자동 채점
- [x] ElevenLabs TTS 음성 읽기
- [x] 재생/일시정지 컨트롤
- [x] **자동 노션 정리** ✨ NEW!
- [x] AI 과목 자동 분류
- [x] 빠른 저장 팝업 UI
- [x] 출처 링크 자동 첨부

### v2.2 (계획)
- [ ] 오답 노트 (틀린 문제 자동 저장)
- [ ] 퀴즈 히스토리 (날짜별 학습 기록)
- [ ] 학습 통계 (정답률, 시간 등)
- [ ] 음성 속도 조절 (0.5x ~ 2x)
- [ ] 다크 모드
- [ ] 노션 중복 감지

### v3.0 (미래)
- [ ] 집중 관리자 (공부 시간 추적)
- [ ] 페인만 학습법 체커
- [ ] 자료조사 도우미
- [ ] AI 티 검사기

---

## 🤝 팀 협업 가이드

### 새 팀원 온보딩

```bash
# 1. 저장소 클론
git clone [repository-url]
cd v-mate

# 2. config.js 생성
cp config.example.js config.js

# 3. API 키 입력 (config.js 편집)
# OPENAI_API_KEY, ELEVENLABS_API_KEY 입력

# 4. Chrome에 로드
# chrome://extensions/ → 개발자 모드 → 로드

# 5. 테스트
# 웹페이지에서 텍스트 드래그 → 아이콘 클릭
```

### 브랜치 전략
```
main - 안정 버전
develop - 개발 버전
feature/[기능명] - 새 기능 개발
```

### 커밋 컨벤션
```
feat: 새 기능
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 리팩토링
test: 테스트 추가
```

---

## 📜 라이센스

MIT License

Copyright (c) 2024 v-mate

Permission is hereby granted, free of charge, to any person obtaining a copy of this software...

---

## 🙋‍♂️ FAQ

### Q: 인터넷 연결이 필요한가요?
**A:** 네, GPT API와 TTS API 호출을 위해 필요합니다.

### Q: Chrome 외 다른 브라우저에서도 되나요?
**A:** Edge(Chromium 기반)에서는 작동할 수 있습니다. Firefox, Safari는 지원하지 않습니다.

### Q: API 키 없이 사용할 수 있나요?
**A:** 아니요, OpenAI API 키는 필수입니다. ElevenLabs는 선택입니다.

### Q: 음성이 안 나와요
**A:** ElevenLabs API 키가 없거나 권한이 없을 수 있습니다. 키 재생성 시 "Text to Speech" 권한을 체크하세요.

### Q: 모드 전환이 즉시 안 돼요
**A:** 모드 변경 후 웹페이지를 새로고침(F5)해야 합니다.

### Q: 비용이 얼마나 나오나요?
**A:** GPT-4o-mini는 매우 저렴합니다. 100회 사용해도 $0.01-0.03 정도입니다.

---

## 📧 문의 및 기여

- **Issues**: [GitHub Issues](https://github.com/your-username/v-mate/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/v-mate/discussions)
- **Email**: your-email@example.com

### 기여 환영!

```bash
1. Fork the Project
2. Create Feature Branch (git checkout -b feature/AmazingFeature)
3. Commit Changes (git commit -m 'feat: Add AmazingFeature')
4. Push to Branch (git push origin feature/AmazingFeature)
5. Open Pull Request
```

---

## 🎓 학습 활용 예시

### 시나리오 1: 논문 읽기
```
1. 실시간 설명 모드
2. 모르는 전문 용어 드래그
3. 💡 클릭 → GPT 설명
4. 🔊 클릭 → 음성으로 들으면서 이해
```

### 시나리오 2: 시험 준비
```
1. 퀴즈 모드
2. 교과서 핵심 개념 드래그
3. ❓ 클릭 → 객관식 퀴즈 생성
4. 문제 풀기
5. 틀린 문제 → 해설 🔊으로 다시 듣기
```

### 시나리오 3: 영어 학습
```
1. 실시간 설명 모드
2. 영어 단어/문장 드래그
3. 💡 클릭 → 한글 설명 + 예문
4. 🔊 클릭 → 발음 들으면서 학습
```

---

## 📚 추가 문서

- **USAGE_GUIDE.md** - 상세 사용 설명서

---

<div align="center">

## 🌟 Star를 눌러주세요!

v-mate가 도움이 되셨다면 ⭐를 눌러주세요.

**Made with ❤️ for students everywhere**

[⬆ 맨 위로](#v-mate-)

v2.0.0 | 2024

</div>
