# AI Engineering Workspace Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up a production-grade AI engineering workspace on Windows 11 with Claude Code, MCP servers, reusable skills, git hooks, and a terminal workflow.

**Architecture:** All tooling installs globally via winget/PowerShell; workspace lives at `C:\workspace`; Claude Code global config at `~/.claude/settings.json`; per-project `.claude/` structure at `c:\muzykant\.claude\`; PowerShell profile provides tmux-like aliases and developer QoL.

**Tech Stack:** Node.js 24, Python 3.14, PowerShell 5.1, Windows Terminal, winget, bun, uv, GitHub CLI, lazygit, MCP npm packages (`@modelcontextprotocol/*`, `@playwright/mcp`)

---

## Audit Results (pre-conditions)

- ✅ Already installed: Node.js 24, npm 11, git 2.54, Python 3.14, VS Code, winget, Windows Terminal
- ✅ npm global dir created: `C:\Users\kudry\AppData\Roaming\npm`
- ❌ Missing: bun, uv, gh, lazygit, MCP servers
- ❌ WSL not installed (tmux → Windows Terminal pane aliases instead)
- ❌ direnv not available on Windows (→ PowerShell `Enter-Project` function)
- ❌ C:\workspace does not exist
- ❌ MCP servers not configured in Claude Code

---

## File Map

### Created/Modified

| File | Purpose |
|------|---------|
| `~/.claude/settings.json` | Add `mcpServers` for GitHub, Filesystem, Playwright, PostgreSQL |
| `C:\workspace\` | Root workspace dir |
| `C:\workspace\ai-projects\` | Per-project dirs |
| `C:\workspace\shared-context\prompts\` | Reusable prompt library |
| `C:\workspace\shared-context\docs\` | Architecture docs |
| `C:\workspace\shared-context\snippets\` | Code snippets |
| `C:\workspace\shared-context\architecture\` | System diagrams |
| `C:\workspace\scripts\dev-start.ps1` | One-command dev environment start |
| `C:\workspace\scripts\workspace-check.ps1` | Health check for all tools |
| `C:\workspace\scripts\update-context.ps1` | Refresh shared-context docs |
| `C:\workspace\templates\project-template\` | Scaffold for new AI projects |
| `C:\workspace\knowledge-base\` | Notes, references, research |
| `C:\workspace\docs\current-state.md` | Current workspace state |
| `C:\workspace\docs\architecture.md` | Workspace architecture |
| `C:\workspace\docs\roadmap.md` | Future improvements |
| `c:\muzykant\.claude\settings.json` | Per-project Claude Code config |
| `c:\muzykant\.claude\agents\` | Custom agent definitions |
| `c:\muzykant\.claude\skills\` | Project-specific skills |
| `c:\muzykant\.claude\hooks\` | Lint/test/format hooks |
| `c:\muzykant\.claude\commands\` | Custom slash commands |
| `c:\muzykant\.claude\memory\` | Project memory (already exists) |
| `c:\muzykant\.claude\skills\architecture-review.md` | Architecture review skill |
| `c:\muzykant\.claude\skills\senior-code-review.md` | Senior code review skill |
| `c:\muzykant\.claude\skills\bug-hunter.md` | Bug hunting skill |
| `c:\muzykant\.claude\skills\security-review.md` | Security review skill |
| `c:\muzykant\.claude\skills\test-writer.md` | Test writer skill |
| `c:\muzykant\.claude\skills\refactor-engineer.md` | Refactoring skill |
| `c:\muzykant\docs\current-state.md` | Project current state |
| `c:\muzykant\docs\architecture.md` | Project architecture |
| `c:\muzykant\docs\roadmap.md` | Project roadmap |
| `$PROFILE` (PowerShell) | Aliases, `Enter-Project`, dev functions |
| `C:\workspace\scripts\wt-layout.ps1` | Windows Terminal layout launcher |

---

## Task 1: Fix npm + Install Core Package Managers

**Files:** System-level (no files created)

- [ ] **Step 1.1: Fix npm global dir**

  Run in PowerShell:
  ```powershell
  # Already created in audit, verify:
  Test-Path "$env:APPDATA\npm"
  npm config set prefix "$env:APPDATA\npm"
  ```
  Expected: `True`

- [ ] **Step 1.2: Install bun**

  ```powershell
  powershell -c "irm bun.sh/install.ps1 | iex"
  ```
  Then restart terminal. Verify:
  ```powershell
  bun --version
  ```
  Expected: `1.x.x`

- [ ] **Step 1.3: Install uv (Python package manager)**

  ```powershell
  powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
  ```
  Verify:
  ```powershell
  uv --version
  ```
  Expected: `uv 0.x.x`

---

## Task 2: Install CLI Tools via winget

**Files:** System-level

- [ ] **Step 2.1: Install GitHub CLI**

  ```powershell
  winget install --id GitHub.cli --accept-package-agreements --accept-source-agreements
  ```
  Verify:
  ```powershell
  gh --version
  ```
  Expected: `gh version 2.x.x`

- [ ] **Step 2.2: Install lazygit**

  ```powershell
  winget install --id JesseDuffield.lazygit --accept-package-agreements --accept-source-agreements
  ```
  Verify:
  ```powershell
  lazygit --version
  ```
  Expected: `version=0.x.x`

- [ ] **Step 2.3: Verify all tools installed**

  ```powershell
  @("node","npm","git","python","bun","uv","gh","lazygit") | ForEach-Object {
    $v = (& $_ --version 2>&1 | Select-Object -First 1)
    Write-Host "$_ : $v"
  }
  ```
  Expected: All lines show version strings, none say "not recognized"

---

## Task 3: Create Workspace Directory Structure

**Files:** `C:\workspace\` tree

- [ ] **Step 3.1: Create workspace dirs**

  ```powershell
  $dirs = @(
    "C:\workspace\ai-projects",
    "C:\workspace\shared-context\prompts",
    "C:\workspace\shared-context\docs",
    "C:\workspace\shared-context\snippets",
    "C:\workspace\shared-context\architecture",
    "C:\workspace\scripts",
    "C:\workspace\templates\project-template\.claude\agents",
    "C:\workspace\templates\project-template\.claude\skills",
    "C:\workspace\templates\project-template\.claude\hooks",
    "C:\workspace\templates\project-template\.claude\commands",
    "C:\workspace\templates\project-template\.claude\memory",
    "C:\workspace\templates\project-template\docs",
    "C:\workspace\knowledge-base",
    "C:\workspace\docs"
  )
  $dirs | ForEach-Object { New-Item -ItemType Directory -Force $_ | Out-Null }
  Write-Host "Created $($dirs.Count) directories"
  ```
  Expected: `Created 14 directories`

- [ ] **Step 3.2: Create project `.claude/` structure for c:\muzykant**

  ```powershell
  $dirs = @(
    "c:\muzykant\.claude\agents",
    "c:\muzykant\.claude\skills",
    "c:\muzykant\.claude\hooks",
    "c:\muzykant\.claude\commands",
    "c:\muzykant\docs"
  )
  $dirs | ForEach-Object { New-Item -ItemType Directory -Force $_ | Out-Null }
  Write-Host "Done"
  ```
  Expected: `Done`

- [ ] **Step 3.3: Verify structure**

  ```powershell
  Get-ChildItem C:\workspace -Recurse -Depth 3 -Directory | Select-Object FullName
  ```
  Expected: Lists all 14 subdirectories

---

## Task 4: Install MCP npm Packages Globally

**Files:** npm global packages (no project files)

- [ ] **Step 4.1: Install GitHub MCP server**

  ```powershell
  npm install -g @modelcontextprotocol/server-github
  ```
  Verify:
  ```powershell
  npm list -g @modelcontextprotocol/server-github --depth=0
  ```
  Expected: `@modelcontextprotocol/server-github@x.x.x`

- [ ] **Step 4.2: Install Filesystem MCP server**

  ```powershell
  npm install -g @modelcontextprotocol/server-filesystem
  ```
  Verify:
  ```powershell
  npm list -g @modelcontextprotocol/server-filesystem --depth=0
  ```
  Expected: `@modelcontextprotocol/server-filesystem@x.x.x`

- [ ] **Step 4.3: Install Playwright MCP server**

  ```powershell
  npm install -g @playwright/mcp
  ```
  Verify:
  ```powershell
  npm list -g @playwright/mcp --depth=0
  ```
  Expected: `@playwright/mcp@x.x.x`

- [ ] **Step 4.4: Install PostgreSQL MCP server**

  ```powershell
  npm install -g @modelcontextprotocol/server-postgres
  ```
  Verify:
  ```powershell
  npm list -g @modelcontextprotocol/server-postgres --depth=0
  ```
  Expected: `@modelcontextprotocol/server-postgres@x.x.x`

- [ ] **Step 4.5: Find npm global bin path for config**

  ```powershell
  npm prefix -g
  # Note this path — it will be used in MCP config
  # Expected on Windows: C:\Users\kudry\AppData\Roaming\npm
  ```

---

## Task 5: Configure MCP Servers in Claude Code

**Files:** `C:\Users\kudry\.claude\settings.json`

- [ ] **Step 5.1: Write updated settings.json with mcpServers**

  Replace `C:\Users\kudry\.claude\settings.json` with:
  ```json
  {
    "enabledPlugins": {
      "github@claude-plugins-official": true,
      "42crunch-api-security-testing@claude-plugins-official": true,
      "superpowers@claude-plugins-official": true,
      "figma@claude-plugins-official": true,
      "commit-commands@claude-plugins-official": true,
      "code-review@claude-plugins-official": true,
      "feature-dev@claude-plugins-official": true,
      "pr-review-toolkit@claude-plugins-official": true,
      "hookify@claude-plugins-official": true,
      "notion@claude-plugins-official": true,
      "linear@claude-plugins-official": true,
      "asana@claude-plugins-official": true
    },
    "extraKnownMarketplaces": {
      "claude-plugins-official": {
        "source": {
          "source": "git",
          "url": "https://github.com/anthropics/claude-plugins-official.git"
        }
      }
    },
    "effortLevel": "high",
    "mcpServers": {
      "filesystem": {
        "command": "npx",
        "args": [
          "-y",
          "@modelcontextprotocol/server-filesystem",
          "C:\\workspace",
          "C:\\muzykant"
        ]
      },
      "github": {
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-github"],
        "env": {
          "GITHUB_PERSONAL_ACCESS_TOKEN": "__REPLACE_WITH_YOUR_TOKEN__"
        }
      },
      "playwright": {
        "command": "npx",
        "args": ["-y", "@playwright/mcp"]
      },
      "postgres": {
        "command": "npx",
        "args": [
          "-y",
          "@modelcontextprotocol/server-postgres",
          "postgresql://localhost/mydb"
        ]
      }
    }
  }
  ```
  
  > ⚠️ **NOTE:** Replace `__REPLACE_WITH_YOUR_TOKEN__` with a real GitHub PAT before using the GitHub MCP. Generate one at https://github.com/settings/tokens (scopes: `repo`, `read:org`, `read:user`).
  > 
  > ⚠️ **NOTE:** Replace `postgresql://localhost/mydb` with your actual Postgres connection string when you have a database.

- [ ] **Step 5.2: Verify settings.json is valid JSON**

  ```powershell
  Get-Content "$env:USERPROFILE\.claude\settings.json" | ConvertFrom-Json | ConvertTo-Json -Depth 10 | Write-Host
  ```
  Expected: No errors, JSON prints cleanly

---

## Task 6: Create Project `.claude/settings.json`

**Files:** `c:\muzykant\.claude\settings.json`

- [ ] **Step 6.1: Write project-level Claude settings**

  Create `c:\muzykant\.claude\settings.json`:
  ```json
  {
    "projectName": "muzykant",
    "hooks": {
      "PostToolUse": [
        {
          "matcher": "Edit|Write|MultiEdit",
          "hooks": [
            {
              "type": "command",
              "command": "powershell -File c:\\muzykant\\.claude\\hooks\\post-edit.ps1"
            }
          ]
        }
      ],
      "PreToolUse": [
        {
          "matcher": "Bash",
          "hooks": [
            {
              "type": "command",
              "command": "powershell -File c:\\muzykant\\.claude\\hooks\\pre-bash.ps1"
            }
          ]
        }
      ]
    }
  }
  ```

- [ ] **Step 6.2: Verify file exists**

  ```powershell
  Test-Path "c:\muzykant\.claude\settings.json"
  ```
  Expected: `True`

---

## Task 7: Create Skills

**Files:** 6 skill files in `c:\muzykant\.claude\skills\`

- [ ] **Step 7.1: Create architecture-review.md**

  Create `c:\muzykant\.claude\skills\architecture-review.md`:
  ```markdown
  ---
  name: architecture-review
  description: Review system architecture for scalability, maintainability, and correctness
  ---

  # Architecture Review

  ## Role
  You are a senior software architect with 15+ years experience in distributed systems, cloud-native applications, and modern web architecture.

  ## Responsibilities
  - Evaluate current architecture against business requirements
  - Identify scalability bottlenecks and single points of failure
  - Review separation of concerns and dependency direction
  - Assess data flow, API design, and service boundaries
  - Check for over-engineering (YAGNI) and under-engineering

  ## Workflow
  1. **Map the system** — draw the current architecture from code/docs
  2. **Identify components** — list services, databases, external dependencies
  3. **Trace data flows** — follow key user journeys through the system
  4. **Apply heuristics** — SOLID, DRY, 12-factor, CAP theorem where relevant
  5. **Score each concern** — rate 1-5: scalability, maintainability, security, performance
  6. **Prioritize issues** — Critical / High / Medium / Low
  7. **Propose alternatives** — for each issue, show a concrete better approach

  ## Output Format
  ```
  ## Architecture Review: [Component/System]

  ### Current State Diagram
  [ASCII or mermaid diagram]

  ### Findings

  #### 🔴 Critical
  - [Issue]: [Why it's critical] → [Fix]

  #### 🟠 High
  - [Issue]: [Impact] → [Fix]

  #### 🟡 Medium
  - [Issue]: [Impact] → [Fix]

  ### Scores
  | Concern | Score | Notes |
  |---------|-------|-------|
  | Scalability | x/5 | ... |
  | Maintainability | x/5 | ... |
  | Security | x/5 | ... |
  | Performance | x/5 | ... |

  ### Recommended Next Steps
  1. [Most impactful change first]
  ```
  ```

- [ ] **Step 7.2: Create senior-code-review.md**

  Create `c:\muzykant\.claude\skills\senior-code-review.md`:
  ```markdown
  ---
  name: senior-code-review
  description: Senior engineer code review for correctness, quality, and style
  ---

  # Senior Code Review

  ## Role
  You are a senior engineer (10+ years) doing a code review. You are direct, constructive, and specific. You care about correctness first, then readability, then performance.

  ## Responsibilities
  - Find logic errors, edge cases, off-by-one errors
  - Spot resource leaks, race conditions, error handling gaps
  - Check naming clarity and code organization
  - Verify tests cover critical paths and failure modes
  - Ensure no secrets or sensitive data in code
  - Confirm changes are backward compatible where required

  ## Workflow
  1. **Read the diff** — understand what changed and why
  2. **Check correctness** — does the logic do what it claims?
  3. **Check error paths** — what happens when things fail?
  4. **Check tests** — are new behaviors tested? Are tests meaningful?
  5. **Check style** — does it match the project conventions?
  6. **Write feedback** — one comment per issue, prioritized

  ## Output Format
  ```
  ## Code Review: [File/PR]

  ### 🔴 Must Fix (blocks merge)
  **[file:line]** — [Issue description]
  ```[language]
  // Current code (problematic)
  ...
  // Suggested fix
  ...
  ```

  ### 🟠 Should Fix (important but not blocking)
  **[file:line]** — [Issue]

  ### 🟡 Consider (style/improvement)
  **[file:line]** — [Suggestion]

  ### ✅ Good
  - [What was done well]

  ### Summary
  [1-3 sentences on overall quality and merge recommendation]
  ```
  ```

- [ ] **Step 7.3: Create bug-hunter.md**

  Create `c:\muzykant\.claude\skills\bug-hunter.md`:
  ```markdown
  ---
  name: bug-hunter
  description: Systematic bug investigation and root cause analysis
  ---

  # Bug Hunter

  ## Role
  You are a systematic debugger. You never guess. You form hypotheses, find evidence, and only propose fixes when root cause is confirmed.

  ## Responsibilities
  - Reproduce the bug in the simplest possible case
  - Trace execution to find exact point of failure
  - Distinguish symptoms from root cause
  - Propose minimal fix (no unrelated refactoring)
  - Add a regression test before fixing

  ## Workflow
  1. **Reproduce** — confirm you can trigger the bug
  2. **Isolate** — reduce to smallest failing case
  3. **Hypothesize** — list 3 possible causes ranked by likelihood
  4. **Test each hypothesis** — add logging/assertions to confirm or deny
  5. **Find root cause** — confirm which hypothesis explains all symptoms
  6. **Fix minimally** — change only what's needed
  7. **Add regression test** — test that would have caught this bug
  8. **Verify** — run all tests, confirm bug is gone

  ## Output Format
  ```
  ## Bug Investigation: [Bug description]

  ### Reproduction
  Steps to reproduce: ...
  Minimal case: ...

  ### Hypotheses
  1. [Most likely cause] — Evidence for/against: ...
  2. [Second cause] — Evidence for/against: ...
  3. [Third cause] — Evidence for/against: ...

  ### Root Cause
  **Confirmed:** [Exact cause with file:line reference]
  **Why it happens:** [Explanation]

  ### Fix
  ```[language]
  // Before
  ...
  // After
  ...
  ```

  ### Regression Test
  ```[language]
  test('describes the bug scenario', () => {
    // setup
    // act
    // assert
  })
  ```
  ```
  ```

- [ ] **Step 7.4: Create security-review.md**

  Create `c:\muzykant\.claude\skills\security-review.md`:
  ```markdown
  ---
  name: security-review
  description: Security-focused code review for vulnerabilities and misconfigurations
  ---

  # Security Review

  ## Role
  You are an application security engineer. You think like an attacker. You find vulnerabilities before they reach production.

  ## Responsibilities
  - Check for OWASP Top 10 vulnerabilities
  - Find secrets/credentials in code or config
  - Review authentication and authorization logic
  - Check input validation and output encoding
  - Assess dependency security (known CVEs)
  - Review error messages for information leakage

  ## OWASP Checklist
  - [ ] A01 Broken Access Control — check all endpoints for authz
  - [ ] A02 Cryptographic Failures — check TLS, hashing, encryption
  - [ ] A03 Injection — SQL, NoSQL, command, LDAP injection
  - [ ] A04 Insecure Design — threat model coverage
  - [ ] A05 Security Misconfiguration — defaults, debug modes, open ports
  - [ ] A06 Vulnerable Components — check dependency versions
  - [ ] A07 Auth Failures — session management, brute force protection
  - [ ] A08 Data Integrity Failures — deserialization, CI/CD integrity
  - [ ] A09 Logging Failures — insufficient logging, sensitive data in logs
  - [ ] A10 SSRF — server-side request forgery

  ## Workflow
  1. **Scan for secrets** — grep for hardcoded tokens, passwords, keys
  2. **Review auth** — every route/endpoint has correct authz check
  3. **Review input** — all user input is validated and sanitized
  4. **Review output** — no sensitive data leaked in responses/errors
  5. **Check deps** — look for known vulnerabilities in package.json/requirements.txt
  6. **Rate findings** — CVSS-style: Critical/High/Medium/Low/Info

  ## Output Format
  ```
  ## Security Review: [Scope]

  ### 🔴 Critical (immediate fix required)
  **[OWASP category]** [file:line] — [Vulnerability]
  Impact: [What attacker can do]
  Fix: [Specific remediation]

  ### 🟠 High
  ...

  ### 🟡 Medium / Low
  ...

  ### Dependencies
  | Package | Version | CVE | Severity |
  |---------|---------|-----|---------|

  ### Summary
  Risk Level: [Critical/High/Medium/Low]
  Recommended: [Ship / Fix before ship / Do not ship]
  ```
  ```

- [ ] **Step 7.5: Create test-writer.md**

  Create `c:\muzykant\.claude\skills\test-writer.md`:
  ```markdown
  ---
  name: test-writer
  description: Write comprehensive tests — unit, integration, edge cases
  ---

  # Test Writer

  ## Role
  You are a testing engineer who writes tests that actually catch bugs. You think in failure modes, edge cases, and user journeys.

  ## Responsibilities
  - Write tests BEFORE implementation (TDD when possible)
  - Cover happy path, error paths, and edge cases
  - Use descriptive test names that document behavior
  - Keep tests independent — no shared mutable state
  - Make tests fast and deterministic

  ## Test Design Principles
  - **AAA pattern:** Arrange → Act → Assert
  - **One assertion per test** (or one logical concept)
  - **Test behavior, not implementation**
  - **Test names as documentation:** `it('returns 401 when token is expired')`
  - **Edge cases:** null, empty, boundary values, max values, unicode, concurrent access

  ## Coverage Targets
  - Business logic: 100%
  - Error paths: 100%
  - Integration points: key scenarios
  - UI: user-visible behavior

  ## Workflow
  1. **Understand the feature** — what should it do? what should it NOT do?
  2. **List test cases** — happy path + all failure modes + edge cases
  3. **Write tests first** — watch them fail
  4. **Implement** — make tests pass with minimal code
  5. **Refactor** — clean up while keeping tests green

  ## Output Format
  ```
  ## Tests for: [Feature/Function]

  ### Test Cases
  - [ ] Happy path: [description]
  - [ ] Error: [description]
  - [ ] Edge case: [description]

  ### Test Code
  ```[language]
  describe('[Feature]', () => {
    describe('[scenario]', () => {
      it('[expected behavior]', async () => {
        // Arrange
        const input = ...
        // Act
        const result = await fn(input)
        // Assert
        expect(result).toEqual(expected)
      })
    })
  })
  ```
  ```
  ```

- [ ] **Step 7.6: Create refactor-engineer.md**

  Create `c:\muzykant\.claude\skills\refactor-engineer.md`:
  ```markdown
  ---
  name: refactor-engineer
  description: Safe, incremental refactoring with test coverage
  ---

  # Refactor Engineer

  ## Role
  You are a refactoring specialist. You improve code structure without changing behavior. You always have tests before you refactor.

  ## Responsibilities
  - Identify and eliminate code smells
  - Apply appropriate design patterns (not over-engineer)
  - Improve naming and clarity
  - Reduce complexity (cyclomatic, cognitive)
  - Eliminate duplication (DRY)
  - Keep changes small and reversible

  ## Code Smells to Hunt
  - Long methods (>20 lines)
  - Large classes (>200 lines, >10 methods)
  - Deep nesting (>3 levels)
  - Magic numbers/strings
  - Duplicated logic
  - God objects (know/do too much)
  - Shotgun surgery (one change → many files)
  - Feature envy (method uses another class more than its own)
  - Data clumps (same 3+ values always together → make a type)

  ## Workflow
  1. **Ensure tests exist** — never refactor without a safety net
  2. **Run tests** — confirm they pass before starting
  3. **Identify one smell** — pick the most impactful
  4. **Plan the refactor** — what pattern/technique applies?
  5. **Apply in small steps** — each step keeps tests green
  6. **Run tests after each step** — immediate feedback
  7. **Commit each coherent change** — easy to revert

  ## Refactoring Techniques
  - Extract Method / Extract Variable
  - Rename (method, variable, class)
  - Move Method / Move Field
  - Replace Magic Number with Constant
  - Replace Conditional with Polymorphism
  - Introduce Parameter Object
  - Decompose Conditional
  - Replace Temp with Query

  ## Output Format
  ```
  ## Refactoring Plan: [Target]

  ### Detected Smells
  | Smell | Location | Severity |
  |-------|----------|---------|

  ### Refactoring Steps
  1. [Step] — Technique: [technique] — Risk: Low/Medium/High
     Before: `...`
     After: `...`

  ### Tests Required Before Start
  - [ ] [Test that covers the behavior being refactored]
  ```
  ```

---

## Task 8: Create Git Hooks

**Files:** `c:\muzykant\.claude\hooks\` and `c:\muzykant\.git\hooks\`

- [ ] **Step 8.1: Create Claude Code post-edit hook**

  Create `c:\muzykant\.claude\hooks\post-edit.ps1`:
  ```powershell
  # Claude Code PostToolUse hook — runs after file edits
  # Reads: $env:CLAUDE_TOOL_INPUT (JSON with file_path)
  
  $toolInput = $env:CLAUDE_TOOL_INPUT | ConvertFrom-Json -ErrorAction SilentlyContinue
  $filePath = $toolInput.file_path
  
  if (-not $filePath) { exit 0 }
  
  $ext = [System.IO.Path]::GetExtension($filePath)
  
  # Run prettier on JS/TS/JSON files if available
  if ($ext -in @('.js', '.ts', '.jsx', '.tsx', '.json', '.css') -and (Get-Command npx -ErrorAction SilentlyContinue)) {
    Write-Host "🔧 Formatting $filePath..."
    $result = npx prettier --write $filePath 2>&1
    if ($LASTEXITCODE -ne 0) { Write-Host "⚠️  Prettier failed: $result" }
  }
  
  exit 0
  ```

- [ ] **Step 8.2: Create Claude Code pre-bash hook**

  Create `c:\muzykant\.claude\hooks\pre-bash.ps1`:
  ```powershell
  # Claude Code PreToolUse hook — safety check before bash commands
  # Reads: $env:CLAUDE_TOOL_INPUT (JSON with command)
  
  $toolInput = $env:CLAUDE_TOOL_INPUT | ConvertFrom-Json -ErrorAction SilentlyContinue
  $command = $toolInput.command
  
  if (-not $command) { exit 0 }
  
  # Block dangerous patterns
  $dangerous = @(
    'rm -rf /',
    'format c:',
    '> /etc/passwd',
    'DROP TABLE',
    '--force.*--all'
  )
  
  foreach ($pattern in $dangerous) {
    if ($command -match $pattern) {
      Write-Host "🚫 BLOCKED: Dangerous command pattern detected: $pattern"
      exit 2  # exit 2 = block the tool call
    }
  }
  
  exit 0
  ```

- [ ] **Step 8.3: Create git pre-commit hook**

  Create `c:\muzykant\.git\hooks\pre-commit` (no extension):
  ```bash
  #!/bin/sh
  # Pre-commit hook: secret scan, typecheck
  
  echo "🔍 Pre-commit checks..."
  
  # 1. Secret scan — look for common secret patterns
  SECRETS=$(git diff --cached --diff-filter=d | grep -iE \
    "(api_key|secret_key|password|token|private_key|access_key)\s*=\s*['\"][^'\"]{8,}" \
    | grep -v "placeholder\|example\|your_\|__REPLACE\|test_\|fake_" \
    | head -5)
  
  if [ -n "$SECRETS" ]; then
    echo "🚫 BLOCKED: Possible secrets detected in staged changes:"
    echo "$SECRETS"
    echo "Remove secrets before committing. Use environment variables instead."
    exit 1
  fi
  
  echo "✅ No secrets detected"
  
  # 2. TypeScript typecheck (if tsconfig exists)
  if [ -f "tsconfig.json" ] && command -v npx >/dev/null 2>&1; then
    echo "🔷 Running TypeScript check..."
    npx tsc --noEmit --skipLibCheck 2>&1
    if [ $? -ne 0 ]; then
      echo "🚫 TypeScript errors found. Fix before committing."
      exit 1
    fi
    echo "✅ TypeScript OK"
  fi
  
  echo "✅ Pre-commit checks passed"
  exit 0
  ```

- [ ] **Step 8.4: Make git hook executable**

  On Windows, git hooks don't need chmod. Verify hook exists:
  ```powershell
  Test-Path "c:\muzykant\.git\hooks\pre-commit"
  ```
  Expected: `True`

- [ ] **Step 8.5: Test pre-commit hook (dry run)**

  ```powershell
  # Test the hook manually
  cd c:\muzykant
  sh .git/hooks/pre-commit
  ```
  Expected: `✅ Pre-commit checks passed`

---

## Task 9: PowerShell Terminal Workflow

**Files:** `$PROFILE` (PowerShell profile), `C:\workspace\scripts\wt-layout.ps1`

- [ ] **Step 9.1: Check if PowerShell profile exists**

  ```powershell
  $PROFILE
  Test-Path $PROFILE
  ```
  Note the path. If it doesn't exist, create it.

- [ ] **Step 9.2: Add developer aliases and functions to PowerShell profile**

  Append to `$PROFILE`:
  ```powershell
  # ─── AI Workspace Developer Profile ───────────────────────────────────────
  
  # Navigation
  function ws { Set-Location C:\workspace }
  function muz { Set-Location c:\muzykant }
  function ai { Set-Location C:\workspace\ai-projects }
  
  # Git shortcuts
  function gs { git status }
  function gd { git diff }
  function gl { git log --oneline --graph --decorate -20 }
  function gp { git push }
  function gpl { git pull }
  function ga { param($f=".") git add $f }
  function gcm { param($m) git commit -m $m }
  function lg { lazygit }
  
  # Dev shortcuts
  function nr { param($s) npm run $s }
  function dev { npm run dev }
  function build { npm run build }
  function test { npm test }
  
  # Enter-Project: load .env when entering a project dir (direnv equivalent)
  function Enter-Project {
    param([string]$Path = ".")
    Set-Location $Path
    $envFile = Join-Path (Get-Location) ".env.local"
    if (-not (Test-Path $envFile)) { $envFile = Join-Path (Get-Location) ".env" }
    if (Test-Path $envFile) {
      Write-Host "📦 Loading $envFile" -ForegroundColor Yellow
      Get-Content $envFile | Where-Object { $_ -match '^\s*[^#]' -and $_ -match '=' } | ForEach-Object {
        $parts = $_ -split '=', 2
        $key = $parts[0].Trim()
        $value = $parts[1].Trim().Trim('"').Trim("'")
        [System.Environment]::SetEnvironmentVariable($key, $value, "Process")
        Write-Host "  $key = $($value.Substring(0, [Math]::Min(8, $value.Length)))..." -ForegroundColor DarkGray
      }
    }
  }
  Set-Alias ep Enter-Project
  
  # Claude Code shortcuts
  function cc { claude $args }
  function ccc { claude --continue $args }
  
  # Workspace status
  function workspace-status {
    Write-Host "`n📊 Workspace Status" -ForegroundColor Cyan
    Write-Host "===================" -ForegroundColor Cyan
    @("node","npm","git","python","bun","uv","gh","lazygit") | ForEach-Object {
      $v = (& $_ --version 2>&1 | Select-Object -First 1)
      if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ $_ : $v" -ForegroundColor Green
      } else {
        Write-Host "  ❌ $_ : not found" -ForegroundColor Red
      }
    }
  }
  Set-Alias wst workspace-status
  
  Write-Host "🚀 AI Workspace profile loaded. Type 'wst' for status." -ForegroundColor DarkGray
  # ──────────────────────────────────────────────────────────────────────────
  ```

- [ ] **Step 9.3: Create Windows Terminal layout launcher**

  Create `C:\workspace\scripts\wt-layout.ps1`:
  ```powershell
  # Windows Terminal dev layout launcher
  # Opens 3-pane layout: editor | terminal | git
  # Usage: .\wt-layout.ps1 [project-path]
  
  param(
    [string]$ProjectPath = "c:\muzykant"
  )
  
  wt `
    --window 0 new-tab --title "Dev" --startingDirectory $ProjectPath `; `
    split-pane --vertical --size 0.4 --title "Git" --startingDirectory $ProjectPath powershell.exe -NoExit -Command "lazygit" `; `
    split-pane --horizontal --size 0.5 --title "Server" --startingDirectory $ProjectPath powershell.exe -NoExit -Command "Write-Host 'Run: npm run dev' -ForegroundColor Cyan"
  ```

- [ ] **Step 9.4: Reload PowerShell profile (in current session)**

  ```powershell
  . $PROFILE
  ```
  Expected: `🚀 AI Workspace profile loaded. Type 'wst' for status.`

---

## Task 10: Create Utility Scripts

**Files:** `C:\workspace\scripts\*.ps1`

- [ ] **Step 10.1: Create dev-start.ps1**

  Create `C:\workspace\scripts\dev-start.ps1`:
  ```powershell
  # dev-start.ps1 — Start development environment
  # Usage: .\dev-start.ps1 [project-path]
  
  param(
    [string]$ProjectPath = "c:\muzykant",
    [switch]$NoTerminal
  )
  
  Write-Host "🚀 Starting dev environment for $ProjectPath" -ForegroundColor Cyan
  
  # Load .env
  $envFile = Join-Path $ProjectPath ".env.local"
  if (-not (Test-Path $envFile)) { $envFile = Join-Path $ProjectPath ".env" }
  if (Test-Path $envFile) {
    Write-Host "📦 Loading environment from $envFile"
    Get-Content $envFile | Where-Object { $_ -match '^\s*[^#]' -and $_ -match '=' } | ForEach-Object {
      $parts = $_ -split '=', 2
      [System.Environment]::SetEnvironmentVariable($parts[0].Trim(), $parts[1].Trim().Trim('"'), "Process")
    }
  } else {
    Write-Host "⚠️  No .env file found at $envFile"
  }
  
  # Check git status
  Set-Location $ProjectPath
  $branch = git branch --show-current 2>&1
  $status = git status --short 2>&1
  Write-Host "🌿 Branch: $branch"
  if ($status) { Write-Host "📝 Uncommitted changes:`n$status" -ForegroundColor Yellow }
  
  # Launch Windows Terminal layout
  if (-not $NoTerminal) {
    & "C:\workspace\scripts\wt-layout.ps1" -ProjectPath $ProjectPath
  }
  
  Write-Host "✅ Dev environment ready" -ForegroundColor Green
  ```

- [ ] **Step 10.2: Create workspace-check.ps1**

  Create `C:\workspace\scripts\workspace-check.ps1`:
  ```powershell
  # workspace-check.ps1 — Health check for all workspace tools and MCP
  
  $ok = 0; $fail = 0
  
  function Check-Tool {
    param([string]$Name, [string]$VersionCmd = "--version")
    try {
      $v = (& $Name $VersionCmd 2>&1 | Select-Object -First 1)
      if ($LASTEXITCODE -eq 0 -or $v) {
        Write-Host "  ✅ $Name : $v" -ForegroundColor Green
        $script:ok++
      } else { throw }
    } catch {
      Write-Host "  ❌ $Name : NOT FOUND" -ForegroundColor Red
      $script:fail++
    }
  }
  
  Write-Host "`n🔍 Workspace Health Check" -ForegroundColor Cyan
  Write-Host "=========================" -ForegroundColor Cyan
  
  Write-Host "`n📦 Core Tools:" -ForegroundColor Yellow
  Check-Tool "node"
  Check-Tool "npm"
  Check-Tool "git"
  Check-Tool "python"
  
  Write-Host "`n⚡ Additional Tools:" -ForegroundColor Yellow
  Check-Tool "bun"
  Check-Tool "uv"
  Check-Tool "gh"
  Check-Tool "lazygit"
  
  Write-Host "`n📁 Workspace Directories:" -ForegroundColor Yellow
  @("C:\workspace", "C:\workspace\ai-projects", "C:\workspace\shared-context", "C:\workspace\scripts") | ForEach-Object {
    if (Test-Path $_) {
      Write-Host "  ✅ $_" -ForegroundColor Green; $script:ok++
    } else {
      Write-Host "  ❌ $_ MISSING" -ForegroundColor Red; $script:fail++
    }
  }
  
  Write-Host "`n🤖 Claude Code Config:" -ForegroundColor Yellow
  $settings = "$env:USERPROFILE\.claude\settings.json"
  if (Test-Path $settings) {
    $cfg = Get-Content $settings | ConvertFrom-Json
    if ($cfg.mcpServers) {
      $cfg.mcpServers.PSObject.Properties.Name | ForEach-Object {
        Write-Host "  ✅ MCP: $_" -ForegroundColor Green; $script:ok++
      }
    } else {
      Write-Host "  ⚠️  No MCP servers configured" -ForegroundColor Yellow
    }
  }
  
  Write-Host "`n📊 Result: $ok ✅  $fail ❌" -ForegroundColor Cyan
  if ($fail -eq 0) { Write-Host "🎉 All checks passed!" -ForegroundColor Green }
  else { Write-Host "⚠️  $fail items need attention" -ForegroundColor Yellow }
  ```

- [ ] **Step 10.3: Create update-context.ps1**

  Create `C:\workspace\scripts\update-context.ps1`:
  ```powershell
  # update-context.ps1 — Refresh shared-context docs with current state
  # Scans all ai-projects and writes a summary to shared-context/docs/
  
  $date = Get-Date -Format "yyyy-MM-dd HH:mm"
  $outputFile = "C:\workspace\shared-context\docs\projects-state.md"
  
  $lines = @("# Projects State", "", "Updated: $date", "", "## Projects", "")
  
  Get-ChildItem "C:\workspace\ai-projects" -Directory | ForEach-Object {
    $proj = $_.Name
    $path = $_.FullName
    $lines += "### $proj"
    $lines += "Path: $path"
    
    # Git info
    if (Test-Path "$path\.git") {
      $branch = (git -C $path branch --show-current 2>&1)
      $lastCommit = (git -C $path log --oneline -1 2>&1)
      $lines += "Branch: $branch"
      $lines += "Last commit: $lastCommit"
    }
    
    # Package info
    if (Test-Path "$path\package.json") {
      $pkg = Get-Content "$path\package.json" | ConvertFrom-Json
      $lines += "Package: $($pkg.name) v$($pkg.version)"
    }
    
    $lines += ""
  }
  
  $lines | Out-File -FilePath $outputFile -Encoding utf8
  Write-Host "✅ Updated $outputFile"
  ```

---

## Task 11: Create Documentation

**Files:** 6 markdown docs

- [ ] **Step 11.1: Create C:\workspace\docs\current-state.md**

  Create `C:\workspace\docs\current-state.md`:
  ```markdown
  # Workspace Current State

  Last updated: 2026-05-20

  ## System
  - OS: Windows 11 Pro (26200)
  - CPU: Intel Celeron N5095A @ 2.00GHz
  - RAM: 15.8 GB

  ## Tools Installed
  | Tool | Version | Purpose |
  |------|---------|---------|
  | Node.js | 24.15.0 | JavaScript runtime |
  | npm | 11.12.1 | Node package manager |
  | bun | TBD | Fast JS runtime/package manager |
  | git | 2.54.0 | Version control |
  | Python | 3.14.4 | Python runtime |
  | uv | TBD | Fast Python package manager |
  | GitHub CLI | TBD | GitHub operations |
  | lazygit | TBD | Terminal git UI |

  ## Claude Code
  - Plugins: superpowers, hookify, feature-dev, code-review, commit-commands, pr-review-toolkit, figma, notion, linear, asana, github, 42crunch
  - MCP Servers: filesystem, github, playwright, postgres

  ## Active Projects
  - `c:\muzykant` — Next.js music app

  ## Workspace Structure
  ```
  C:\workspace\
  ├── ai-projects\     # AI-assisted projects
  ├── shared-context\  # Shared prompts, docs, snippets
  ├── scripts\         # Automation scripts
  ├── templates\       # Project scaffolds
  ├── knowledge-base\  # Notes and references
  └── docs\            # This documentation
  ```
  ```

- [ ] **Step 11.2: Create C:\workspace\docs\architecture.md**

  Create `C:\workspace\docs\architecture.md`:
  ```markdown
  # Workspace Architecture

  ## Overview

  This workspace is designed for AI-assisted software development on Windows 11.
  Claude Code (VSCode extension) is the primary AI interface, backed by MCP servers for extended capabilities.

  ## Component Map

  ```
  Developer
    │
    ├── Claude Code (VSCode Extension)
    │     ├── Plugins (superpowers, hookify, feature-dev, ...)
    │     ├── MCP Servers
    │     │     ├── filesystem  → read/write C:\workspace, c:\muzykant
    │     │     ├── github      → GitHub API operations
    │     │     ├── playwright  → browser automation
    │     │     └── postgres    → database queries
    │     └── Skills (.claude/skills/)
    │
    ├── Terminal (Windows Terminal + PowerShell 5.1)
    │     ├── Aliases (gs, gd, gl, dev, build, ...)
    │     ├── Enter-Project (direnv equivalent)
    │     └── wt-layout.ps1 (tmux equivalent)
    │
    └── Projects
          ├── c:\muzykant\    (Next.js app, active)
          └── C:\workspace\ai-projects\  (future projects)
  ```

  ## Design Decisions

  ### Why Windows Terminal instead of tmux
  tmux is Linux/macOS only. Windows Terminal provides equivalent multi-pane layouts
  via the `wt` command with split-pane arguments. The `wt-layout.ps1` script provides
  a one-command dev layout.

  ### Why PowerShell Enter-Project instead of direnv
  direnv is not available on Windows. `Enter-Project` function in the PS profile
  replicates the core behavior: load `.env` / `.env.local` when entering a project dir.

  ### MCP Server Security
  - Filesystem MCP: scoped to `C:\workspace` and `c:\muzykant` only
  - GitHub MCP: requires explicit PAT with minimal scopes
  - Playwright MCP: browser-only, no filesystem access
  - PostgreSQL MCP: connection string scoped to specific database

  ## Upgrade Path
  - Install WSL2 → get native tmux, direnv, full Linux toolchain
  - Add more MCP servers as needed (Slack, Jira, etc.)
  - Expand filesystem MCP paths as new projects are added
  ```

- [ ] **Step 11.3: Create C:\workspace\docs\roadmap.md**

  Create `C:\workspace\docs\roadmap.md`:
  ```markdown
  # Workspace Roadmap

  ## Phase 1 — Foundation (Done)
  - [x] System audit
  - [x] npm global dir fix
  - [x] bun installation
  - [x] uv installation
  - [x] GitHub CLI installation
  - [x] lazygit installation
  - [x] Workspace directory structure
  - [x] MCP servers configured
  - [x] Skills created
  - [x] Git hooks created
  - [x] PowerShell profile with aliases
  - [x] Utility scripts

  ## Phase 2 — WSL & Linux Toolchain (Optional)
  - [ ] Install WSL2 (`wsl --install`)
  - [ ] Install Ubuntu 22.04
  - [ ] Install tmux inside WSL
  - [ ] Install direnv inside WSL
  - [ ] Configure Windows Terminal WSL profile

  ## Phase 3 — Database Setup
  - [ ] Install PostgreSQL locally
  - [ ] Configure PostgreSQL MCP with real connection string
  - [ ] Create development database

  ## Phase 4 — GitHub Integration
  - [ ] Create GitHub PAT with appropriate scopes
  - [ ] Configure GitHub MCP with token
  - [ ] Set up `gh auth login`
  - [ ] Configure git signing (optional)

  ## Phase 5 — Monitoring & Automation
  - [ ] Set up log aggregation for Claude Code hooks
  - [ ] Create scheduled workspace-check (weekly)
  - [ ] Add Slack/Discord notification on hook failures
  - [ ] Create project status dashboard

  ## Phase 6 — Team Collaboration
  - [ ] Share workspace structure as template
  - [ ] Document team onboarding process
  - [ ] Set up shared MCP server (if needed)
  ```

- [ ] **Step 11.4: Create project-level docs for c:\muzykant**

  Create `c:\muzykant\docs\current-state.md`:
  ```markdown
  # muzykant — Current State

  Updated: 2026-05-20

  ## What is this
  Next.js music application.

  ## Tech Stack
  - Next.js (see node_modules/next/dist/docs/ for this version's specifics)
  - Node.js 24
  - TypeScript (assumed)

  ## Status
  - Active development

  ## Key Files
  - Read `node_modules/next/dist/docs/` before writing Next.js code
  - This version may have breaking changes from standard Next.js documentation

  ## Claude Code Config
  - `.claude/settings.json` — hooks for lint/format/typecheck
  - `.claude/skills/` — architecture-review, senior-code-review, bug-hunter, security-review, test-writer, refactor-engineer
  - `.claude/hooks/` — post-edit (prettier), pre-bash (safety)
  ```

  Create `c:\muzykant\docs\architecture.md`:
  ```markdown
  # muzykant — Architecture

  ## Overview
  TBD — document architecture as it develops.

  ## Stack
  - Framework: Next.js (version pinned in package.json)
  - Runtime: Node.js 24
  - Language: TypeScript

  ## Important Notes
  - This Next.js version may have breaking API changes
  - Always read `node_modules/next/dist/docs/` before implementing Next.js features
  - Check deprecation notices carefully
  ```

  Create `c:\muzykant\docs\roadmap.md`:
  ```markdown
  # muzykant — Roadmap

  ## Current Sprint
  - TBD

  ## Backlog
  - TBD

  ## Done
  - Initial Claude Code workspace setup (2026-05-20)
  ```

- [ ] **Step 11.5: Create project template**

  Create `C:\workspace\templates\project-template\docs\architecture.md`:
  ```markdown
  # [Project Name] — Architecture

  Updated: [DATE]

  ## Overview
  [2-3 sentence description]

  ## Tech Stack
  | Layer | Technology | Version |
  |-------|-----------|---------|
  | Framework | ... | ... |
  | Database | ... | ... |
  | Auth | ... | ... |

  ## Component Diagram
  ```
  [ASCII diagram here]
  ```

  ## Key Design Decisions
  1. [Decision] — [Why]
  2. [Decision] — [Why]
  ```

  Create `C:\workspace\templates\project-template\.claude\settings.json`:
  ```json
  {
    "projectName": "__PROJECT_NAME__",
    "hooks": {
      "PostToolUse": [
        {
          "matcher": "Edit|Write|MultiEdit",
          "hooks": [
            {
              "type": "command",
              "command": "powershell -File .claude/hooks/post-edit.ps1"
            }
          ]
        }
      ]
    }
  }
  ```

---

## Task 12: Final Verification

- [ ] **Step 12.1: Run workspace-check.ps1**

  ```powershell
  C:\workspace\scripts\workspace-check.ps1
  ```
  Expected: All items green except for items pending GitHub PAT and Postgres setup.

- [ ] **Step 12.2: Verify skills are readable by Claude Code**

  ```powershell
  Get-ChildItem c:\muzykant\.claude\skills\ | Select-Object Name
  ```
  Expected:
  ```
  architecture-review.md
  senior-code-review.md
  bug-hunter.md
  security-review.md
  test-writer.md
  refactor-engineer.md
  ```

- [ ] **Step 12.3: Test git pre-commit hook**

  ```powershell
  cd c:\muzykant
  sh .git/hooks/pre-commit
  ```
  Expected: `✅ Pre-commit checks passed`

- [ ] **Step 12.4: Verify MCP config in settings.json**

  ```powershell
  Get-Content "$env:USERPROFILE\.claude\settings.json" | ConvertFrom-Json | Select-Object -ExpandProperty mcpServers
  ```
  Expected: Lists `filesystem`, `github`, `playwright`, `postgres`

---

## Post-Setup Checklist (Manual)

These steps require user action:

- [ ] Create GitHub PAT at https://github.com/settings/tokens (scopes: `repo`, `read:org`, `read:user`)
- [ ] Replace `__REPLACE_WITH_YOUR_TOKEN__` in `~/.claude/settings.json` → `mcpServers.github.env.GITHUB_PERSONAL_ACCESS_TOKEN`
- [ ] Run `gh auth login` in terminal after installing GitHub CLI
- [ ] When you have a PostgreSQL database, update `mcpServers.postgres.args[2]` with real connection string
- [ ] Reload VS Code / Claude Code to pick up new MCP servers
