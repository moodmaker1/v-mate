# ⚙️ config.js 설정 가이드

매번 팝업에서 API 키를 입력하는 게 번거롭다면? **config.js** 파일에 한 번만 설정해두세요!

---

## 🎯 장점

✅ **한 번만 설정** - 팝업에서 매번 입력할 필요 없음  
✅ **자동 로드** - Extension 로드 시 자동으로 적용  
✅ **Git 안전** - config.js는 `.gitignore`에 포함되어 공개 저장소에 올라가지 않음  
✅ **팀 작업 편리** - config.example.js를 공유하면 팀원이 쉽게 설정 가능

---

## 📝 설정 방법

### 1️⃣ config.js 파일 열기

파일 위치: `v-mate/config.js`

### 2️⃣ API 키 입력

```javascript
const CONFIG = {
  // OpenAI GPT API (필수)
  OPENAI_API_KEY: 'sk-proj-xxxxxxxxxxxxxxx',  // 실제 키 입력
  
  // ElevenLabs TTS API (선택)
  ELEVENLABS_API_KEY: 'sk_xxxxxxxxxxxxxxx',  // 실제 키 입력
  ELEVENLABS_VOICE_ID: 'uyVNoMrnUku1dZyVEXwD',
  
  // Notion API (선택)
  NOTION_TOKEN: 'secret_xxxxxxxxxxxxxxx',  // 실제 Token 입력
  NOTION_DATABASE_ID: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'  // 실제 Database ID 입력
};
```

### 3️⃣ 저장 후 Extension 새로고침

```
1. config.js 파일 저장 (Ctrl+S)
2. chrome://extensions/ 접속
3. v-mate 확장 프로그램 찾기
4. 🔄 새로고침 버튼 클릭
```

### 4️⃣ 자동 적용 확인

```
1. v-mate 아이콘 클릭
2. 팝업 확인:
   - "OpenAI API 키 저장됨" ✅
   - "ElevenLabs API 키 저장됨" ✅
   - "Token 저장됨" ✅
   - "Database ID 저장됨" ✅
```

---

## 🔑 각 API 키 발급 방법

### OpenAI API 키 (필수)

1. https://platform.openai.com/api-keys 접속
2. "+ Create new secret key" 클릭
3. 키 복사 (sk-proj-로 시작)
4. config.js에 붙여넣기

### ElevenLabs API 키 (선택)

1. https://elevenlabs.io/app/settings/api-keys 접속
2. "+ New" 클릭
3. 키 복사 (sk_로 시작)
4. config.js에 붙여넣기

### Notion Integration Token (선택)

1. https://www.notion.so/my-integrations 접속
2. "+ New integration" 클릭
3. 이름: "v-mate" 입력
4. Capabilities: Read content, Insert content 체크
5. Submit → Token 복사 (secret_로 시작)
6. config.js에 붙여넣기

### Notion Database ID (선택)

1. Notion 데이터베이스 페이지 열기
2. URL 확인: `notion.so/[여기가-Database-ID]?v=...`
3. 32자리 ID 복사
4. config.js에 붙여넣기

---

## 🔒 보안 주의사항

### ✅ 안전한 것

- `config.js`는 `.gitignore`에 포함되어 있음
- Git에 커밋해도 공개 저장소에 올라가지 않음
- 로컬 PC에만 저장됨

### ⚠️ 주의할 것

- `config.js` 파일을 **공개 저장소에 직접 업로드하지 마세요**
- 스크린샷 찍을 때 API 키가 보이지 않도록 주의
- config.js를 다른 사람과 공유하지 마세요

### 💡 팁

- 팀 프로젝트라면 `config.example.js`만 공유
- 각 팀원이 자신의 `config.js` 생성
- API 키는 개인별로 발급받아 사용

---

## 🆚 config.js vs 팝업 입력

| 항목 | config.js | 팝업 입력 |
|------|-----------|-----------|
| **편리성** | ⭐⭐⭐⭐⭐ 한 번만 설정 | ⭐⭐ 매번 입력 |
| **개발자 친화** | ⭐⭐⭐⭐⭐ 코드로 관리 | ⭐⭐ UI 클릭 |
| **팀 작업** | ⭐⭐⭐⭐⭐ example 공유 | ⭐⭐⭐ 각자 입력 |
| **보안** | ⭐⭐⭐⭐ .gitignore | ⭐⭐⭐⭐ Chrome Storage |
| **추천 대상** | 개발자, 고급 사용자 | 일반 사용자 |

---

## 🐛 문제 해결

### "API 키가 설정되지 않았습니다" 에러

**원인:** config.js의 값이 로드되지 않음

**해결:**
1. config.js 파일이 존재하는지 확인
2. API 키가 `'YOUR_XXX_HERE'`가 아닌 실제 키인지 확인
3. Extension 새로고침 (chrome://extensions/)
4. F12 → Console에서 "✅ config.js에서 API 키 자동 로드 완료" 확인

---

### config.js 파일이 없어요

**해결:**
```bash
# v-mate 폴더에서
cp config.example.js config.js
```

또는 직접 생성:
1. `config.example.js` 파일 복사
2. 이름을 `config.js`로 변경
3. 내용 수정

---

### 팝업에서 "저장됨" 표시가 안 나와요

**해결:**
1. v-mate 아이콘 클릭 (팝업 열기)
2. F12 → Console 탭
3. "✅ config.js에서 API 키 자동 로드 완료" 확인
4. 팝업 닫았다가 다시 열기
5. "저장됨" 표시 확인

---

## 💡 고급 팁

### 여러 API 키 세트 관리

개발용, 테스트용, 프로덕션용 키를 분리하려면:

```bash
# 파일 복사
cp config.js config.dev.js
cp config.js config.prod.js

# 필요에 따라 파일명 변경
mv config.dev.js config.js  # 개발용 활성화
```

### VS Code에서 API 키 숨기기

`.vscode/settings.json`:
```json
{
  "files.exclude": {
    "config.js": true
  }
}
```

---

## 🎓 예시

### 완성된 config.js 예시

```javascript
const CONFIG = {
  // OpenAI GPT API (필수)
  OPENAI_API_KEY: 'sk-proj-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz',
  
  // ElevenLabs TTS API (선택)
  ELEVENLABS_API_KEY: 'sk_1234567890abcdef1234567890abcdef12345678',
  ELEVENLABS_VOICE_ID: 'uyVNoMrnUku1dZyVEXwD',
  
  // Notion API (선택)
  NOTION_TOKEN: 'secret_abc123def456ghi789jkl012mno345pqr678',
  NOTION_DATABASE_ID: '2b3206a02abe803bae8ed89f34f01290'
};

// background.js에서 사용할 수 있도록 내보내기
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
```

---

## ✅ 체크리스트

설정이 완료되었는지 확인하세요:

- [ ] config.js 파일이 존재함
- [ ] OpenAI API 키가 실제 키로 입력됨 (sk-proj-로 시작)
- [ ] (선택) ElevenLabs API 키 입력됨 (sk_로 시작)
- [ ] (선택) Notion Token 입력됨 (secret_로 시작)
- [ ] (선택) Notion Database ID 입력됨 (32자리)
- [ ] Extension 새로고침함
- [ ] v-mate 팝업에서 "저장됨" 확인됨
- [ ] 기능 테스트 완료 (드래그 → 설명/퀴즈/노션 정리)

---

**이제 매번 API 키를 입력할 필요 없이 편하게 v-mate를 사용하세요!** 🎉

