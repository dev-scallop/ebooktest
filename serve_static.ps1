<#
간단한 정적 파일 서버 (PowerShell)
사용법:
  cd 'C:\Users\taejin\Desktop\시연\chapter_01'
  .\serve_static.ps1 -Port 8000

이 스크립트는 .html/.css/.js/.pdf 등의 정적 파일을 현재 폴더에서 제공합니다.
간단한 개발/테스트 용도로만 사용하세요.
#>

param(
  [int]$Port = 8000,
  [string]$Root = $PSScriptRoot
)

Add-Type -AssemblyName System.Net.Http

$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$Port/"
$listener.Prefixes.Add($prefix)
Write-Host "Listening on $prefix (root: $Root)"
$listener.Start()
try{
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    Start-Job -ArgumentList $context,$Root -ScriptBlock {
      param($ctx,$root)
      try{
        $req = $ctx.Request
        $resp = $ctx.Response
        $urlPath = [System.Uri]::UnescapeDataString($req.Url.AbsolutePath.TrimStart('/'))
        if ([string]::IsNullOrEmpty($urlPath)) { $urlPath = 'ebook_viewer.html' }
        $localPath = Join-Path $root $urlPath
        if (-not (Test-Path $localPath)){
          $resp.StatusCode = 404
          $buf = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
          $resp.OutputStream.Write($buf,0,$buf.Length)
          $resp.Close()
          return
        }
        $ext = [System.IO.Path]::GetExtension($localPath).ToLowerInvariant()
        switch ($ext) {
          '.html'{ $ct='text/html; charset=utf-8' }
          '.htm'{ $ct='text/html; charset=utf-8' }
          '.css'{ $ct='text/css' }
          '.js'{ $ct='application/javascript' }
          '.json'{ $ct='application/json' }
          '.png'{ $ct='image/png' }
          '.jpg'{ $ct='image/jpeg' }
          '.jpeg'{ $ct='image/jpeg' }
          '.gif'{ $ct='image/gif' }
          '.svg'{ $ct='image/svg+xml' }
          '.pdf'{ $ct='application/pdf' }
          default{ $ct='application/octet-stream' }
        }
        $resp.ContentType = $ct
        $bytes = [System.IO.File]::ReadAllBytes($localPath)
        $resp.ContentLength64 = $bytes.Length
        $resp.OutputStream.Write($bytes,0,$bytes.Length)
        $resp.Close()
      } catch {
        try{ $ctx.Response.StatusCode = 500; $ctx.Response.Close() } catch {}
      }
    } | Out-Null
  }
} finally {
  $listener.Stop()
  $listener.Close()
}
