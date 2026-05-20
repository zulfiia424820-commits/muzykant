# muzykant - Architecture

Updated: 2026-05-20

## Overview
Next.js music application. Architecture TBD as project develops.

## Stack
- Framework: Next.js (breaking-changes version - read docs/ in node_modules)
- Runtime: Node.js 24
- Language: TypeScript
- Package manager: npm (bun also available)

## Important Rules
1. ALWAYS read `node_modules/next/dist/docs/` before implementing Next.js features
2. This version differs from standard Next.js - APIs may have changed
3. Check deprecation notices in the docs

## Directory Structure
```
c:\muzykant\
  src/
    app/          - Next.js App Router pages
  public/         - Static assets
  .claude/
    settings.json - Claude Code hooks config
    skills/       - 6 reusable skills
    hooks/        - post-edit.ps1, pre-bash.ps1
  .mcp.json       - MCP servers config
  docs/           - This documentation
```

## Key Files to Know
- `src/app/page.tsx` - Main page (has TypeScript errors, needs TabKey fix)
- `tsconfig.json` - TypeScript config
- `package.json` - Dependencies and scripts
- `.env.local` - Environment variables (not in git)
