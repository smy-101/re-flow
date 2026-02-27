# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `pnpm dev` - Start development server (Next.js 16 with App Router)
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Project Architecture

**Tech Stack:**
- Next.js 16 (App Router)
- React 19
- TypeScript 5 (strict mode)
- Tailwind CSS 4 (with @theme inline syntax)
- pnpm package manager

**Directory Structure:**
- `app/` - Next.js App Router pages and layouts
- `components/` - Reusable UI components (if created)
- `lib/` - Utilities and business logic (if created)
- `openspec/` - OpenSpec SDD workflow files (specs, changes, proposals)
- `.claude/` - Claude Code skills and commands

**Key Configurations:**
- Path alias: `@/*` maps to project root (tsconfig.json)
- ESLint uses `eslint-config-next` with core-web-vitals and typescript presets
- PostCSS configured for Tailwind CSS 4 via `@tailwindcss/postcss`
- Next.js config is minimal (next.config.ts)

**Styling:**
- Uses Tailwind CSS 4 with `@import "tailwindcss"` and `@theme inline` blocks
- CSS variables defined in app/globals.css for theming (light/dark mode support)
- Font variables: `--font-geist-sans`, `--font-geist-mono` (loaded in layout.tsx)

## OpenSpec Workflow (SDD)

This project uses Spec-Driven Development via OpenSpec:

1. `/opsx:propose <change-name>` - Generate proposal, specs, design, and tasks
2. `/opsx:apply` - Implement tasks sequentially
3. `/opsx:archive` - Archive completed changes

Configuration: `openspec/config.yaml` defines project context and artifact rules.

## Code Standards

- **Components**: Functional components with React Hooks only (no class components)
- **Style**: Tailwind utility-first, avoid custom CSS
- **Commits**: Conventional Commits format (feat/fix/chore/docs/refactor)

## Available Skills

The project includes these skills for specific scenarios:
- `react-best-practices` - Vercel's React/Next.js performance guidelines (57 rules)
- `composition-patterns` - React composition patterns and component architecture
- `web-design-guidelines` - UI/UX and accessibility review
- `openspec-*` - SDD workflow skills (propose, apply, archive, explore)
