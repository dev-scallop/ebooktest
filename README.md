전자책 뷰어 사용법

이 폴더에는 전자책 뷰어 `ebook_viewer.html`과 함께 동작하는 보조 스크립트가 있습니다.

목적
- 좌측: PDF 본문 표시
- 우측: `easy_explanation.html`(쉬운 해설) 표시
- 우측을 끝까지 스크롤하면 `practice_quiz.html`(연습문제)을 모달로 표시

빠른 시작
1. PowerShell을 열고 뷰어 폴더로 이동합니다:

    cd 'C:\Users\taejin\Desktop\시연\chapter_01'

2. 원본 PDF(예: (10가지 핵심이론으로 만나는) 지속가능경영과 ESG-part-2.pdf)를 이 폴더로 복사하고
   `ebook_viewer.html`을 상대경로로 갱신하려면 아래를 실행하세요:

    .\copy_and_set_pdf.ps1 -SourcePdf 'C:\Users\taejin\Desktop\(10가지 핵심이론으로 만나는) 지속가능경영과 ESG-part-2.pdf'

3. 브라우저에서 `ebook_viewer.html`을 엽니다.
    - 만약 PDF나 해설이 로드되지 않으면 로컬 서버로 열어보세요(권장).
      방법 1 — Python이 설치된 경우:

     python -m http.server 8000

      브라우저에서 http://localhost:8000/ebook_viewer.html 로 접속합니다.

      방법 2 — PowerShell만 있는 경우(폴더에 포함된 `serve_static.ps1` 사용):

     cd 'C:\Users\taejin\Desktop\시연\chapter_01'
     .\serve_static.ps1 -Port 8000

      브라우저에서 http://localhost:8000/ebook_viewer.html 로 접속합니다.

문제 해결
- PDF가 보이지 않거나 해설/연습문제가 로드되지 않으면 브라우저 콘솔(F12)에서 에러를 확인하세요.
- 브라우저의 보안정책으로 `file://` 접근이 제한되는 경우 로컬 서버를 사용하면 대부분 해결됩니다.

추가 가능 항목
- 모달 내에서 문제별 채점 기능 추가
- 해설/문제 HTML 스타일 통합
- 모바일 반응형 UI 개선
