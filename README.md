# v-mate 💡

> 대학생을 위한 AI 기반 학습 도우미 Chrome Extension v2.0

**2가지 학습 모드를 제공합니다:**
1. **실시간 설명 💡** - 텍스트 드래그하면 즉시 GPT 설명
2. **스마트 퀴즈 ❓** - OX/객관식/서술형 퀴즈 생성 + 자동 채점

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Chrome](https://img.shields.io/badge/Chrome-88%2B-green)
![Manifest](https://img.shields.io/badge/Manifest-V3-orange)

---

## ✨ 주요 기능

### 1️⃣ 실시간 맥락 이해 도우미 💡
- 웹페이지에서 텍스트 드래그 → 💡 보라색 아이콘
- 아이콘 클릭 → 현재 페이지 맥락을 고려한 AI 설명
- 3-5줄로 간결하고 명확하게

### 2️⃣ 스마트 퀴즈 생성기 ❓ (NEW!)
- 텍스트 드래그 → ❓ 파란색 아이콘 클릭
- **⭕ OX 퀴즈** - O/X 버튼으로 즉시 정답 확인
- **📝 객관식 (4지선다)** - 라디오 버튼 선택 + 정답 확인
- **✏️ 서술형** - 답변 입력 + 키워드 기반 자동 채점 (0-100점)

---

## 🚀 빠른 시작

### 1. 설치
```bash
1. chrome://extensions/ 접속
2. 개발자 모드 ON
3. "압축해제된 확장 프로그램을 로드합니다" 클릭
4. v-mate 폴더 선택
```

### 2. API 키 설정
```javascript
// config.js 파일 수정
const CONFIG = {
  OPENAI_API_KEY: 'sk-proj-xxxxxxxxxxxxxxxxxx'  // 실제 API 키
};
```

**API 키 발급:** https://platform.openai.com/api-keys

### 3. 모드 선택
```
확장 프로그램 아이콘 클릭 → 원하는 모드 선택
🔘 실시간 설명 💡  or  ○ 퀴즈 모드 ❓
```

### 4. 사용하기!
```
웹페이지에서 텍스트 드래그 → 아이콘 클릭 → 완료!
```

---

## 📁 프로젝트 구조

```
v-mate/
├── manifest.json          # Chrome Extension 설정
├── config.js              # API 키 (git 제외)
│
├── shared/                # 공통 모듈
│   ├── background.js      # 메시지 라우터 + GPT 통합
│   └── gpt-api.js         # GPT API 공통 함수
│
├── real-time/             # 실시간 설명 모드 💡
│   ├── content.js         # 드래그 감지 + UI
│   ├── styles.css         # 스타일 (보라색)
│   └── icons/             # 확장 프로그램 아이콘
│
├── quiz/                  # 퀴즈 모드 ❓
│   ├── content.js         # 퀴즈 생성 로직
│   ├── styles.css         # 스타일 (파란색)
│   └── ui/                # 퀴즈 UI 컴포넌트
│       ├── ox-quiz.js           # ⭕ OX 퀴즈
│       ├── multiple-choice-quiz.js  # 📝 객관식
│       └── subjective-quiz.js       # ✏️ 서술형
│
└── popup/                 # 설정 팝업
    ├── popup.html         # 모드 선택 UI
    ├── popup.js           # 로직
    └── popup.css          # 스타일
```

---

## 🎯 사용 예시

### 실시간 설명 모드 💡
```
1. 팝업에서 "실시간 설명" 선택
2. 위키백과에서 "데이터베이스 정규화" 드래그
3. 💡 보라색 아이콘 클릭
4. GPT 설명: "정규화는 데이터 중복을 제거하고..."
```

### 퀴즈 모드 ❓
```
1. 팝업에서 "퀴즈 모드" 선택
2. 웹페이지 새로고침 (F5)
3. "REST API" 드래그
4. ❓ 파란색 아이콘 클릭
5. 퀴즈 타입 선택 (OX/객관식/서술형)
6. 퀴즈 풀기!
   - OX: O/X 버튼 클릭 → 정답 확인
   - 객관식: 선택 → "정답 확인하기" 버튼
   - 서술형: 답 작성 → "제출하기" → AI 채점
```

---

## 🛠️ 기술 스택

| 분야 | 기술 |
|-----|------|
| **언어** | Vanilla JavaScript (ES6+) |
| **UI** | HTML5, CSS3, DOM API |
| **플랫폼** | Chrome Extension Manifest V3 |
| **API** | OpenAI GPT-4o-mini |
| **통신** | Chrome Message Passing |
| **저장소** | Chrome Storage API |
| **아키텍처** | 모듈형 (real-time + quiz) |
| **의존성** | Zero Dependencies ⚡ |

---

## 🎨 UI/UX 특징

### 색상 구분
- **실시간 설명 💡**: 보라색 그라데이션 (#667eea)
- **퀴즈 모드 ❓**: 파란색 그라데이션 (#4facfe)

### 애니메이션
- 아이콘 등장: fade-in + scale
- 팝업 등장: fade-in + slide-up
- 정답/오답: bounce effect

### 반응형
- 최대 너비 450-500px
- 스크롤 가능한 컨텐츠
- 모바일 최적화 (향후)

---

## 🐛 문제 해결

### 아이콘이 안 나타나요
- ✅ 올바른 모드가 선택되었는지 확인
- ✅ 페이지 새로고침 (F5)
- ✅ 3글자 이상 선택
- ✅ input/textarea는 제외됨

### "API 키가 설정되지 않았습니다"
1. config.js에 API 키 확인
2. 또는 팝업에서 API 키 입력
3. 확장 프로그램 새로고침 (chrome://extensions/)

### 모드 전환이 안 돼요
1. 팝업에서 모드 변경
2. 웹페이지 **반드시 새로고침 (F5)**
3. 새 탭에서 테스트

### 퀴즈가 이상하게 표시돼요
- GPT 응답 형식이 다를 수 있음
- 다시 생성해보기
- 다른 텍스트로 시도

상세 가이드: **USAGE_GUIDE.md**

---

## 💰 비용 정보

- **모델**: GPT-4o-mini (가장 저렴)
- **예상 비용**:
  - 설명: ~$0.0001/회
  - OX 퀴즈: ~$0.0001/회
  - 객관식: ~$0.0002/회
  - 서술형: ~$0.0003/회
- **100회 사용**: 약 $0.01~0.03

---

## 🔒 개인정보 보호

- ✅ API 키는 브라우저 로컬에만 저장
- ✅ 선택한 텍스트만 OpenAI로 전송
- ✅ 제3자 서버 미경유
- ✅ 오픈소스 - 코드 투명

---

## 🌟 로드맵

### v2.0 (현재) ✅
- [x] 실시간 설명 모드
- [x] 퀴즈 모드 (OX/객관식/서술형)
- [x] 모드 전환 시스템
- [x] 인터랙티브 UI
- [x] 키워드 기반 자동 채점

### v2.1 (계획)
- [ ] 오답 노트 기능
- [ ] 퀴즈 히스토리
- [ ] 학습 통계
- [ ] GPT 기반 서술형 채점 (더 정확)

### v3.0 (미래)
- [ ] 집중 관리자 모드
- [ ] 자동 노션 정리
- [ ] 페인만 학습법 체커

---

## 🤝 기여하기

1. Fork the Project
2. Create Feature Branch
3. Commit Changes
4. Push to Branch
5. Open Pull Request

### 기여 아이디어
- [ ] 퀴즈 난이도 조절
- [ ] 다국어 지원
- [ ] 음성 읽기
- [ ] 다크 모드
- [ ] 단축키 지원

---

## 📜 라이센스

MIT License - 자유롭게 사용, 수정, 배포하세요!

---

<div align="center">

**Made with ❤️ for students everywhere**

[⬆ 맨 위로](#v-mate-)

v2.0.0 | 2024

</div>
