# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Running & Building:**
- `pnpm dev` - Start development server (Next.js 16 with App Router)
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

**Testing & Type Checking:**
- `pnpm test` - Run Vitest unit tests
- `pnpm exec tsc --noEmit` - Type checking (CI enforces zero errors, no `any` or `ts-ignore`)

**Database (Drizzle ORM + SQLite):**
- `pnpm exec drizzle-kit generate` - Generate migrations from schema
- `pnpm exec drizzle-kit migrate` - Apply migrations
- `pnpm exec drizzle-kit studio` - Open Drizzle Studio for database inspection
- Database file: `./local.db`

## Project Architecture

**Tech Stack:**
- Next.js 16 (App Router)
- React 19
- TypeScript 5 (strict mode, zero type errors enforced)
- Tailwind CSS 4 (with @theme inline syntax)
- Drizzle ORM + SQLite (better-sqlite3 driver)
- pnpm package manager
- Vitest + React Testing Library

**Directory Structure:**
- `app/` - Next.js App Router pages and layouts
- `lib/auth/` - Authentication utilities (JWT, password hashing, rate limiting)
- `lib/db/` - Database layer (schema, migrations, connection)
- `components/` - Reusable UI components (if created)
- `__tests__/` - Unit tests (mirrors `lib/` structure)
- `openspec/` - OpenSpec SDD workflow files (specs, changes, proposals)
- `.claude/` - Claude Code skills and commands

**Authentication Patterns:**
- JWT-based stateless auth (jose library)
- Password hashing with bcrypt (cost factor: 10)
- Rate limiting middleware (in-memory, 100 req/min default)
- Tokens stored in HTTP-only cookies

**Database Schema:**
- ORM: Drizzle with `sqlite` dialect
- Schema defined in `lib/db/schema.ts`
- Exports inferred types: `User`, `NewUser`, etc.
- Migrations output to `lib/db/migrations/`
- Timestamps use Unix epoch (integer) via SQLite's `strftime('%s', 'now')`

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
2. **After proposal: Commit code as baseline for comparison/rollback**
3. `/opsx:apply` - Implement tasks sequentially
4. `/opsx:archive` - Archive completed changes

Configuration: `openspec/config.yaml` defines project context and artifact rules.

## Code Standards

- **Components**: Functional components with React Hooks only (no class components)
- **Style**: Tailwind utility-first, avoid custom CSS
- **Commits**: Conventional Commits format (feat/fix/chore/docs/refactor)
- **Tests**: Required for all business logic and UI changes (Vitest + React Testing Library)
- **Types**: Zero type errors enforced via CI; use inferred types from Drizzle schema

## Available Skills

The project includes these skills for specific scenarios:
- `react-best-practices` - Vercel's React/Next.js performance guidelines (57 rules)
- `composition-patterns` - React composition patterns and component architecture
- `web-design-guidelines` - UI/UX and accessibility review
- `openspec-*` - SDD workflow skills (propose, apply, archive, explore)
