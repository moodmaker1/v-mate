# 🚀 Notion 설정 완벽 가이드

v-mate의 **자동 노션 정리** 기능을 사용하기 위한 단계별 가이드입니다.

---

## 📋 준비물 체크리스트

- [ ] Notion 계정 (무료 계정 가능)
- [ ] Chrome 브라우저
- [ ] v-mate 확장 프로그램 설치됨
- [ ] OpenAI API 키 (v-mate에 이미 설정됨)

⏱️ **소요 시간:** 약 5-10분

---

## Step 1: Notion Integration 만들기 🔑

### 1-1. Integration 생성 페이지 이동

🔗 https://www.notion.so/my-integrations

### 1-2. 새 Integration 만들기

1. **"+ New integration"** 버튼 클릭
2. 기본 정보 입력:
   - **Name:** `v-mate` (또는 원하는 이름)
   - **Logo:** (선택사항)
   - **Associated workspace:** 본인의 workspace 선택

### 1-3. 권한(Capabilities) 설정

다음 항목들을 **반드시 체크**:
- ✅ **Read content** (내용 읽기)
- ✅ **Insert content** (내용 추가)
- ✅ **Update content** (내용 수정)

### 1-4. Integration Token 복사

1. **"Submit"** 클릭
2. 생성된 **Internal Integration Token** 복사
   - 형식: `secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
3. 🔒 안전한 곳에 임시 저장 (메모장 등)

---

## Step 2: Notion 데이터베이스 만들기 📊

### 2-1. 새 페이지 생성

1. Notion 워크스페이스에서 **"+ New page"** 클릭
2. 페이지 이름: `📚 v-mate 학습 자료` (원하는 이름 가능)

### 2-2. 데이터베이스 추가

1. 페이지 내에서 `/database` 입력
2. **"Table - Inline"** 선택
3. 데이터베이스 이름: `학습 자료` (또는 공백)

### 2-3. 속성(Properties) 설정

기본 **Name** 속성 외에 다음 속성들을 추가:

| 순서 | 속성명 | 타입 | 설정 방법 |
|------|--------|------|-----------|
| 1 | **과목** | Select | "+" 클릭 → Select 선택 → 이름 "과목" 입력 |
| 2 | **날짜** | Date | "+" 클릭 → Date 선택 → 이름 "날짜" 입력 |
| 3 | **출처** | URL | "+" 클릭 → URL 선택 → 이름 "출처" 입력 |
| 4 | **페이지 제목** | Text | "+" 클릭 → Text 선택 → 이름 "페이지 제목" 입력 |

**완성된 속성 목록:**
```
Name          (Title)  ← 기본 제공
과목          (Select)
날짜          (Date)
출처          (URL)
페이지 제목   (Text)
```

---

## Step 3: Integration 연결하기 🔗

### 3-1. 데이터베이스에 Integration 연결

1. 데이터베이스 **우측 상단 `···` (More) 버튼** 클릭
2. **"Connections"** 클릭
3. **"Connect to"** 클릭
4. 목록에서 **`v-mate`** (Step 1에서 만든 Integration) 선택
5. **"Confirm"** 클릭

### 3-2. 연결 확인

✅ 연결 성공 시:
- `···` → Connections에서 `v-mate` 확인 가능
- 🔗 아이콘으로 표시됨

---

## Step 4: Database ID 복사하기 🆔

### 4-1. 데이터베이스를 전체 페이지로 열기

1. 데이터베이스 **제목 클릭** 또는
2. 데이터베이스 우측 상단 **`⤢` (Open as page)** 클릭

### 4-2. URL에서 Database ID 찾기

브라우저 주소창 URL 확인:

```
https://www.notion.so/[여기가-Database-ID]?v=xxxxx
```

**예시:**
```
https://www.notion.so/2b3206a02abe80e28d36ec0f9b64b748?v=12345
                     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                     이 부분이 Database ID!
```

### 4-3. Database ID 복사

- 32자리 영숫자 문자열
- 하이픈(-) 없이 복사: `2b3206a02abe80e28d36ec0f9b64b748`

---

## Step 5: v-mate에 설정하기 ⚙️

### 5-1. v-mate 팝업 열기

1. Chrome 툴바에서 **v-mate 아이콘** 클릭
2. 아래로 스크롤해서 **"📚 Notion 설정"** 섹션 찾기

### 5-2. 정보 입력

1. **Notion Integration Token** 입력란:
   - Step 1-4에서 복사한 Token 붙여넣기
   - 형식: `secret_xxxxxxxxxxxxx`

2. **Database ID** 입력란:
   - Step 4-3에서 복사한 ID 붙여넣기
   - 형식: 32자리 영숫자

### 5-3. 연결 테스트

1. **"연결 테스트"** 버튼 클릭
2. 결과 확인:

✅ **성공 시:**
```
✅ 연결 성공! 데이터베이스: 학습 자료
```

❌ **실패 시:**
```
❌ 연결 실패: [오류 메시지]
```
→ [문제 해결 섹션](#문제-해결) 참고

### 5-4. 설정 저장

1. **"Notion 설정 저장"** 버튼 클릭
2. 토스트 알림 확인: `Notion 설정이 저장되었습니다!`

---

## Step 6: 사용해보기! 🎉

### 6-1. 노션 모드 활성화

1. v-mate 팝업에서
2. **"📚 노션 정리"** 선택
3. 팝업 닫기

### 6-2. 페이지 새로고침

**중요!** 현재 탭을 반드시 **F5** 새로고침

### 6-3. 첫 저장 시도

1. 웹페이지에서 아무 텍스트나 **드래그** (3글자 이상)
2. **📚 초록색 아이콘** 클릭
3. 팝업 확인:
   - 과목명 (AI 자동 분류)
   - 선택한 내용
   - 메모 입력란
4. **"✅ 노션에 저장"** 클릭

### 6-4. Notion에서 확인

1. Notion 데이터베이스로 이동
2. 새로운 항목 확인! 🎊

```
📚 [과목명] - 2024-11-22
├─ 🔑 핵심 개념: [드래그한 텍스트]
├─ 💡 내 생각/질문: [메모]
└─ 🔗 출처: [페이지 링크]
```

---

## 🐛 문제 해결

### ❌ "연결 실패: Could not find database"

**원인:** Database ID가 틀리거나 Integration이 연결되지 않음

**해결:**
1. Database ID를 다시 복사 (URL에서)
2. Notion에서 `···` → Connections → `v-mate` 연결 확인
3. v-mate에서 "연결 테스트" 다시 실행

---

### ❌ "연결 실패: Unauthorized"

**원인:** Integration Token이 틀림

**해결:**
1. https://www.notion.so/my-integrations 에서 Token 재확인
2. Token 다시 복사 (`secret_`로 시작하는지 확인)
3. v-mate에 다시 입력

---

### ❌ "연결 실패: object does not have required properties"

**원인:** 데이터베이스 속성이 없거나 이름이 다름

**해결:**
1. Notion 데이터베이스에서 속성 확인:
   - `Name` (Title)
   - `과목` (Select)
   - `날짜` (Date)
   - `출처` (URL)
   - `페이지 제목` (Text)
2. 속성 이름이 정확히 일치하는지 확인 (띄어쓰기 주의)

---

### 📚 아이콘이 나타나지 않음

**해결:**
1. v-mate 팝업에서 "노션 정리" 모드 선택 확인
2. 페이지 **F5 새로고침** (필수!)
3. 3글자 이상 드래그
4. F12 → Console에서 `📚 v-mate notion mode activated` 확인

---

### 저장은 되는데 속성이 비어있음

**원인:** 속성 타입이 잘못됨

**해결:**
1. 각 속성의 타입 재확인:
   - `과목`: **Select** (Multi-select ❌)
   - `날짜`: **Date**
   - `출처`: **URL**
   - `페이지 제목`: **Text** (Rich text도 가능)

---

## 💡 팁 & 트릭

### 🎯 데이터베이스 뷰 활용

#### 과목별 뷰
1. 데이터베이스 상단 **"+ New view"** 클릭
2. 이름: `데이터베이스별`
3. **Group by:** `과목`
4. **Sort:** `날짜` (Descending)

#### 이번 주 학습 뷰
1. **"+ New view"** 클릭
2. 이름: `이번 주`
3. **Filter:** `날짜` → `is within` → `This week`
4. **Sort:** `날짜` (Descending)

---

### 🏷️ 과목 자동 완성

자주 사용하는 과목은:
- 자동으로 최근 목록에 저장됨
- 드롭다운에서 클릭 한 번으로 선택 가능
- 최대 10개까지 저장

---

### 📱 모바일에서도 보기

Notion 모바일 앱에서:
1. 같은 데이터베이스 접근 가능
2. 저장된 내용 언제든지 확인
3. 추가 편집 가능

---

## 🎓 활용 예시

### 📖 논문 읽기
```
드래그: "데이터베이스 정규화는..."
과목: AI가 "데이터베이스" 자동 분류
메모: "중간고사 출제 예상 ⭐⭐⭐"
```

### 💻 코딩 공부
```
드래그: "React useState Hook"
과목: AI가 "웹개발" 자동 분류
메모: "내 프로젝트에 적용해보기"
```

### 🇬🇧 영어 학습
```
드래그: "present perfect tense"
과목: AI가 "영어" 자동 분류
메모: "since vs for 차이 복습"
```

---

## ❓ 자주 묻는 질문

**Q: 데이터베이스는 하나만 사용해야 하나요?**
A: 아니요! Database ID를 바꿔서 여러 데이터베이스를 사용할 수 있습니다.

**Q: 과목 이름을 한글 대신 영어로 쓰고 싶어요.**
A: 팝업에서 과목명을 직접 수정하면 됩니다. 자주 쓰는 과목은 최근 목록에 저장됩니다.

**Q: 이미 저장된 내용을 수정할 수 있나요?**
A: 네! Notion에서 직접 수정 가능합니다. v-mate는 새로운 항목을 추가하는 역할만 합니다.

**Q: 무료 Notion 계정으로도 되나요?**
A: 네! Integration은 무료 계정에서도 사용 가능합니다.

**Q: 비용이 얼마나 나오나요?**
A: Notion은 무료, OpenAI API는 저장 1회당 약 $0.0001-0.0002 정도입니다.

---

## 🎉 설정 완료!

축하합니다! 이제 v-mate로 웹서핑하면서 학습한 내용을 자동으로 Notion에 정리할 수 있습니다.

### 다음 단계:
1. ✅ 실시간 설명 (💡)
2. ✅ 퀴즈 모드 (❓)
3. ✅ 노션 정리 (📚) ← 완료!

**Happy Learning! 🚀📚**

---

문의사항이나 문제가 있으면 [GitHub Issues](https://github.com/your-username/v-mate/issues)에 남겨주세요!

