# 🔧 v-mate 문제 해결 가이드

## ❌ TypeError: Cannot read properties of undefined (reading 'sendMessage')

### 원인
확장 프로그램이 제대로 새로고침되지 않았거나 웹페이지가 새로고침되지 않았습니다.

### 해결 방법

#### 1단계: 확장 프로그램 새로고침 (중요!)

1. `chrome://extensions/` 페이지를 엽니다

2. v-mate 확장 프로그램을 찾습니다

3. **🔄 새로고침** 버튼을 클릭합니다
   ```
   ┌─────────────────────────────┐
   │ 💡 v-mate            1.0.0  │
   │                             │
   │ 🔄 새로고침  🗑️ 삭제       │  ← 이 버튼 클릭!
   └─────────────────────────────┘
   ```

4. 또는 확장 프로그램을 **끄고(OFF) → 다시 켜기(ON)**

#### 2단계: 웹페이지 새로고침

1. 테스트하던 웹페이지로 돌아갑니다

2. **F5** 키를 눌러서 페이지를 새로고침합니다
   - 또는 주소창에서 새로고침 버튼 클릭

3. 개발자 도구(F12) 콘솔에서 다음 메시지 확인:
   ```
   v-mate content script loaded
   ```

#### 3단계: 다시 테스트

1. 텍스트를 드래그로 선택 (3글자 이상)

2. 💡 아이콘이 나타나는지 확인

3. 💡 아이콘을 클릭

4. 정상 작동!

---

## 📋 완전 새로 시작하기

문제가 계속되면 처음부터 다시:

### 1. 확장 프로그램 완전 제거
```
chrome://extensions/
→ v-mate 찾기
→ 🗑️ 삭제 버튼 클릭
→ 확인
```

### 2. Chrome 재시작
- Chrome을 완전히 종료
- 다시 열기

### 3. 다시 설치
```
1. chrome://extensions/ 열기
2. 개발자 모드 ON
3. "압축해제된 확장 프로그램을 로드합니다" 클릭
4. E:\projects\v-mate 폴더 선택
```

### 4. 테스트
```
1. 새 탭 열기
2. 아무 웹사이트 방문
3. 텍스트 드래그
4. 💡 클릭
```

---

## 🔍 Background Script 확인

### 1. Service Worker 상태 확인

1. `chrome://extensions/` 페이지 열기

2. v-mate에서 **"service worker"** 링크 클릭
   - 파란색 링크로 표시됨
   - "검사 중..." 또는 "비활성" 상태일 수 있음

3. 새 창이 열리면 **Console** 탭에서 로그 확인:
   ```
   v-mate background service worker loaded
   API 키 소스: config.js
   ```

4. 로그가 없으면:
   - 확장 프로그램 새로고침
   - service worker 링크를 다시 클릭

### 2. API 키 확인

Console에 다음과 같이 표시되어야 합니다:
```javascript
API 키 소스: config.js
```

만약 다른 메시지가 보이면:
- `config.js` 파일을 확인
- API 키가 올바르게 입력되었는지 확인

---

## 🐛 기타 문제들

### 💡 아이콘이 안 나타남

**확인 사항:**
- ✅ 3글자 이상 선택했나요?
- ✅ input/textarea가 아닌 일반 텍스트인가요?
- ✅ 확장 프로그램이 켜져 있나요?
- ✅ 페이지를 새로고침했나요?

**해결:**
```javascript
// 콘솔에서 확인
console.log('선택:', window.getSelection().toString());
// 3글자 이상이면 작동해야 함
```

### "API 키가 설정되지 않았습니다" 오류

**원인:**
- config.js에 API 키가 없거나 잘못됨

**해결:**
1. `E:\projects\v-mate\config.js` 파일 열기
2. API 키 확인:
   ```javascript
   const CONFIG = {
     OPENAI_API_KEY: 'sk-proj-...'  // 실제 키가 있는지 확인
   };
   ```
3. 확장 프로그램 새로고침

### "API 오류: 401" 또는 "Invalid API key"

**원인:**
- API 키가 만료되었거나 잘못됨

**해결:**
1. https://platform.openai.com/api-keys 접속
2. 새 API 키 생성
3. `config.js`에 새 키 입력
4. 확장 프로그램 새로고침

### "API 오류: 429" - Rate limit exceeded

**원인:**
- API 호출 한도 초과
- 무료 크레딧 소진

**해결:**
1. https://platform.openai.com/usage 에서 사용량 확인
2. 잠시 대기 후 재시도
3. 필요시 크레딧 충전

### 팝업이 표시되지 않음

**확인:**
1. F12 개발자 도구 열기
2. Console 탭에서 오류 확인
3. Elements 탭에서 `.vmate-popup` 검색
4. 없으면 코드에 문제가 있음

**해결:**
- 확장 프로그램 완전 재설치

---

## 💻 개발자 도구 활용

### Content Script 디버깅

1. 웹페이지에서 **F12** 누르기
2. **Console** 탭 선택
3. 다음 명령어로 테스트:

```javascript
// 확장 프로그램이 로드되었는지 확인
console.log('v-mate loaded?', typeof chrome !== 'undefined');

// 텍스트 선택 확인
console.log('Selected:', window.getSelection().toString());

// 수동으로 아이콘 표시 (테스트용)
// content.js의 함수를 호출할 수 없지만, DOM 확인 가능
document.querySelectorAll('.vmate-icon-button');
```

### Background Script 디버깅

1. `chrome://extensions/` 열기
2. v-mate의 **"service worker"** 클릭
3. Console에서 확인:

```javascript
// API 키 확인 (민감정보 주의!)
console.log('API Key set?', OPENAI_API_KEY !== 'YOUR_API_KEY_HERE');

// 수동으로 API 테스트 (선택사항)
callGPTAPI('테스트', '페이지', 'https://example.com')
  .then(result => console.log('Result:', result));
```

---

## ✅ 정상 작동 확인

다음 로그가 보이면 정상입니다:

### Content Script (웹페이지 콘솔):
```
v-mate content script loaded
=== v-mate 텍스트 선택 감지 ===
선택된 텍스트: 머신러닝
페이지 제목: 인공지능
URL: https://...
background.js로 메시지 전송 중...
background.js로부터 응답 받음: {success: true, explanation: "..."}
```

### Background Script (service worker 콘솔):
```
v-mate background service worker loaded
API 키 소스: config.js
Background received message: {action: "explain", data: {...}}
설명 요청 받음: {...}
GPT API 호출 중...
GPT 응답: [설명 내용]
```

---

## 🆘 그래도 안 되면?

1. **Chrome 버전 확인**
   - 최소 88 이상 필요
   - `chrome://settings/help`에서 확인

2. **manifest.json 확인**
   - 문법 오류가 없는지 확인
   - JSON validator 사용

3. **완전 재설치**
   - 확장 프로그램 삭제
   - Chrome 재시작
   - 다시 설치

4. **파일 권한 확인**
   - 프로젝트 폴더에 읽기 권한이 있는지 확인

5. **바이러스 백신/방화벽**
   - Chrome 확장 프로그램 차단 여부 확인

---

## 📞 추가 도움

문제가 계속되면:
- 콘솔의 전체 오류 메시지를 복사
- `chrome://extensions/`에서 오류 버튼 확인
- manifest.json, content.js, background.js 파일 재확인

모든 파일이 제대로 저장되었는지 확인하세요!

