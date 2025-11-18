# 아이콘 파일 관리 가이드

## 현재 상태
- ✅ icon16.png (있음)
- ✅ icon48.png (있음)
- ❌ icon128.png (없음)

## 해결 방법

### 방법 1: 기존 파일로 대체 (현재 적용됨)
`manifest.json`이 48px 아이콘을 128px 대신 사용하도록 수정되었습니다.
Chrome이 자동으로 크기를 조정합니다.

### 방법 2: 48px 파일 복사
PowerShell이나 명령 프롬프트에서:

```powershell
# icons 폴더로 이동
cd icons

# icon48.png를 icon128.png로 복사
copy icon48.png icon128.png
```

또는 파일 탐색기에서:
1. `icons/icon48.png` 파일을 복사
2. 같은 폴더에 붙여넣기
3. 이름을 `icon128.png`로 변경

### 방법 3: 새로운 128px 아이콘 생성 (권장)

더 선명한 아이콘을 원하신다면:

1. **온라인 도구 사용**:
   - https://www.iloveimg.com/resize-image
   - icon48.png 업로드
   - 128x128로 리사이즈
   - 다운로드하여 `icons/icon128.png`로 저장

2. **AI 생성**:
   - https://favicon.io/favicon-generator/
   - 💡 이모지 선택
   - 128x128 크기 다운로드

3. **디자인 도구**:
   - Figma, Canva 등에서 128x128 아이콘 제작

## 참고사항

Chrome 확장 프로그램 아이콘 권장 사양:
- **16x16**: 브라우저 툴바 (작은 아이콘)
- **48x48**: 확장 프로그램 관리 페이지
- **128x128**: Chrome 웹 스토어 (선택사항)

개발 단계에서는 48px만 있어도 충분히 테스트 가능합니다!

