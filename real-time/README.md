# v-mate 💡

> 대학생을 위한 AI 기반 학습 도우미 Chrome Extension

웹서핑 중 모르는 단어나 개념을 만나면? 텍스트를 드래그하고 💡 아이콘만 클릭하세요!  
GPT가 페이지 맥락을 고려해서 쉽고 명확하게 설명해드립니다.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Chrome](https://img.shields.io/badge/Chrome-88%2B-green)
![Manifest](https://img.shields.io/badge/Manifest-V3-orange)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

## ✨ 주요 기능

- 🎯 **텍스트 선택으로 즉시 설명**: 드래그 → 클릭 → 이해!
- 🧠 **맥락 기반 설명**: 현재 보고 있는 페이지의 주제를 고려한 맞춤 설명
- ⚡ **빠른 응답**: GPT-4o-mini로 1-2초 내 답변
- 🎨 **깔끔한 UI**: 방해되지 않는 우아한 디자인
- 🔒 **안전한 API 키 관리**: 로컬 저장, 외부 유출 없음

---

## 🚀 빠른 시작

### 1. 설치하기

```bash
# 1. 저장소 클론 (또는 다운로드)
git clone https://github.com/your-username/v-mate.git
cd v-mate

# 2. API 키 설정
# config.js 파일을 열어서 YOUR_API_KEY_HERE를 실제 OpenAI API 키로 교체

# 3. Chrome에 로드
# chrome://extensions/ 접속
# 개발자 모드 ON
# "압축해제된 확장 프로그램을 로드합니다" 클릭
# v-mate 폴더 선택
```

### 2. API 키 발급받기

1. [OpenAI Platform](https://platform.openai.com/api-keys) 접속
2. "Create new secret key" 클릭
3. 생성된 키를 `config.js`에 입력:

```javascript
const CONFIG = {
  OPENAI_API_KEY: 'sk-proj-xxxxxxxxxxxxxxxxxx'  // 여기에 붙여넣기
};
```

### 3. 사용하기

1. 웹페이지에서 **궁금한 텍스트를 드래그**
2. 나타나는 **💡 아이콘을 클릭**
3. **GPT의 설명 확인!**

---

## 📖 사용 예시

### 전문 용어 이해하기
```
위키백과에서 "정규화" 드래그 → 💡 클릭
→ "정규화는 데이터베이스에서 중복을 제거하고..."
```

### 영어 단어 학습
```
영어 기사에서 "comprehensive" 선택 → 💡 클릭
→ "포괄적인, 종합적인 이라는 뜻으로..."
```

### 코드 개념 공부
```
기술 블로그에서 "REST API" 드래그 → 💡 클릭
→ "REST API는 웹에서 자원을 다루는 표준 방식으로..."
```

---

## 🛠️ 기술 스택

| 분야 | 기술 |
|-----|------|
| **프론트엔드** | Vanilla JavaScript (ES6+), HTML5, CSS3 |
| **플랫폼** | Chrome Extension (Manifest V3) |
| **API** | OpenAI GPT-4o-mini |
| **통신** | Chrome Message Passing, Fetch API |
| **저장소** | Chrome Storage API |
| **의존성** | Zero Dependencies ⚡ |

---

## 📁 프로젝트 구조

```
v-mate/
├── manifest.json          # Chrome Extension 설정
├── content.js            # 웹페이지 UI 및 이벤트 처리
├── background.js         # GPT API 통신 (Service Worker)
├── styles.css            # 팝업 및 아이콘 스타일
├── popup.html            # 설정 팝업 UI
├── popup.js              # 설정 로직
├── config.js             # API 키 설정 (git 제외)
├── config.example.js     # API 키 템플릿
├── .gitignore            # Git 제외 파일 목록
├── README.md             # 이 파일
├── SETUP.md              # 상세 설정 가이드
└── TROUBLESHOOTING.md    # 문제 해결 가이드
```

---

## ⚙️ 설정

### API 키 설정 방법

#### 방법 1: config.js 사용 (개발용 - 권장)

```javascript
// config.js 파일 수정
const CONFIG = {
  OPENAI_API_KEY: 'sk-proj-your-actual-api-key-here'
};
```

#### 방법 2: 확장 프로그램 팝업 사용

1. Chrome 툴바에서 v-mate 아이콘 클릭
2. API 키 입력란에 키 붙여넣기
3. "저장" 버튼 클릭

> 💡 **Tip**: config.js가 popup 설정보다 우선순위가 낮습니다. 둘 다 설정하면 popup의 키가 사용됩니다.

자세한 내용: [SETUP.md](SETUP.md)

### GPT 프롬프트 커스터마이징

`background.js` 파일의 40-47번째 줄에서 프롬프트를 수정할 수 있습니다:

```javascript
// 시스템 프롬프트 (AI의 역할 정의)
const systemPrompt = '당신은 대학생의 학습을 돕는 AI 도우미입니다...';

// 사용자 프롬프트 (실제 질문 내용)
const userPrompt = `페이지: ${pageTitle}
선택된 텍스트: "${selectedText}"
...`;
```

수정 후 `chrome://extensions/`에서 🔄 새로고침 버튼을 누르세요.

---

## 🐛 문제 해결

### 아이콘이 나타나지 않아요

- ✅ 3글자 이상 선택했나요?
- ✅ input/textarea가 아닌 일반 텍스트인가요?
- ✅ 페이지를 새로고침(F5)했나요?
- ✅ 확장 프로그램이 활성화되어 있나요?

### "API 키가 설정되지 않았습니다" 오류

1. `config.js`에 올바른 API 키 입력
2. `chrome://extensions/`에서 v-mate 새로고침
3. 테스트 페이지 새로고침

### API 호출 실패

- **401 오류**: API 키가 잘못되었거나 만료됨
- **429 오류**: API 사용량 초과 (잠시 대기)
- **네트워크 오류**: 인터넷 연결 확인

더 자세한 문제 해결: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## 💰 비용 정보

- **모델**: GPT-4o-mini
- **예상 비용**: 요청당 약 $0.0001~0.0002 (매우 저렴)
- **max_tokens**: 200으로 제한
- **무료 크레딧**: 신규 가입 시 OpenAI에서 제공 ($5)

> 💡 100번 사용해도 약 $0.02 ($20 = 약 100,000회 사용 가능)

---

## 🔒 개인정보 보호

- ✅ API 키는 브라우저 로컬에만 저장
- ✅ 선택한 텍스트와 페이지 정보만 OpenAI로 전송
- ✅ 제3자 서버 미경유
- ✅ 사용자 데이터 수집 없음
- ✅ 오픈소스 - 코드 검증 가능

---

## 🤝 기여하기

기여는 언제나 환영합니다! 🎉

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 개선 아이디어
- [ ] 다국어 지원 (한/영 자동 감지)
- [ ] 설명 히스토리 저장
- [ ] 단축키 지원
- [ ] 음성 읽어주기
- [ ] 북마크 기능
- [ ] 다크 모드

---

## 📜 라이센스

MIT License - 자유롭게 사용, 수정, 배포하세요!

---

## 🙋‍♂️ 자주 묻는 질문 (FAQ)

### Q: 인터넷 연결이 필요한가요?
A: 네, GPT API 호출을 위해 인터넷 연결이 필요합니다.

### Q: Chrome 외 다른 브라우저에서도 작동하나요?
A: 현재는 Chrome만 지원합니다. Edge(Chromium 기반)에서도 작동할 수 있습니다.

### Q: API 키 없이 사용할 수 있나요?
A: 아니요, OpenAI API 키가 반드시 필요합니다.

### Q: 오프라인에서도 작동하나요?
A: API 호출이 필요하므로 오프라인에서는 작동하지 않습니다.

### Q: 모바일에서 사용할 수 있나요?
A: Chrome Extension은 데스크톱 Chrome에서만 작동합니다.

---

## 📧 문의

- **Issues**: [GitHub Issues](https://github.com/your-username/v-mate/issues)
- **Email**: your-email@example.com

---

## 🌟 감사합니다!

v-mate가 여러분의 학습에 도움이 되길 바랍니다. ⭐  
유용하셨다면 Star를 눌러주세요!

---

<div align="center">

**[⬆ 맨 위로](#v-mate-)**

Made with ❤️ for students everywhere

</div>
