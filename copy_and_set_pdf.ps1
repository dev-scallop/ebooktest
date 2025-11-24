<#
용도: 로컬에 있는 PDF 파일을 현재 폴더(chapter_01)로 복사하고
`ebook_viewer.html` 내부의 `pdfRawPath` 변수를 해당 파일명(상대경로)으로 갱신합니다.

사용법:
  PowerShell에서 아래처럼 실행하세요:
    cd 'C:\Users\taejin\Desktop\시연\chapter_01'
    .\copy_and_set_pdf.ps1 -SourcePdf 'C:\Users\taejin\Desktop\(10가지 핵심이론으로 만나는) 지속가능경영과 ESG-part-2.pdf'

설명:
  - 기본적으로 스크립트는 같은 폴더에 복사하고 ebook_viewer.html에 파일명(예: my.pdf)으로 설정합니다.
  - ebook_viewer.html이 다른 위치에 있으면 -HtmlFile 파라미터로 경로를 지정하세요.
#>

param(
    [string]$SourcePdf = 'C:\Users\taejin\Desktop\(10가지 핵심이론으로 만나는) 지속가능경영과 ESG-part-2.pdf',
    [string]$TargetDir = $PSScriptRoot,
    [string]$HtmlFile = (Join-Path $PSScriptRoot 'ebook_viewer.html')
)

Write-Host "TargetDir: $TargetDir"
Write-Host "HtmlFile: $HtmlFile"

if (-not (Test-Path $SourcePdf)){
    Write-Host "Source PDF 파일을 찾을 수 없습니다:" -ForegroundColor Red
    Write-Host "$SourcePdf"
    exit 1
}

if (-not (Test-Path $TargetDir)){
    Write-Host "대상 폴더가 존재하지 않습니다:" -ForegroundColor Red
    Write-Host $TargetDir
    exit 1
}

try{
    $baseName = [System.IO.Path]::GetFileName($SourcePdf)
    $destPath = Join-Path $TargetDir $baseName
    Copy-Item -Path $SourcePdf -Destination $destPath -Force
    Write-Host "PDF 파일을 복사했습니다: $destPath" -ForegroundColor Green

    if (-not (Test-Path $HtmlFile)){
        Write-Host "경고: ebook_viewer.html 파일을 찾을 수 없어 경로를 변경할 수 없습니다:" -ForegroundColor Yellow
        Write-Host $HtmlFile
        exit 0
    }

    # ebook_viewer.html 내부의 pdfRawPath 줄을 찾아 파일명(또는 상대경로)으로 교체
    $content = Get-Content -Raw -Path $HtmlFile -ErrorAction Stop
    $pattern = "const\s+pdfRawPath\s*=\s*'[^']*'\s*;"
    $replacement = "const pdfRawPath = '$baseName';"

    if ($content -match $pattern) {
        $new = [regex]::Replace($content, $pattern, $replacement)
        Set-Content -Path $HtmlFile -Value $new -Encoding UTF8
        Write-Host "ebook_viewer.html의 pdfRawPath를 상대경로('$baseName')로 업데이트했습니다." -ForegroundColor Green
    } else {
        Write-Host "ebook_viewer.html에서 pdfRawPath 패턴을 찾지 못했습니다. 수동으로 수정하세요." -ForegroundColor Yellow
    }

    Write-Host "완료: 브라우저에서 ebook_viewer.html을 열면 PDF를 좌측에서 확인할 수 있습니다." -ForegroundColor Cyan
} catch {
    Write-Host "오류 발생:" $_.Exception.Message -ForegroundColor Red
    exit 1
}
