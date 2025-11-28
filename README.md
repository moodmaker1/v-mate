# v-mate 💡

> 대학생을 위한 AI 학습 도우미 Chrome Extension

웹서핑 중 모르는 개념을 발견하면? **드래그 → 클릭 → 이해!**  
GPT가 설명해주고, 퀴즈로 확인하고, 노션에 정리하고, 집중력을 관리하고, 리서치까지 한 번에!

![Version](https://img.shields.io/badge/version-2.1.0-blue)
![Chrome](https://img.shields.io/badge/Chrome-88%2B-green)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

**개발자**: 김태윤, 성혜준  
**개발 연도**: 2025년

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

### 3️⃣ 자동 노션 정리 📚
- 텍스트 드래그 → 📚 초록색 아이콘 클릭
- **AI가 과목 자동 분류** (데이터베이스, 영어, 알고리즘 등)
- 메모 추가 가능 (질문이나 생각 기록)
- 출처 링크 자동 첨부
- Notion 페이지에 **날짜별 하위 페이지로 자동 저장**
- 📊 날짜별 타임라인 자동 생성

### 4️⃣ Focus Guard 🎯
- **집중력 관리 도구**
- 목표 설정 (과목명, 목표 시간)
- 여러 목표 동시 진행 가능
- 딴짓 사이트 감지 (YouTube, Netflix, SNS 등)
- 딴짓 시 경고 메시지 표시
- 공부 시간 / 딴짓 시간 자동 추적
- 집중 점수 계산
- 실시간 경과 시간 표시 (MM:SS 형식)
- 남은 시간 표시

### 5️⃣ Research Assistant 🔍
- **통합 리서치 검색 도구**
- 주제 입력으로 웹문서 + 논문 한 번에 검색
- **무료 API 사용**: DuckDuckGo (웹), arXiv (논문), Semantic Scholar (논문)
- 신뢰도 자동 평가 (A~F 등급)
- 신뢰도순/관련성순/최신순 정렬
- 체크박스로 다중 선택 가능
- 전체 선택/해제 기능
- 선택한 자료만 노션에 일괄 내보내기
- 검색 결과 클릭으로 원본 페이지 이동

### 6️⃣ AI 음성 읽기 🎵
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
  ELEVENLABS_VOICE_ID: 'uyVNoMrnUku1dZyVEXwD',
  
  // Notion API (선택)
  NOTION_TOKEN: 'secret_xxxxxxxxxxxx',
  NOTION_PARENT_PAGE_ID: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
};
```

**API 키 발급:**
- OpenAI: https://platform.openai.com/api-keys
- ElevenLabs: https://elevenlabs.io/app/settings/api-keys
- Notion: https://www.notion.so/my-integrations

#### 방법 B: 확장 프로그램 팝업 (일반 사용자용)

```
1. Chrome 툴바에서 v-mate 아이콘 클릭
2. API 키 입력 후 "저장" 클릭
```

### 3️⃣ Notion 설정 (선택)

노션 정리 기능을 사용하려면:

```
1. https://www.notion.so/my-integrations 에서 Integration 생성
2. Notion 페이지 만들고 Integration 연결
3. v-mate 팝업에서 Token과 상위 페이지 ID 입력
4. "연결 테스트" → 저장
```

**상위 페이지 ID 찾는 방법:**
- Notion 페이지 URL에서 마지막 부분이 페이지 ID입니다
- 예: `https://www.notion.so/My-Page-2b3206a02abe8040acbfd60f71efd306`
- 페이지 ID: `2b3206a02abe8040acbfd60f71efd306`

### 4️⃣ 모드 선택

```
확장 프로그램 아이콘 클릭
→ 🔘 실시간 설명 💡
→ ○ 퀴즈 모드 ❓
→ ○ 노션 정리 📚
→ ○ Focus Guard 🎯
→ ○ Research Assistant 🔍
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
│   ├── background.js          # 통합 서비스 워커
│   │                          # - 메시지 라우팅
│   │                          # - GPT API 호출
│   │                          # - Notion API 호출
│   │                          # - Focus Guard 로직
│   │                          # - Research Assistant 로직
│   │                          #   (DuckDuckGo, arXiv, Semantic Scholar)
│   │                          #   (신뢰도 평가)
│   ├── gpt-api.js             # GPT API 공통 함수 (deprecated)
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
├── notion-sync/               # 노션 정리 모드 📚
│   ├── content.js             # 드래그 감지 + 노션 저장 로직
│   ├── styles.css             # 초록색 테마 스타일
│   ├── subject-classifier.js  # AI 과목 자동 분류
│   └── ui/
│       └── quick-save-popup.js  # 빠른 저장 팝업
│
├── focus/                     # Focus Guard 🎯
│   ├── popup.html             # Focus Guard 팝업 UI
│   ├── popup.js               # 목표 관리, 통계 표시
│   ├── popup.css              # 팝업 스타일
│   ├── content.js             # 웹페이지 알림 표시
│   ├── styles.css             # 알림 스타일
│   ├── distraction-detector.js  # 딴짓 사이트 감지 로직
│   └── messages.js            # 경고 메시지 하드코딩
│
├── research/                  # Research Assistant 🔍
│   ├── popup.html             # 검색 UI
│   ├── popup.js               # 검색 로직, 결과 표시, 노션 내보내기
│   ├── popup.css              # 팝업 스타일
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

### 노션 정리 모드 📚

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
7. Notion 페이지에서 확인!
   
   저장된 구조:
   📅 2025-01-15 (날짜별 하위 페이지)
     🔑 핵심 개념: [드래그한 텍스트]
     💡 내 생각/질문: [메모]
     🔗 출처: [페이지 링크]
     ⏰ 저장 시간: [타임스탬프]
```

### Focus Guard 🎯

```
1. 모드: "Focus Guard" 선택
2. "Focus Guard 열기" 버튼 클릭
3. 목표 추가:
   - 과목명: "알고리즘"
   - 목표 시간: 60분
4. "시작" 버튼 클릭
5. 공부 시작 → 시간 자동 추적
6. YouTube 접속 시:
   - 딴짓 감지
   - 경고 메시지 표시
   - 딴짓 시간 추적 시작
7. 다시 공부 사이트로 돌아오면:
   - 공부 시간 추적 재개
8. 통계 확인:
   - 공부 시간 / 딴짓 시간
   - 집중 점수
   - 경과 시간 / 남은 시간
```

### Research Assistant 🔍

```
1. 모드: "Research Assistant" 선택
2. "Research Assistant 열기" 버튼 클릭
3. 검색:
   - 주제 입력: "머신러닝"
   - 검색 소스 선택: 웹문서 ☑ 논문 ☑
   - "검색" 버튼 클릭
4. 결과 확인:
   - 신뢰도 등급 (A~F)
   - 정렬: 신뢰도순/관련성순/최신순
   - 제목 클릭 → 원본 페이지 이동
5. 선택:
   - 개별 체크박스로 선택
   - 또는 "전체 선택" 체크박스
6. 노션 내보내기:
   - "노션에 정리하기 (N개)" 버튼 클릭
   - 선택한 자료만 노션에 저장
```

---

## 🛠️ 기술 스택

| 분야 | 기술 |
|-----|------|
| **프론트엔드** | Vanilla JavaScript (ES6+), HTML5, CSS3 |
| **플랫폼** | Chrome Extension (Manifest V3) |
| **AI API** | OpenAI GPT-4o-mini, ElevenLabs TTS |
| **검색 API** | DuckDuckGo (HTML 파싱), arXiv (XML API), Semantic Scholar (REST API) |
| **통신** | Chrome Message Passing, Fetch API |
| **저장소** | Chrome Storage API (로컬) |
| **아키텍처** | 모듈형 구조 (각 기능별 폴더 분리) |
| **의존성** | Zero Dependencies ⚡ |

---

## 📊 핵심 아키텍처

### 메시지 플로우

```
웹페이지 (Content Script)
    ↓ chrome.runtime.sendMessage()
    { action: 'real-time:explain' | 'quiz:generate' | 'notion-save' | 'focus:...' | 'research:...' }
    ↓
shared/background.js (Service Worker)
    ↓ 액션 라우팅
    ├─ real-time:explain → generateExplanation()
    ├─ quiz:generate → generateQuiz()
    ├─ notion-save → handleNotionSave()
    ├─ focus:* → handleFocusGuard()
    └─ research:* → handleResearch()
    ↓ GPT API / Notion API / 검색 API 호출
외부 API
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
각 모듈의 content.js
    ↓ 모드 확인
    ├─ real-time 모드면: 💡 아이콘 활성화
    ├─ quiz 모드면: ❓ 아이콘 활성화
    ├─ notion 모드면: 📚 아이콘 활성화
    └─ focus/research 모드면: 팝업 열기
```

---

## 🔍 주요 기능 상세

### 1. 실시간 설명 (Real-time)

**파일:**
- `real-time/content.js`: 텍스트 선택 감지, 아이콘 표시, 팝업 관리
- `shared/background.js`: GPT API 호출 (`generateExplanation`)

**동작:**
1. 사용자가 텍스트 드래그 (3글자 이상)
2. 💡 아이콘 표시
3. 아이콘 클릭 → Background에 메시지 전송
4. GPT API 호출 (페이지 맥락 포함)
5. 설명 팝업 표시
6. 🔊 버튼으로 TTS 재생

### 2. 스마트 퀴즈 (Quiz)

**파일:**
- `quiz/content.js`: 텍스트 선택, 퀴즈 타입 선택 UI
- `quiz/ui/ox-quiz.js`: OX 퀴즈 UI 및 채점
- `quiz/ui/multiple-choice-quiz.js`: 객관식 UI 및 채점
- `quiz/ui/subjective-quiz.js`: 서술형 UI 및 키워드 기반 채점
- `shared/background.js`: GPT API 호출 (`generateQuiz`, `gradeSubjective`)

**동작:**
1. 텍스트 드래그 → ❓ 아이콘 클릭
2. 퀴즈 타입 선택 (OX/객관식/서술형)
3. GPT API 호출로 퀴즈 생성
4. 타입별 UI 표시
5. 사용자 답변 → 채점 (서술형은 키워드 기반)
6. 해설 표시 + 🔊 버튼

### 3. 노션 정리 (Notion Sync)

**파일:**
- `notion-sync/content.js`: 텍스트 선택, 저장 팝업
- `notion-sync/subject-classifier.js`: AI 과목 분류
- `notion-sync/ui/quick-save-popup.js`: 저장 팝업 UI
- `shared/background.js`: Notion API 호출 (`handleNotionSave`)

**동작:**
1. 텍스트 드래그 → 📚 아이콘 클릭
2. AI 과목 분류 (GPT API)
3. 저장 팝업 표시 (과목명, 메모 입력)
4. Background에 저장 요청
5. 날짜별 하위 페이지 생성/업데이트
6. Notion에 저장 완료

**Notion 구조:**
```
상위 페이지 (NOTION_PARENT_PAGE_ID)
  └─ 📅 2025-01-15 (날짜별 하위 페이지)
      └─ 🔑 [드래그한 텍스트]
          💡 [메모]
          🔗 [출처 링크]
          ⏰ [타임스탬프]
```

### 4. Focus Guard

**파일:**
- `focus/popup.html`, `focus/popup.js`: 목표 관리 UI
- `focus/content.js`: 웹페이지 알림 표시
- `focus/distraction-detector.js`: 딴짓 사이트 감지
- `focus/messages.js`: 경고 메시지 하드코딩
- `shared/background.js`: 탭 모니터링, 시간 추적 (`handleFocusGuard`)

**동작:**
1. 목표 추가 (과목명, 목표 시간)
2. "시작" 클릭 → 탭 모니터링 시작
3. 탭 변경 감지:
   - 딴짓 사이트 → 경고 메시지 표시, 딴짓 시간 추적
   - 공부 사이트 → 공부 시간 추적
4. 실시간 통계 업데이트:
   - 경과 시간 (MM:SS)
   - 남은 시간
   - 공부 시간 / 딴짓 시간
   - 집중 점수 계산
5. 여러 목표 동시 진행 가능

**딴짓 감지:**
- URL 기반: YouTube, Netflix, SNS 등
- 제목 기반: "YouTube", "넷플릭스" 등 키워드
- 학습 사이트 화이트리스트: Notion, GitHub, Stack Overflow 등

**집중 점수 계산:**
```
집중 점수 = (공부 시간 / (공부 시간 + 딴짓 시간)) * 100
```

### 5. Research Assistant

**파일:**
- `research/popup.html`, `research/popup.js`: 검색 UI, 결과 표시
- `shared/background.js`: 검색 로직 (`handleResearch`)
  - `searchDuckDuckGo`: HTML 파싱
  - `searchArxiv`: XML API
  - `searchSemanticScholar`: REST API (재시도 로직)
  - `calculateCredibilityScore`: 신뢰도 평가
  - `getCredibilityGrade`: 등급 변환

**동작:**
1. 주제 입력 + 검색 소스 선택
2. Background에 검색 요청
3. 병렬 검색:
   - DuckDuckGo (웹문서)
   - arXiv (논문)
   - Semantic Scholar (논문)
4. 신뢰도 평가 (0-100점)
5. 결과 표시 (신뢰도순/관련성순/최신순)
6. 체크박스로 선택
7. 노션에 일괄 내보내기

**신뢰도 평가 기준:**
- 출처 신뢰도 (50점): 논문 > .edu/.gov > 학술 출판사 > 위키피디아 > 기술 사이트
- 인용 횟수 (20점): 논문만, 1000회 이상 = 20점
- 최신성 (20점): 1년 이내 = 20점, 10년 이상 = 5점
- 도메인 보너스 (10점): 최고 신뢰 도메인 = 15점

**등급:**
- A (90-100점): 매우 높음
- B (70-89점): 높음
- C (50-69점): 보통
- D (30-49점): 낮음
- F (0-29점): 매우 낮음

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
# OPENAI_API_KEY, ELEVENLABS_API_KEY 등 입력
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

### 코드 컨벤션

**변수 네이밍:**
- real-time 모듈: `realTimeXxx`
- quiz 모듈: `quizXxx`
- 공통: 모듈명 없이

**CSS 클래스:**
- real-time: `.vmate-realtime-*`
- quiz: `.vmate-quiz-*`
- notion: `.vmate-notion-*`

**메시지 액션:**
- 형식: `'module:method'`
- 예: `'real-time:explain'`, `'quiz:generate'`, `'notion-save'`, `'focus:start'`, `'research:search'`

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

### Research Assistant 검색 결과가 0개

**원인:**
- API Rate Limit (Semantic Scholar)
- HTML 구조 변경 (DuckDuckGo)

**해결:**
1. 잠시 후 다시 시도
2. 검색어 변경
3. F12 → Console에서 에러 로그 확인

---

## 💾 Chrome Storage 구조

```javascript
chrome.storage.local = {
  // 현재 모드
  currentMode: 'real-time' | 'quiz' | 'notion' | 'focus' | 'research',
  
  // API 키들
  openaiApiKey: 'sk-proj-...',
  elevenlabsApiKey: 'sk_...',
  
  // Notion 설정
  notionToken: 'secret_...',
  notionParentPageId: '...',
  
  // Focus Guard
  focusGoals: [
    {
      id: '...',
      subject: '알고리즘',
      targetMinutes: 60,
      studyTime: 1200,  // 초
      distractionTime: 300,  // 초
      status: 'active' | 'paused' | 'completed',
      startTime: 1234567890,
      createdAt: 1234567890
    }
  ],
  
  // Research Assistant
  researchResults: [...]
}
```

---

## 🎨 UI/UX 디자인

### 색상 테마
- **실시간 설명 💡**: 보라색 (#667eea → #764ba2)
- **퀴즈 모드 ❓**: 파란색 (#4facfe → #00f2fe)
- **노션 정리 📚**: 초록색 (#11998e → #38ef7d)
- **Focus Guard 🎯**: 주황색 (#f093fb → #f5576c)
- **Research Assistant 🔍**: 보라색 (#667eea → #764ba2)

### 애니메이션
- 아이콘 등장: `fade-in` + `scale`
- 팝업 등장: `fade-in` + `slide-up`
- 오디오 재생: `pulse` (빛나는 효과)
- 정답: `bounce`, 오답: `shake`

### 반응형
- 최대 너비: 450px (설명), 500px (퀴즈, Research)
- 스크롤 가능한 컨텐츠
- ESC 키로 닫기
- 외부 클릭으로 아이콘 제거

---

## 🔑 API 키 관리

### OpenAI API (필수)
- **용도**: GPT 설명 생성, 퀴즈 생성, 과목 분류
- **모델**: gpt-4o-mini
- **비용**: ~$0.0001-0.0003/회
- **발급**: https://platform.openai.com/api-keys

### ElevenLabs API (선택)
- **용도**: 음성 TTS
- **무료**: 월 10,000 characters
- **비용**: Starter $5/month (30,000 chars)
- **발급**: https://elevenlabs.io/app/settings/api-keys
- **주의**: API 키 생성 시 "Text to Speech" 권한 반드시 체크!

### Notion API (선택)
- **용도**: 노션 정리, Research Assistant 내보내기
- **무료**: 제한 없음
- **발급**: https://www.notion.so/my-integrations

### Research Assistant API (무료)
- **DuckDuckGo**: 완전 무료, 제한 없음 (HTML 파싱)
- **arXiv**: 완전 무료, 제한 없음 (XML API)
- **Semantic Scholar**: 완전 무료, Rate Limit 있음 (재시도 로직 포함)

---

## 💰 비용 정보

### OpenAI GPT-4o-mini
| 기능 | 예상 비용 | 설명 |
|-----|----------|------|
| 실시간 설명 | ~$0.0001/회 | 매우 저렴 |
| OX 퀴즈 | ~$0.0001/회 | 간단한 생성 |
| 객관식 | ~$0.0002/회 | 4개 보기 생성 |
| 서술형 | ~$0.0003/회 | 모범답안 + 채점기준 |
| 과목 분류 | ~$0.0001/회 | 간단한 분류 |

**100회 사용 시: 약 $0.01-0.03**

### ElevenLabs TTS
- **무료**: 월 10,000 characters
- **GPT 설명**: 평균 100-200자
- **월 50-100회 무료 사용 가능**

### Research Assistant
- **완전 무료**: DuckDuckGo, arXiv, Semantic Scholar 모두 무료
- **Rate Limit**: Semantic Scholar만 있음 (재시도 로직으로 해결)

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
- v-mate background service worker loaded
- Background received message: ...
- GPT API 호출 중...
- GPT 응답 완료
- [DuckDuckGo] 검색 시작: ...
- [Research] 검색 완료: N개
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
- [x] 자동 노션 정리
- [x] AI 과목 자동 분류
- [x] 날짜별 하위 페이지 자동 생성
- [x] **Focus Guard** 🎯
- [x] **Research Assistant** 🔍
- [x] 체크박스 다중 선택
- [x] 전체 선택/해제

### v2.2 (계획)
- [ ] 오답 노트 (틀린 문제 자동 저장)
- [ ] 퀴즈 히스토리 (날짜별 학습 기록)
- [ ] 학습 통계 (정답률, 시간 등)
- [ ] 음성 속도 조절 (0.5x ~ 2x)
- [ ] 다크 모드
- [ ] 노션 중복 감지
- [ ] Research Assistant: 검색어 제안
- [ ] Focus Guard: 목표 달성 알림

### v3.0 (미래)
- [ ] 페인만 학습법 체커
- [ ] AI 티 검사기
- [ ] 학습 패턴 분석
- [ ] 자동 복습 알림

---

## 🤝 기여 가이드

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

Copyright (c) 2025 v-mate

**개발자**: 김태윤, 성혜준  
이 프로젝트는 김태윤, 성혜준에 의해서 2025년에 개발되었습니다.

---

## 🙋‍♂️ FAQ

### Q: 인터넷 연결이 필요한가요?
**A:** 네, GPT API와 TTS API 호출을 위해 필요합니다. Research Assistant는 무료 API를 사용합니다.

### Q: Chrome 외 다른 브라우저에서도 되나요?
**A:** Edge(Chromium 기반)에서는 작동할 수 있습니다. Firefox, Safari는 지원하지 않습니다.

### Q: API 키 없이 사용할 수 있나요?
**A:** 아니요, OpenAI API 키는 필수입니다. ElevenLabs와 Notion은 선택입니다. Research Assistant는 API 키 없이 사용 가능합니다.

### Q: 음성이 안 나와요
**A:** ElevenLabs API 키가 없거나 권한이 없을 수 있습니다. 키 재생성 시 "Text to Speech" 권한을 체크하세요.

### Q: 모드 전환이 즉시 안 돼요
**A:** 모드 변경 후 웹페이지를 새로고침(F5)해야 합니다.

### Q: 비용이 얼마나 나오나요?
**A:** GPT-4o-mini는 매우 저렴합니다. 100회 사용해도 $0.01-0.03 정도입니다. Research Assistant는 완전 무료입니다.

### Q: Focus Guard가 딴짓을 감지하지 못해요
**A:** 딴짓 사이트 목록은 `focus/distraction-detector.js`에 있습니다. 필요시 추가하세요.

### Q: Research Assistant 검색 결과가 적어요
**A:** Semantic Scholar는 Rate Limit이 있어 재시도 로직이 포함되어 있습니다. 잠시 후 다시 시도하거나 검색어를 변경해보세요.

---

## 📧 문의 및 기여

- **Issues**: [GitHub Issues](https://github.com/your-username/v-mate/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/v-mate/discussions)

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

### 시나리오 4: 리포트 작성
```
1. Research Assistant
2. 주제 검색 (웹문서 + 논문)
3. 신뢰도순 정렬
4. A등급 자료만 선택
5. 노션에 일괄 내보내기
6. 리포트 작성 시작!
```

### 시나리오 5: 집중력 관리
```
1. Focus Guard
2. 오늘의 목표 설정 (알고리즘 2시간)
3. 시작 → 자동 추적
4. YouTube 접속 시 경고
5. 통계 확인 → 집중 점수 확인
```

---

<div align="center">

## 🌟 Star를 눌러주세요!

v-mate가 도움이 되셨다면 ⭐를 눌러주세요.

**Made with ❤️ for students everywhere**

**개발자**: 김태윤, 성혜준  
**개발 연도**: 2025년

[⬆ 맨 위로](#v-mate-)

v2.1.0 | 2025

</div>
