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
- Vitest + React Testing Library + fast-check (property testing)
- AI SDK (Vercel AI SDK with Anthropic/OpenAI providers)

**Directory Structure:**
- `app/` - Next.js App Router pages and layouts
- `app/api/` - RESTful API routes (auth, feeds, items, categories, ai-configs, craft-templates)
- `app/(dashboard)/settings/` - Settings pages (AI config, Craft templates)
- `lib/auth/` - Authentication utilities (JWT, password hashing, rate limiting, encryption)
- `lib/db/` - Database layer (schema, migrations, connection)
- `lib/rss/` - RSS feed fetching logic (fetcher, utilities)
- `lib/api/` - API client functions for frontend consumption (Type-safe wrappers around fetch)
- `lib/ai/` - AI provider logic (providers, test utilities)
- `lib/craft-templates/` - Craft template presets
- `lib/config/` - Configuration files (navigation)
- `hooks/` - Custom React hooks (useSidebar, useMobileDrawer)
- `workers/` - Background worker processes (RSS worker, etc.)
- `components/` - Reusable UI components (feeds, items, layout, ui, ai, craft)
- `__tests__/` - Unit tests (mirrors `lib/` and `hooks/` structure, includes utils/)
- `openspec/` - OpenSpec SDD workflow files (specs, changes, proposals)
- `.claude/` - Claude Code skills and commands

**API Route Organization:**
- Auth endpoints: `/api/auth/login`, `/api/auth/register`, `/api/auth/logout`
- Feed endpoints: `/api/feeds` (CRUD), `/api/feeds/[id]`, `/api/feeds/[id]/refresh`, `/api/feeds/[id]/mark-all-read`, `/api/feeds/validate`, `/api/feeds/refresh-all`
- Item endpoints: `/api/items`, `/api/items/[id]`, `/api/items/[id]/read`, `/api/items/[id]/favorite`, `/api/items/mark-all-read`
- Categories: `/api/categories`
- AI Config endpoints: `/api/ai-configs` (CRUD), `/api/ai-configs/[id]`, `/api/ai-configs/[id]/set-default`, `/api/ai-configs/[id]/toggle`, `/api/ai-configs/[id]/test`, `/api/ai-configs/presets`, `/api/ai-configs/test-direct`
- Craft Template endpoints: `/api/craft-templates` (CRUD), `/api/craft-templates/[id]`
- Favorites: `/api/favorites/count`
- All authenticated endpoints require JWT token in HTTP-only cookie

**Authentication Patterns:**
- JWT-based stateless auth (jose library, 7-day expiry)
- Password hashing with bcrypt (cost factor: 10, native bcrypt v6)
- Rate limiting middleware (in-memory, 5 req/min default for auth endpoints)
- Tokens stored in HTTP-only cookies (secure in production, strict sameSite)
- API key encryption for AI configs (AES-256-GCM via lib/auth/encryption.ts)

**Database Schema:**
- ORM: Drizzle with `sqlite` dialect (better-sqlite3 driver)
- Schema defined in `lib/db/schema.ts` with Drizzle relations
- Exports inferred types: `User`, `NewUser`, `Feed`, `NewFeed`, `FeedItem`, `NewFeedItem`, `AIConfig`, `NewAIConfig`, `CraftTemplate`, `NewCraftTemplate`
- Migrations output to `lib/db/migrations/`
- Timestamps use Unix epoch (integer) via SQLite's `strftime('%s', 'now')`
- Indexes on: `feeds.user_id`, `feed_items.feed_id`, `feed_items.user_id`, `feed_items.published_at`, `feed_items.is_favorite`, `ai_configs.user_id`, `craft_templates.user_id`, `craft_templates.category`
- Cascade deletes: When a user is deleted, their feeds, items, AI configs, and craft templates are deleted; when a feed is deleted, its items are deleted; craft templates restrict delete when referenced AI config is deleted
- Tables: `users`, `feeds`, `feed_items`, `ai_configs`, `craft_templates`

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
- `ENCRYPTION_KEY` - 256-bit key for API key encryption (required for AI configs, 32 bytes hex)

## AI Integration

**Architecture:**
- **Providers** (`lib/ai/providers.ts`): AI provider abstraction layer
  - Supports OpenAI and Anthropic API formats
  - OpenAI-compatible and Anthropic-compatible providers (DeepSeek, Qwen, etc.)
  - Configurable base URLs and model parameters

- **AI Configs** (`ai_configs` table): User-defined AI configurations
  - Stores encrypted API keys (AES-256-GCM)
  - Supports multiple providers and models
  - Health status tracking (unverified/active/error)
  - Default config per user

- **Craft Templates** (`craft_templates` table): Reusable prompt templates
  - Categories: summarize, translate, filter, analyze, rewrite, custom
  - Linked to AI configs for execution
  - Preset templates available in `lib/craft-templates/presets.ts`

- **Settings Pages:**
  - `app/(dashboard)/settings/ai/` - AI configuration management
  - `app/(dashboard)/settings/craft/` - Craft template management

## Client API Functions

**Architecture:**
- Location: `lib/api/` (categories.ts, feeds.ts, items.ts, validate.ts, ai-configs.ts, craft-templates.ts)
- Purpose: Type-safe wrapper functions for frontend to call backend API routes
- Pattern: Async functions that use `fetch()` to call corresponding `/api/*` endpoints
- Handle: Request serialization, response parsing, error handling
- Used by: Client components in `app/` and `components/`

**Benefits:**
- Type safety: Return types inferred from API responses
- Centralized: API URLs and request logic in one place
- Testable: Can mock API calls in unit tests
- DRY: Avoid repetitive `fetch()` calls in components

## Custom Hooks

**Location:** `hooks/`

- `useSidebar` - Sidebar state management (collapsed/expanded)
- `useMobileDrawer` - Mobile drawer state management (open/closed)

**Testing:** Hook tests located in `__tests__/hooks/`

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
