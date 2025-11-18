# v-mate API 키 설정 가이드 🔑

## 방법 1: config.js 파일 사용 (권장 - 개발용)

### 장점
- ✅ 매번 입력할 필요 없음
- ✅ git에 커밋되지 않음 (.gitignore)
- ✅ 개발할 때 편리함

### 설정 방법

1. **config.js 파일 수정**
   ```javascript
   // config.js 파일을 열어서 YOUR_API_KEY_HERE를 실제 키로 교체
   const CONFIG = {
     OPENAI_API_KEY: 'sk-proj-xxxxxxxxxxxx'  // 실제 OpenAI API 키
   };
   ```

2. **확장 프로그램 새로고침**
   - `chrome://extensions/` 페이지에서 새로고침 버튼 클릭
   - 또는 확장 프로그램 제거 후 다시 로드

3. **테스트**
   - 웹페이지에서 텍스트 드래그
   - 💡 아이콘 클릭
   - 설명이 표시되면 성공!

### ⚠️ 주의사항
- `config.js`는 git에 커밋되지 않습니다
- `config.example.js`는 템플릿 파일입니다 (커밋됨)
- API 키를 절대 공개 저장소에 올리지 마세요!

---

## 방법 2: Chrome Storage 사용 (배포용)

### 장점
- ✅ 사용자가 직접 API 키 입력
- ✅ 배포/공유할 때 안전함
- ✅ 여러 기기에서 동기화 가능

### 설정 방법

1. **확장 프로그램 아이콘 클릭**
   - Chrome 브라우저 우측 상단의 v-mate 아이콘 클릭

2. **API 키 입력**
   - OpenAI API 키를 입력란에 붙여넣기
   - "저장" 버튼 클릭

3. **API 키 발급**
   - https://platform.openai.com/api-keys
   - "Create new secret key" 클릭
   - 생성된 키를 복사하여 사용

---

## 우선순위

프로그램은 다음 순서로 API 키를 찾습니다:

1. **Chrome Storage** (popup에서 입력한 키)
2. **config.js** (개발용 설정 파일)
3. **기본값** (YOUR_API_KEY_HERE - 오류 발생)

Chrome Storage에 키가 저장되어 있으면 config.js보다 우선합니다.

---

## .gitignore 설정

다음 파일들은 git에 추적되지 않습니다:

```
config.js          # 실제 API 키가 들어있는 파일
.env               # 환경 변수 파일
node_modules/      # 의존성
*.log              # 로그 파일
.DS_Store          # macOS 시스템 파일
```

---

## 팀 협업 시

### 새로운 팀원이 프로젝트를 받았을 때:

1. **저장소 클론**
   ```bash
   git clone [repository-url]
   cd v-mate
   ```

2. **config.js 생성**
   ```bash
   # config.example.js를 복사하여 config.js 생성
   copy config.example.js config.js
   ```

3. **API 키 입력**
   - `config.js` 파일을 열어서 자신의 API 키 입력

4. **확장 프로그램 로드**
   - `chrome://extensions/`에서 프로젝트 폴더 로드

---

## 문제 해결

### "API 키가 설정되지 않았습니다" 오류

**원인**: API 키가 없거나 잘못됨

**해결 방법**:
1. `config.js`에 올바른 API 키 입력
2. 또는 popup에서 API 키 저장
3. 확장 프로그램 새로고침

### config.js를 수정했는데 반영이 안 됨

**해결 방법**:
1. `chrome://extensions/` 페이지 열기
2. v-mate 확장 프로그램의 새로고침 버튼 클릭
3. 또는 확장 프로그램을 끄고 다시 켜기

### 콘솔에서 API 키 소스 확인

개발자 도구에서 확인:
```
chrome://extensions/
→ v-mate의 "service worker" 링크 클릭
→ Console 탭에서 "API 키 소스: config.js" 또는 "Chrome Storage" 확인
```

---

## 보안 팁 💡

1. **절대 API 키를 코드에 하드코딩하지 마세요**
2. **config.js는 .gitignore에 포함되어 있는지 확인**
3. **공개 저장소에 푸시하기 전에 git status로 확인**
4. **API 키가 노출되었다면 즉시 재발급**

---

## 추가 정보

- OpenAI API 키 관리: https://platform.openai.com/account/api-keys
- API 사용량 확인: https://platform.openai.com/usage
- Chrome Extension Storage API: https://developer.chrome.com/docs/extensions/reference/storage/

