# Chiti Console — Project Journal

## 2026-06-11

### Session: Initial scaffold & Bighi Brothers setup

**Goal:** Stand up the Chiti Console for Bighi Brothers e-commerce with a real database.

**Done:**
- Prisma client generated (`npx prisma generate`) at `src/generated/prisma/`
- 17-model schema pushed to Prisma Postgres (WASM) via `npx prisma db push`
- `prisma.ts` configured with `PrismaPg` driver adapter (`@prisma/adapter-pg` + `pg`)
- Seed script (`prisma/seed.ts`) — upserts Bighi Brothers project, 6 products, 4 customers, 4 orders with items/timeline, 3 leads, 3 content entries, 1 admin user
- Seed executed successfully (`npx tsx prisma/seed.ts`)
- 10 UI components built: ChitiCard, ChitiButton, ChitiInput, ChitiBadge, ChitiTable, ChitiStatCard, ChitiPageHeader, ChitiStatusBadge, Sidebar, TopNav
- 10 page stubs created: dashboard, orders, customers, products, leads, analytics, whatsapp, content, system, settings
- Dashboard enhanced with stat cards, recent orders, active projects
- Login page with Google OAuth + dev credentials form
- Auth.js v5 with JWT strategy, PrismaAdapter, Google + Credentials providers
- Middleware (auth guard) — redirects to `/login` if unauthenticated
- All pages updated to query real data from DB via Prisma
- All pages set to `force-dynamic` to avoid static prerendering errors
- Build succeeds with 0 errors, 0 warnings — 14 routes all `ƒ` dynamic
- Error boundaries: `(app)/error.tsx` and `login/error.tsx`
- Loading skeleton: `(app)/loading.tsx`
- Not-found page: `(app)/not-found.tsx`

**Key decisions:**
- **Next.js 16 proxy convention** — middleware file must be `src/proxy.ts` (not `src/middleware.ts`), exporting `proxy` (not `middleware`). Next.js 16.2.7 deprecated `middleware.ts` in favor of `proxy.ts`.
- Switched from Prisma Accelerate (`prisma+postgres://`) to `@prisma/adapter-pg` driver adapter (Prisma 7.x requires adapter for PostgreSQL)
- Switched `.env.local` DATABASE_URL from `prisma+postgres://` to `postgres://postgres:postgres@localhost:51214/postgres` for pg adapter compatibility
- Kept `.env` with `prisma+postgres://` URL for Prisma CLI commands
- Added dev Credentials provider (email/password) alongside Google OAuth for local testing
- Hardened `prisma.ts` with lazy getter pattern and fallback URL
- `loading.tsx` goes in `(app)/` route group, not per-page — single skeleton covers all 10 pages

**Problems encountered:**
1. **500 Configuration error on page load** — Caused by stale Prisma Postgres (WASM) process. After ~6 hours of uptime, the server stopped accepting PostgreSQL wire-protocol handshakes while still accepting TCP connections. Fix: killed process and restarted via `npx prisma dev start`.
2. **PowerShell `$` interpolation in inline scripts** — `node -e` scripts break because PowerShell interprets `$disconnect` as a variable. Workaround: write temp `.ts` files and run with `npx tsx`.
3. **Prisma 7.x requires driver adapter for PostgreSQL** — Can't use PrismaClient without adapter. Must use `@prisma/adapter-pg` with `pg` package.
4. **`npx prisma dev` ephemeral storage** — Data is lost when the WASM process stops. Must re-run `npx tsx prisma/seed.ts` after restart.

**Known issues:**
- Prisma Postgres (WASM) process becomes stale after extended uptime — may need periodic restart
- Google OAuth requires the user's email to be added as a test user in Google Cloud Console
- Dev credentials (`admin@chiti.com` / `dev123`) are hardcoded in `.env.local` — not suitable for production
- Analytics page uses CSS bar charts instead of Recharts
- Search bar in TopNav is non-functional
- Settings page toggles are non-functional
- No detail pages (`[id]` routes) — all data displayed in lists/table only
- No CRUD operations — all pages are read-only
- No REST API routes for external integration
- No loading states for individual page sections (just route-level skeleton)

---

### Session: Phase 1 — Production Foundation

**Goal:** Make the project deployable and production-ready.

**Done:**
- **Middleware** — Next.js 16 deprecated `middleware.ts` in favor of `proxy.ts`. Final state: `src/proxy.ts` exporting `proxy` (not `middleware`), with auth guard, public route exception, and login redirect.
- **`next.config.ts`** — added `output: "standalone"` for deployment, `serverExternalPackages: ["@prisma/adapter-pg", "pg"]` for Prisma adapter in standalone, security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
- **`.env.example`** — added production Postgres URL template (Neon), dev credentials template, better section comments
- **`loading.tsx`** — animated skeleton for `(app)` route group (pulsing stat cards + table placeholder)
- **`not-found.tsx`** — branded 404 page with "Back to Dashboard" link
- **`PROJECT_JOURNAL.md`** — created (this file), comprehensive session log
- **`README.md`** — rewritten with accurate current state, scripts, project structure, known limitations
- **Dev login** — added Credentials provider (`admin@chiti.com` / `dev123`) for local testing
- **Error boundaries** — `(app)/error.tsx` catches dashboard crashes, `login/error.tsx` catches auth failures
- **Git commit** — `a9ae3f9` — "Bighi Brothers foundation: dashboard, 10 pages, UI components, Prisma DB, Auth.js, dev login" (54 files)

**Build verified:** 0 errors, 0 warnings, 15 routes all dynamic, Proxy recognized correctly.

**Next steps (Phases 2-4):**
- Phase 2: CRUD operations, detail pages, server actions, form components (ChitiModal, ChitiSelect, ChitiTextarea, ChitiToast)
- Phase 3: REST API, webhooks (Bighi Brothers store integration), Recharts charts, CSV/PDF export
- Phase 4: Dockerfile + docker-compose, Sentry, GitHub Actions CI, rate limiting, security hardening
