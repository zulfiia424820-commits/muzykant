# muzykant - Roadmap

Updated: 2026-05-20

## Immediate (Technical Debt)
- [ ] Fix TypeScript error: TabKey undefined in src/app/page.tsx
  - Pre-commit hook will block commits until fixed
  - Or use: git commit --no-verify to skip check temporarily

## Current Sprint
- TBD

## Backlog
- TBD

## Done
- [x] Claude Code workspace setup (2026-05-20)
  - .claude/settings.json with hooks
  - 6 skills created
  - MCP servers configured
  - Git pre-commit hook
  - Documentation

## Decisions Log
| Date | Decision | Reason |
|------|---------|--------|
| 2026-05-20 | Added MCP servers via .mcp.json | Claude Code schema requires .mcp.json, not settings.json |
| 2026-05-20 | Set enableAllProjectMcpServers: true | Auto-approve MCP servers to avoid prompts on startup |
