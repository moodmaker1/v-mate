# v-mate (Open-LLM-VTuber Custom Build) 💡

> **대학생과 지식 근로자를 위한 지능형 AI 데스크탑 파트너**

**v-mate**는 단순한 대화형 AI가 아닙니다. 당신의 화면을 함께 보고, 업무를 기억하며, 필요한 정보를 대신 찾아주는 **능동적인 데스크탑 비서**입니다.  
Open-LLM-VTuber의 강력한 음성 상호작용 기능에 **Notion 연동**, **화면 인식**, **글로벌 단축키** 등 생산성 도구를 결합하여, 공부와 업무의 효율을 극대화합니다.

![Version](https://img.shields.io/badge/version-2.1.0-blue)
![Python](https://img.shields.io/badge/Python-3.10%2B-green)
![License](https://img.shields.io/badge/license-MIT-lightgrey)
![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey)

**개발자**: 김태윤 (yuni branch)  
**기반 프로젝트**: Open-LLM-VTuber

---

## 📖 목차

1.  [✨ 핵심 기능 (Key Features)](#-핵심-기능-key-features)
    *   [1. 화면 인식 및 분석 (Screen Perception)](#1-화면-인식-및-분석-screen-perception)
    *   [2. 글로벌 단축키 (Proactive Interaction)](#2-글로벌-단축키-proactive-interaction)
    *   [3. 자동 노션 정리 (Second Brain)](#3-자동-노션-정리-second-brain)
    *   [4. 리서치 어시스턴트 (Research Assistant)](#4-리서치-어시스턴트-research-assistant)
    *   [5. Focus Guard (집중력 관리)](#5-focus-guard-집중력-관리)
2.  [🚀 빠른 시작 (Quick Start)](#-빠른-시작-quick-start)
3.  [⚙️ 상세 설정 가이드 (Configuration)](#-상세-설정-가이드-configuration)
4.  [🎯 사용 시나리오 (Usage Scenarios)](#-사용-시나리오-usage-scenarios)
5.  [🛠️ 기술적 구현 (Implementation Details)](#-기술적-구현-implementation-details)
    *   [아키텍처 (Architecture)](#아키텍처-architecture)
    *   [디렉토리 구조 (Directory Structure)](#디렉토리-구조-directory-structure)
6.  [🐛 문제 해결 (Troubleshooting)](#-문제-해결-troubleshooting)
7.  [📜 라이선스 및 크레딧](#-라이선스-및-크레딧)

---

## ✨ 핵심 기능 (Key Features)

### 1. 화면 인식 및 분석 (Screen Perception) 👁️
**"백문이 불여일견"** — AI에게 말로 설명할 필요 없이, 보고 있는 화면을 그대로 보여주세요.

*   **기능**: 사용자의 현재 화면을 고해상도로 캡처하여 AI에게 전송합니다.
*   **작동 원리**:
    1.  `mss` 라이브러리를 사용하여 0.1초 이내에 현재 모니터 화면을 캡처합니다.
    2.  이미지를 메모리 상에서 최적화(Resize & Compress)하여 Base64 문자열로 변환합니다.
    3.  Vision 모델(GPT-4o 등)에 텍스트 프롬프트("이 화면을 보고 사용자의 질문에 답해줘")와 함께 전송합니다.
*   **활용**:
    *   **코딩**: 에러 로그나 복잡한 코드를 드래그할 필요 없이 "이 에러 왜 나는 거야?"라고 물어보세요.
    *   **디자인**: 레퍼런스 이미지를 보며 "이런 스타일로 만들려면 어떻게 해야 해?"라고 조언을 구하세요.
    *   **학습**: PDF 논문이나 강의 자료를 보며 "이 차트가 의미하는 게 뭐야?"라고 질문하세요.

### 2. 글로벌 단축키 (Proactive Interaction) ⌨️
마우스로 창을 전환하거나 웨이크 워드("헤이, 컴퓨터")를 부를 필요가 없습니다.

*   **단축키**: **`Cmd+Shift+S`** (macOS 기준)
*   **즉시 실행**: 키를 누르는 순간, 백그라운드에서 실행 중인 `InputListener`가 이벤트를 감지하고 즉시 화면 캡처 및 분석 프로세스를 시작합니다.
*   **Seamless Workflow**: 어떤 애플리케이션(IDE, 브라우저, 게임 등)을 사용 중이든 상관없이 작동합니다. 작업 흐름을 끊지 않고 AI의 도움을 받을 수 있습니다.
*   **기술적 특징**:
    *   `pynput` 라이브러리를 사용하여 OS 레벨의 키보드 이벤트를 후킹합니다.
    *   macOS의 보안 정책(Input Monitoring)을 준수하며, 메인 서버 스레드와 독립적으로 동작하여 끊김 없는 경험을 제공합니다.

### 3. 자동 노션 정리 (Second Brain) 📚
대화는 휘발되지만, 지식은 남아야 합니다. v-mate는 당신의 **Second Brain** 역할을 수행합니다.

*   **자동 감지**: 대화 중 "이거 저장해줘"라고 말하거나, AI가 중요하다고 판단한 정보는 자동으로 저장됩니다.
*   **구조화된 데이터**: 단순 텍스트가 아닌, Notion 데이터베이스의 속성(날짜, 태그, 요약, 본문)에 맞춰 체계적으로 정리됩니다.
*   **Notion API**: 공식 Notion API를 사용하여 빠르고 안정적으로 동기화됩니다.
*   **데이터 구조**:
    *   **Title**: 노트의 제목 (AI가 자동 생성)
    *   **Content**: 대화 내용 요약 및 핵심 정보
    *   **Date**: 저장된 날짜 및 시간
    *   **Tags**: 자동 분류된 태그 (예: #코딩, #아이디어, #일정)

### 4. 리서치 어시스턴트 (Research Assistant) 🔍
AI의 환각(Hallucination)을 방지하고 최신 정보를 제공합니다.

*   **실시간 웹 검색**: DuckDuckGo 검색 엔진을 통해 실시간 웹 정보를 검색합니다.
*   **논문 검색**: arXiv API를 연동하여 최신 학술 논문을 검색하고 요약해줍니다.
*   **팩트 체크**: "오늘 서울 날씨 어때?"나 "최신 AI 뉴스 알려줘" 같은 질문에 대해, 학습된 데이터가 아닌 실제 검색 결과를 바탕으로 답변합니다.
*   **출처 제공**: 정보의 신뢰성을 위해 참조한 웹사이트 링크를 함께 제공합니다.

### 5. Focus Guard (집중력 관리) 🎯
당신의 집중력을 지켜주는 파수꾼입니다. (실험적 기능)

*   **활성 창 모니터링**: AppleScript(`osascript`)를 사용하여 현재 사용자가 보고 있는 최상위 창의 제목을 모니터링합니다.
*   **딴짓 감지**: 학습 모드에서 유튜브나 SNS 등을 켜면 AI가 이를 감지하고 "공부 안 하고 뭐해?"라고 말을 겁니다.
*   **프라이버시**: 창 제목 정보는 로컬에서만 처리되며, 외부 서버로 전송되지 않습니다.

---

## 🚀 빠른 시작 (Quick Start)

### 1. 필수 요구 사항
*   **OS**: macOS (권장), Windows, Linux
*   **Python**: 3.10 이상
*   **패키지 매니저**: `uv` (속도와 의존성 관리를 위해 강력 권장)
    ```bash
    # uv 설치 (macOS/Linux)
    curl -LsSf https://astral.sh/uv/install.sh | sh
    ```
*   **FFmpeg**: 오디오 처리를 위해 필요합니다.
    ```bash
    # macOS
    brew install ffmpeg
    ```

### 2. 설치하기

```bash
# 1. 저장소 클론
git clone -b yuni https://github.com/your-repo/v-mate.git
cd v-mate

# 2. 가상환경 생성 및 의존성 동기화
# uv가 자동으로 가상환경을 생성하고 필요한 패키지를 설치합니다.
uv sync
```

### 3. 설정 파일 구성

`config_templates/conf.default.yaml` 파일을 복사하여 `conf.yaml`을 생성합니다.

```bash
cp config_templates/conf.default.yaml conf.yaml
```

`conf.yaml` 파일을 열어 API 키를 입력합니다.

```yaml
# conf.yaml

# 1. LLM 설정 (OpenAI 권장)
llm:
  provider: "openai"
  api_key: "sk-proj-..."  # 여기에 OpenAI API Key 입력
  model: "gpt-4o"         # Vision 기능을 위해 gpt-4o 사용 필수

# 2. Notion 설정 (선택 사항)
system_config:
  notion_config:
    notion_token: "secret_..."      # Notion Integration Token
    notion_parent_page_id: "..."    # 저장할 페이지 ID (URL의 마지막 32자리)
```

### 4. 실행하기

```bash
uv run run_server.py
```

서버가 시작되면 브라우저를 열고 `http://localhost:12393`에 접속하세요. 마이크 권한을 허용하면 v-mate가 깨어납니다!

---

## ⚙️ 상세 설정 가이드 (Configuration)

`conf.yaml` 파일은 v-mate의 모든 동작을 제어하는 관제탑입니다. 주요 설정 항목을 상세히 설명합니다.

### 🧠 LLM 설정 (`llm_configs`)
다양한 LLM 제공자를 지원합니다. 사용 목적에 따라 선택하세요.

*   **OpenAI (`openai_llm`)**:
    *   **장점**: 가장 안정적이고 Vision 성능이 뛰어납니다. Function Calling이 가장 정확합니다.
    *   **추천 모델**: `gpt-4o` (속도와 성능의 균형), `gpt-4-turbo`
    *   **설정**: `api_key`만 입력하면 됩니다.
*   **Claude (`claude_llm`)**:
    *   **장점**: 자연스러운 대화 능력과 코딩 능력이 뛰어납니다.
    *   **추천 모델**: `claude-3-5-sonnet`
*   **Ollama (`ollama_llm`)**:
    *   **장점**: 로컬에서 무료로 실행 가능합니다. 프라이버시가 보장됩니다.
    *   **단점**: 고사양 GPU가 필요하며, Vision 기능이 제한될 수 있습니다.
    *   **추천 모델**: `llama3`, `qwen2.5`

### 🗣️ 음성 인식 (`asr_config`)
사용자의 목소리를 텍스트로 변환하는 엔진입니다.

*   **`faster_whisper`**:
    *   OpenAI Whisper 모델의 최적화 버전입니다.
    *   `device`: GPU가 있다면 `cuda`, 없다면 `cpu`로 설정하세요.
    *   `model_path`: `large-v3`는 정확하지만 느리고, `small`은 빠르지만 정확도가 낮습니다. `medium`을 추천합니다.
*   **`sherpa_onnx_asr`**:
    *   매우 가볍고 빠른 온디바이스 인식 엔진입니다. 저사양 환경에서 추천합니다.

### 🔊 음성 합성 (`tts_config`)
AI의 목소리를 생성하는 엔진입니다.

*   **`openai_tts`**:
    *   매우 자연스러운 품질을 제공하지만 유료입니다.
    *   `voice`: `alloy`, `echo`, `fable`, `onyx`, `nova`, `shimmer` 중 선택.
*   **`edge_tts`**:
    *   MS Edge의 무료 TTS를 사용합니다.
    *   품질이 준수하고 완전 무료입니다. 한국어(`ko-KR-SunHiNeural`)도 지원합니다.
*   **`elevenlabs_tts`**:
    *   최고의 감정 표현력을 보여주지만 비용이 듭니다.
    *   나만의 커스텀 보이스를 사용할 수 있습니다.

### 📝 Notion 설정 (`notion_config`)
Second Brain 기능을 위한 설정입니다.

*   **`notion_token`**:
    1.  [Notion My Integrations](https://www.notion.so/my-integrations) 접속.
    2.  'New integration' 클릭.
    3.  이름 입력 후 'Submit'.
    4.  'Internal Integration Secret'을 복사하여 입력.
*   **`notion_parent_page_id`**:
    1.  Notion에서 데이터를 저장할 페이지 생성.
    2.  페이지 URL 복사 (예: `https://www.notion.so/My-Notes-1234567890abcdef1234567890abcdef`).
    3.  마지막 32자리(`1234567890abcdef1234567890abcdef`)가 ID입니다.
    4.  **중요**: 해당 페이지 우측 상단 `...` 메뉴 > `Connect` > 생성한 Integration 선택.

---

## 🎯 사용 시나리오 (Usage Scenarios)

### 1. 개발자: "이 에러가 도대체 뭐야?" 💻
코딩을 하다가 원인을 알 수 없는 `NullPointerException`이 발생했습니다. 구글링을 해도 답이 안 나옵니다.

1.  IDE의 에러 로그 화면을 띄워둡니다.
2.  **`Cmd+Shift+S`**를 누릅니다.
3.  **v-mate**: *"화면을 보니 52번째 줄에서 객체가 초기화되지 않은 상태로 메서드를 호출하고 있네요. `if (obj != null)` 체크를 추가해보시겠어요?"*
4.  **사용자**: *"아 맞다. 고마워. 수정 코드 좀 짜줘."*
5.  **v-mate**: *(수정된 코드 블록을 보여주며)* *"여기 있습니다. 안전하게 Optional을 사용하는 방식으로 변경했습니다."*

### 2. 대학생: "이 논문 개념 정리해줘" 🎓
전공 수업 자료(PDF)를 읽다가 'Transformer Architecture' 다이어그램이 이해가 안 됩니다.

1.  PDF 화면을 띄워둡니다.
2.  **`Cmd+Shift+S`**를 누릅니다.
3.  **사용자**: *"이 그림이 설명하는 구조가 뭐야? 쉽게 설명해서 노션에 저장해줘."*
4.  **v-mate**: *"이 그림은 Transformer의 인코더-디코더 구조를 보여줍니다. 왼쪽이 인코더로 입력을 처리하고... (설명 중)"*
5.  *(백그라운드에서 Notion '전공 공부' 데이터베이스에 'Transformer 구조' 페이지 생성 및 요약 저장)*
6.  **v-mate**: *"설명한 내용을 노션에 'Transformer 구조'라는 제목으로 저장했습니다."*

### 3. 기획자: "시장 조사 도와줘" 📊
새로운 앱 기획을 위해 경쟁사 조사가 필요합니다.

1.  **사용자**: *"요즘 20대에게 인기 있는 일정 관리 앱 3개만 찾아줘."*
2.  **v-mate**: *(DuckDuckGo 검색 수행)* *"검색 결과, 'Notion', 'Todoist', 'TickTick'이 인기가 많습니다. 특히 Notion은 자유도가 높아서..."*
3.  **사용자**: *"그럼 Notion의 주요 기능만 요약해줘."*
4.  **v-mate**: *"Notion은 데이터베이스, 칸반 보드, 캘린더 등 다양한 뷰를 제공하며..."*

---

## 🛠️ 기술적 구현 (Implementation Details)

### 아키텍처 (Architecture)
v-mate는 **이벤트 기반 비동기 아키텍처**를 따릅니다.

1.  **Input Listener**:
    *   별도 스레드(`daemon thread`)에서 실행됩니다.
    *   `pynput`을 통해 글로벌 키보드 이벤트를 감지합니다.
    *   macOS의 `Quartz` 이벤트 탭을 우회하여 안정적으로 입력을 받습니다.
2.  **WebSocket Server**:
    *   `FastAPI` 기반의 서버가 클라이언트(브라우저)와 실시간 양방향 통신을 유지합니다.
    *   오디오 스트림, 이미지 데이터, 텍스트 메시지를 실시간으로 주고받습니다.
3.  **Service Context**:
    *   LLM, ASR, TTS 엔진 인스턴스를 싱글톤으로 관리합니다.
    *   요청이 들어올 때마다 적절한 엔진을 호출하여 리소스를 효율적으로 관리합니다.
4.  **Agent System**:
    *   `BasicMemoryAgent`가 대화의 맥락(History)을 관리합니다.
    *   사용자 의도에 따라 `VisionTool`, `NotionTool`, `SearchTool` 등을 동적으로 호출(Function Calling)합니다.

### 디렉토리 구조 (Directory Structure)

```
Open-LLM-VTuber/
├── src/
│   └── open_llm_vtuber/
│       ├── agent/                 # AI 에이전트 로직
│       │   ├── agents/            # BasicMemoryAgent 등 구현체
│       │   └── tools/             # 도구 (Notion, Vision, Search 등)
│       │       ├── vision_tool.py   # mss 기반 화면 캡처
│       │       ├── notion_tool.py   # Notion API 연동
│       │       ├── research_tool.py # DuckDuckGo/arXiv 검색
│       │       └── focus_tool.py    # 활성 창 감지
│       ├── conversations/         # 대화 처리 파이프라인
│       ├── input_listener.py      # 글로벌 단축키 감지 (pynput)
│       ├── server.py              # FastAPI 서버 및 WebSocket 핸들러
│       └── service_context.py     # 서비스 컴포넌트 관리
├── config_templates/              # 설정 파일 템플릿
├── frontend/                      # React 프론트엔드 (빌드됨)
├── run_server.py                  # 서버 실행 진입점
└── pyproject.toml                 # 의존성 관리
```

### 주요 라이브러리
*   **Backend**: `fastapi`, `uvicorn`, `websockets`
*   **AI/ML**: `openai`, `langchain` (일부), `numpy`
*   **System**: `pynput` (입력 제어), `mss` (화면 캡처), `pyautogui` (마우스 제어)
*   **Integration**: `notion-client`, `duckduckgo-search`
*   **Frontend**: `React`, `Live2D Cubism SDK`

---

## 🐛 문제 해결 (Troubleshooting)

### Q. 단축키(Cmd+Shift+S)가 작동하지 않아요.
*   **원인**: macOS의 보안 정책으로 인해 터미널이 키보드 입력을 가로채지 못하는 경우입니다.
*   **해결**:
    1.  `시스템 설정` > `개인정보 보호 및 보안`으로 이동합니다.
    2.  `입력 모니터링(Input Monitoring)` 목록에 사용 중인 터미널(iTerm, Terminal, VSCode 등)을 추가하고 체크합니다.
    3.  `화면 기록(Screen Recording)` 목록에도 동일하게 추가합니다.
    4.  터미널을 재시작합니다.
*   **확인**: 서버 실행 시 로그에 `Global Hotkey Listener started` 메시지가 뜨는지 확인하세요.

### Q. Notion에 저장이 안 돼요.
*   **원인 1**: Integration Token이 잘못되었거나 누락되었습니다.
*   **원인 2**: Integration이 해당 페이지에 초대되지 않았습니다.
*   **해결**:
    *   Notion 페이지 우측 상단 `...` 메뉴에서 `Connect`를 눌러 생성한 Integration을 추가했는지 확인하세요. 토큰만 있다고 저장되지 않습니다. 권한 부여가 필수입니다.
    *   `conf.yaml`의 `notion_parent_page_id`가 정확한지(32자리) 확인하세요.

### Q. 화면 인식이 너무 느려요.
*   **원인**: 고해상도 이미지를 업로드하고 분석하는 과정은 텍스트 처리보다 리소스를 많이 소모합니다.
*   **해결**:
    *   `gpt-4o` 모델을 사용하면 가장 빠른 속도를 경험할 수 있습니다.
    *   네트워크 속도가 느리다면 이미지 해상도를 낮추는 옵션을 고려할 수 있습니다(코드 수정 필요).

### Q. "No active client connected" 에러가 떠요.
*   **원인**: 단축키를 눌렀는데 브라우저(클라이언트)가 연결되어 있지 않은 경우입니다.
*   **해결**: 브라우저에서 `http://localhost:12393`을 열고 마이크 권한을 허용하여 WebSocket 연결을 수립하세요.

---

## 📜 라이선스 및 크레딧

### Open-LLM-VTuber
이 프로젝트는 훌륭한 오픈소스 프로젝트인 **[Open-LLM-VTuber](https://github.com/t41372/Open-LLM-VTuber)**를 포크하여 개발되었습니다. 원작자분들의 노고에 깊은 감사를 드립니다.
*   **License**: MIT License

### Live2D Models
*   본 프로젝트에 포함된 샘플 모델(Shizuku 등)은 **Live2D Inc.**의 자산입니다.
*   해당 모델들은 **Live2D Free Material License Agreement** 및 **Live2D Cubism Sample Data Terms of Use**에 따라 사용됩니다.
*   상업적 목적으로 사용할 경우, 반드시 Live2D Inc.의 별도 라이선스 정책을 확인해야 합니다.

---

## 🤝 기여 (Contributing)

v-mate는 오픈소스 프로젝트입니다. 여러분의 기여를 환영합니다!
*   **Bug Report**: 이슈 탭에 버그를 제보해주세요.
*   **Feature Request**: 새로운 기능 아이디어가 있다면 제안해주세요.
*   **Pull Request**: 코드를 직접 수정하여 PR을 보내주시면 검토 후 반영하겠습니다.

---

**v-mate**와 함께 더 스마트한 데스크탑 라이프를 시작하세요! 🚀
