# Claude Code PostToolUse hook — runs after file edits (async, non-blocking)
# Reads: $env:CLAUDE_TOOL_INPUT (JSON with file_path)

$toolInput = $env:CLAUDE_TOOL_INPUT | ConvertFrom-Json -ErrorAction SilentlyContinue
$filePath = $toolInput.file_path

if (-not $filePath) { exit 0 }
if (-not (Test-Path $filePath)) { exit 0 }

$ext = [System.IO.Path]::GetExtension($filePath).ToLower()

# Run prettier on JS/TS/JSON/CSS files if available
$formattableExts = @('.js', '.ts', '.jsx', '.tsx', '.json', '.css', '.scss', '.mdx')
if ($ext -in $formattableExts -and (Get-Command npx -ErrorAction SilentlyContinue)) {
    $result = npx prettier --write $filePath 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Prettier warning: $result"
    }
}

exit 0
