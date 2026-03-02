# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Running & Building:**
- `pnpm dev` - Start development server (Next.js 16 with App Router)
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm worker:rss` - Start RSS worker (background feed fetching)

**Development Environment:**
- Terminal 1: `pnpm dev` - Run Next.js app
- Terminal 2: `pnpm worker:rss` - Run RSS worker (optional, for auto-fetching)

**Testing & Type Checking:**
- `pnpm test` - Run Vitest unit tests (jsdom environment with setup file at `__tests__/setup.tsx`)
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
- `app/api/` - RESTful API routes (auth, feeds, items, categories)
- `lib/auth/` - Authentication utilities (JWT, password hashing, rate limiting)
- `lib/db/` - Database layer (schema, migrations, connection)
- `lib/rss/` - RSS feed fetching logic (fetcher, utilities)
- `lib/api/` - API client functions for frontend consumption (Type-safe wrappers around fetch)
- `workers/` - Background worker processes (RSS worker, etc.)
- `components/` - Reusable UI components (feeds, items, layout, ui)
- `__tests__/` - Unit tests (mirrors `lib/` and `app/` structure)
- `openspec/` - OpenSpec SDD workflow files (specs, changes, proposals)
- `.claude/` - Claude Code skills and commands

**API Route Organization:**
- Auth endpoints: `/api/auth/login`, `/api/auth/register`, `/api/auth/logout`
- Feed endpoints: `/api/feeds` (CRUD), `/api/feeds/[id]`, `/api/feeds/[id]/refresh`, `/api/feeds/validate`
- Item endpoints: `/api/items`, `/api/items/[id]`, `/api/items/[id]/read`, `/api/items/[id]/favorite`
- Categories: `/api/categories`
- All authenticated endpoints require JWT token in HTTP-only cookie

**Authentication Patterns:**
- JWT-based stateless auth (jose library, 7-day expiry)
- Password hashing with bcrypt (cost factor: 10, native bcrypt v6)
- Rate limiting middleware (in-memory, 5 req/min default for auth endpoints)
- Tokens stored in HTTP-only cookies (secure in production, strict sameSite)

**Database Schema:**
- ORM: Drizzle with `sqlite` dialect (better-sqlite3 driver)
- Schema defined in `lib/db/schema.ts` with Drizzle relations
- Exports inferred types: `User`, `NewUser`, `Feed`, `NewFeed`, `FeedItem`, `NewFeedItem`
- Migrations output to `lib/db/migrations/`
- Timestamps use Unix epoch (integer) via SQLite's `strftime('%s', 'now')`
- Indexes on: `feeds.user_id`, `feed_items.feed_id`, `feed_items.user_id`, `feed_items.published_at`
- Cascade deletes: When a user is deleted, their feeds and items are deleted; when a feed is deleted, its items are deleted

**Key Configurations:**
- Path alias: `@/*` maps to project root (tsconfig.json)
- ESLint uses `eslint-config-next` with core-web-vitals and typescript presets
- PostCSS configured for Tailwind CSS 4 via `@tailwindcss/postcss`
- Next.js config is minimal (next.config.ts)

**Styling:**
- Uses Tailwind CSS 4 with `@import "tailwindcss"` and `@theme inline` blocks
- CSS variables defined in app/globals.css for theming (light/dark mode support)
- Font variables: `--font-geist-sans`, `--font-geist-mono` (loaded in layout.tsx)

## RSS Feed Fetching

**Architecture:**
- **Fetcher** (`lib/rss/fetcher.ts`): Core RSS parsing and storage logic
  - Parses RSS feeds using `rss-parser` with 10s timeout
  - Deduplicates items based on `link` field
  - Calculates reading time (250 words/minute)
  - Stores items in `feed_items` table with transaction safety

- **Worker** (`workers/rss-worker.ts`): Independent background process
  - Runs as separate Node.js process (not in Next.js)
  - Scheduled via `node-cron` every 30 minutes
  - Respects minimum 5-minute interval between feed refreshes
  - Sequential processing to avoid overwhelming servers
  - Requires `CRON_SECRET` environment variable

- **API Endpoints:**
  - `POST /api/feeds/[id]/refresh` - Manual single feed refresh (authenticated)
  - `POST /api/feeds/refresh-all` - Batch refresh (requires CRON_SECRET header)
  - `POST /api/feeds` - Creates feed and triggers background fetch

**Environment Variables:**
- `JWT_SECRET` - Secret key for JWT token signing/verification (required for auth)
- `CRON_SECRET` - Secret for authenticating RSS worker requests to refresh-all endpoint

## Client API Functions

**Architecture:**
- Location: `lib/api/` (categories.ts, feeds.ts, items.ts, validate.ts)
- Purpose: Type-safe wrapper functions for frontend to call backend API routes
- Pattern: Async functions that use `fetch()` to call corresponding `/api/*` endpoints
- Handle: Request serialization, response parsing, error handling
- Used by: Client components in `app/` and `components/`

**Benefits:**
- Type safety: Return types inferred from API responses
- Centralized: API URLs and request logic in one place
- Testable: Can mock API calls in unit tests
- DRY: Avoid repetitive `fetch()` calls in components


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
- **Tests**: Required for all business logic and UI changes (Vitest + React Testing Library)
- **Types**: Zero type errors enforced via CI; use inferred types from Drizzle schema

## Available Skills

The project includes these skills for specific scenarios:
- `react-best-practices` - Vercel's React/Next.js performance guidelines (57 rules)
- `composition-patterns` - React composition patterns and component architecture
- `web-design-guidelines` - UI/UX and accessibility review
- `openspec-*` - SDD workflow skills (propose, apply, archive, explore)
