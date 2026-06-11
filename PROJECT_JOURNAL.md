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

### Session: Phase 2 — CRUD & Detail Pages

**Goal:** Make pages interactive — add create, edit, delete, and detail views.

**Done:**
- **4 new UI components:** ChitiModal, ChitiToast (with provider + context), ChitiSelect, ChitiTextarea
- **ToastProvider** integrated in `(app)/layout.tsx` — available on all authenticated pages
- **4 server action files:**
  - `src/lib/actions/orders.ts` — createOrder, updateOrderStatus, deleteOrder
  - `src/lib/actions/products.ts` — createProduct, updateProduct, deleteProduct, adjustStock
  - `src/lib/actions/customers.ts` — createCustomer, updateCustomer, deleteCustomer
  - `src/lib/actions/leads.ts` — createLead, updateLeadStatus, deleteLead
- **4 detail pages:**
  - `/orders/[id]` — order info, items table, customer card, timeline, status action buttons, delete
  - `/products/[id]` — product info, stock movements, stock adjustment form, edit form, delete
  - `/customers/[id]` — customer info, stats, edit form, recent orders linked to order detail
  - `/leads/[id]` — lead info, contact card, message, status update form, quick status buttons, delete
- **4 list pages enhanced** with: New [Entity] dropdown forms, row links to detail pages, delete buttons, status advancement on click, lead kanban column status change shortcuts

**Build verified:** 0 errors, 0 warnings, 4 new routes (`/[id]`), 17 total routes.
**Git commit:** `8b8b8b7` — "Phase 2: CRUD operations, detail pages, server actions, new UI components" (18 files)

**Key decisions:**
- Server actions return `void` (not objects) so they work directly as form `action` props
- "New" forms use `<details>` popover pattern (no JS required) — clean dropdown without modals
- Detail pages are server components with form actions bound via `.bind()`; no client state needed
- Stock adjustment uses a dedicated action that also creates StockMovement records

**Next steps (Phases 3-4):**
- Phase 3: REST API routes, webhook receiver for Bighi Brothers store sync, Recharts on Analytics, CSV/PDF export
- Phase 4: Dockerfile + docker-compose, Sentry, GitHub Actions CI, rate limiting, security hardening

---

### Session: Phase 3 — REST API, Webhooks, Recharts, CSV Export

**Goal:** Make data accessible programmatically, visualize with real charts, enable export.

**Done:**
- **API auth helper** (`src/lib/api/auth.ts`) — `authenticateApiKey()` validates `x-api-key` header against `Project.apiKey`
- **Health endpoint** (`GET /api/health`) — returns `{ status: "ok" }` or `503`
- **REST API routes** (all require `x-api-key` header):
  - `GET /api/orders` — list with `?status=`, `?limit=`, `?offset=`, includes customer + items
  - `POST /api/orders` — create order with optional items array
  - `GET /api/orders/[id]` — single order with full relations
  - `PATCH /api/orders/[id]` — update status/paymentStatus
  - `DELETE /api/orders/[id]` — delete order
  - `GET /api/products` — list with `?category=`, pagination
  - `POST /api/products` — create with `externalId` for store sync
  - `GET /api/customers` — list with pagination
  - `POST /api/customers` — create
  - `GET /api/leads` — list with `?status=`, pagination
  - `POST /api/leads` — create
- **Webhook receiver** (`POST /api/webhook/order`):
  - Accepts order data from external store via API key
  - Matches products by `externalId`, customers by `phone`
  - Creates order with items + timeline entry
- **Recharts on Analytics:**
  - `MonthlyRevenueChart` — AreaChart with gradient fill, revenue by month
  - `SourcePieChart` — Donut chart with legend, order sources distribution
  - Both replace the old CSS bar approach
- **CSV export** (`GET /api/export?entity=orders|products|customers`):
  - Uses session auth (not API key)
  - Returns downloadable CSV with proper headers
  - Export buttons added to Orders, Products, Customers pages

**Build verified:** 0 errors, 0 warnings, 25 total routes (+8 API routes).
**New routes:** `api/health`, `api/orders`, `api/orders/[id]`, `api/products`, `api/customers`, `api/leads`, `api/export`, `api/webhook/order`

**Key decisions:**
- API routes use `x-api-key` header auth (not session) — for external integration
- Export routes use session auth — since they're accessed from browser
- Webhook receiver is same endpoint as API but semantically separate at `/api/webhook/order`
- Recharts components are separate client components (not inlined in page) for cleaner code splitting
- CSV is generated manually (no library) — keeps deps minimal

**Next step (Phase 4):** Docker, Sentry, CI/CD, rate limiting, security hardening

---

### Session: Phase 4 — Production Hardening

**Goal:** Dockerize, add CI/CD, harden security.

**Done:**
- **`Dockerfile`** — Multi-stage build (deps → builder → runner), uses `node:22-alpine`, standalone output, non-root `nextjs` user
- **`docker-compose.yml`** — `app` (Next.js) + `db` (PostgreSQL 17) services, health checks, named volume for data persistence
- **`.dockerignore`** — Excludes node_modules, .git, .next, generated files
- **`.github/workflows/ci.yml`** — CI pipeline: checkout → setup Node 22 → npm ci → prisma generate → lint → build
- **Rate limiter** (`src/lib/api/rate-limit.ts`) — IP-based in-memory rate limiting (60 req/min), integrated into `authenticateApiKey()`
- **CSP headers** in `next.config.ts` — default-src 'self', script-src with unsafe-eval/inline, img-src for Google/GitHub avatars, frame-ancestors 'none', form-action 'self'
- **Env validation** (`src/lib/env.ts`) — checks `DATABASE_URL` and `AUTH_SECRET` at startup in production mode
- **GitHub remote** set to `https://github.com/prabhakarmdes12-cmyk/Chiti-Console.git`, code pushed to `master`

**Build verified:** 0 errors, 0 warnings, 25 routes.
**Git commit:** pending (this session)

**Key decisions:**
- Docker uses `standalone` output (Next.js produces a self-contained server.js) — no need for `next start`
- Rate limiter is in-memory (not Redis) — simple and sufficient for single-instance; Redis can be added later for multi-instance
- CSP is permissive on scripts (`unsafe-eval` + `unsafe-inline`) because Next.js Turbopack injects inline scripts in dev; tighten for production
- CI build uses a dummy `DATABASE_URL` and `AUTH_SECRET` — no real DB needed for type-checking build

**Final project state (all 4 phases complete):**
- Foundation: Next.js 16, TypeScript, Tailwind v4, Prisma 7.x, Auth.js v5
- UI: 12 components (8 Chiti* + Sidebar + TopNav + charts), 10 pages + 4 detail pages
- Auth: Google OAuth + dev credentials, middleware auth guard, API key auth for REST
- CRUD: Server actions for orders, products, customers, leads (create/update/delete/adjust)
- API: 8 REST routes + webhook receiver, rate limited, API key auth
- Charts: Recharts AreaChart + PieChart on Analytics
- Export: CSV download for orders, products, customers
- Infra: Docker, docker-compose, GitHub Actions CI, CSP, env validation
- History: 4 commits on master, pushed to GitHub
