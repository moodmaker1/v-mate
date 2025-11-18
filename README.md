# v-mate 💡

대학생을 위한 AI 학습 도우미 Chrome Extension

## 기능

- 웹페이지에서 텍스트를 드래그하면 GPT가 쉽게 설명해줍니다
- 현재 페이지의 맥락을 고려한 맞춤형 설명
- 깔끔하고 직관적인 UI

## 설치 방법

1. Chrome 브라우저에서 `chrome://extensions/` 접속
2. 우측 상단 "개발자 모드" 활성화
3. "압축해제된 확장 프로그램을 로드합니다" 클릭
4. 이 프로젝트 폴더 선택

## 설정

1. 확장 프로그램 아이콘 클릭
2. OpenAI API 키 입력 및 저장
3. API 키 발급: https://platform.openai.com/api-keys

## 사용 방법

1. 웹페이지에서 궁금한 텍스트를 드래그
2. 나타나는 💡 아이콘 클릭
3. GPT의 설명 확인!

## 기술 스택

- Chrome Extension Manifest V3
- Vanilla JavaScript
- OpenAI GPT-4o-mini API

## 프로젝트 구조

```
v-mate/
├── manifest.json       # 확장 프로그램 설정
├── content.js         # 웹페이지 상호작용
├── background.js      # API 통신
├── styles.css         # UI 스타일
├── popup.html         # 설정 팝업 UI
├── popup.js           # 설정 팝업 로직
└── icons/            # 아이콘 이미지
```

## 개발 상태

- [x] 초기 프로젝트 구조
- [x] Step 1: 텍스트 드래그 감지
- [x] Step 2: 메시지 통신 시스템
- [x] Step 3: GPT API 연동
- [x] Step 4: 팝업 UI 구현
- [x] Step 5: 아이콘 클릭 방식

## 다음 단계

- 📖 상세한 설치 및 사용 가이드: [INSTALL.md](INSTALL.md)
- 🔑 API 키 설정 가이드: [SETUP.md](SETUP.md)

## API 키 관리

이 프로젝트는 두 가지 방법으로 API 키를 관리할 수 있습니다:

1. **config.js 파일** (개발용 - git에 커밋되지 않음)
2. **Chrome Storage** (사용자 입력 - popup에서 설정)

자세한 내용은 [SETUP.md](SETUP.md)를 참조하세요.
