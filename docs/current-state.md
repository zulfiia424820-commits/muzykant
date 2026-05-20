# muzykant - Current State

Updated: 2026-05-20

## What is this
Next.js music application.

## IMPORTANT: Next.js Version
This version has BREAKING CHANGES from standard Next.js.
ALWAYS read `node_modules/next/dist/docs/` BEFORE writing any Next.js code.
Check deprecation notices carefully - APIs may differ from training data.

## Tech Stack
- Next.js (version-specific, see package.json)
- Node.js 24
- TypeScript (see tsconfig.json)

## Status
- Active development
- TypeScript errors in src/app/page.tsx (TabKey undefined) - needs fixing

## Claude Code Config
- `.claude/settings.json` - hooks for post-edit (prettier) and pre-bash safety
- `.claude/skills/` - 6 skills available
- `.mcp.json` - MCP servers (filesystem, github, playwright, postgres)

## Git Hooks
- `pre-commit` - secret scan + TypeScript typecheck
  - To skip: `git commit --no-verify`

## Environment
- `.env.local` - local environment variables (create if missing)
- Use `ep .` alias to load .env when entering this directory
