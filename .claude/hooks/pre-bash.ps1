# Claude Code PreToolUse hook — safety check before bash/powershell commands
# Reads: $env:CLAUDE_TOOL_INPUT (JSON with command)
# Exit 2 = BLOCK the tool call
# Exit 0 = allow

$toolInput = $env:CLAUDE_TOOL_INPUT | ConvertFrom-Json -ErrorAction SilentlyContinue
$command = $toolInput.command

if (-not $command) { exit 0 }

# Block dangerous patterns
$dangerous = @(
    'rm\s+-rf\s+/',
    'format\s+c:',
    'Remove-Item.*-Recurse.*-Force.*C:\\Windows',
    'DROP\s+DATABASE',
    'DROP\s+TABLE\s+(?!.*WHERE)',
    'TRUNCATE\s+TABLE',
    '>\s+/etc/passwd',
    'curl.*\|\s*(ba)?sh\s*$',
    'wget.*\|\s*(ba)?sh\s*$'
)

foreach ($pattern in $dangerous) {
    if ($command -match $pattern) {
        Write-Host "🚫 BLOCKED: Dangerous command pattern detected: $pattern"
        Write-Host "Command: $command"
        exit 2
    }
}

exit 0
