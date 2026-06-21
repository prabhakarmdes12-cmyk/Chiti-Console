# Chiti Console — Development Guide

## Design System
This project uses the **Chiti Technologies Unified Design System v3**:
- `tokens.json` in the design system repo defines all colors, spacing, typography
- CSS variables are defined in `src/app/globals.css`
- Fonts: Outfit (display), Inter (body), JetBrains Mono (code)
- Dark mode default, light mode via `prefers-color-scheme`
- 8pt grid for all spacing
- Glassmorphism for cards and panels

## Stack
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Prisma + PostgreSQL
- Auth.js v5 (NextAuth)
- Framer Motion (animations)
- Recharts (charts)
- Lucide React (icons)

## Project Structure
- `src/app/` — App Router pages (dashboard, orders, customers, etc.)
- `src/components/ui/` — Reusable UI components (ChitiCard, ChitiButton, etc.)
- `src/lib/db/` — Prisma client setup
- `src/lib/auth/` — Auth.js configuration
- `src/lib/integrations/` — WhatsApp, GitHub, Stripe integrations
- `docs/` — All project documentation
- `prisma/` — Database schema and migrations

## API Routes — Auth Pattern
All API routes now use `authenticate()` (from `src/lib/api/auth.ts`) which supports:
1. `Authorization: Bearer <jwt>` — JWT from login response
2. Fallback: `x-api-key` header — static API key

Routes that changed from `authenticateApiKey` → `authenticate`:
- `/api/vendors/*`, `/api/enquiries/*`, `/api/customers`, `/api/orders/*`, `/api/products`, `/api/leads`

Routes still using `authenticateApiKey` only (intentional):
- `/api/webhook/*` — external services (Stripe, Razorpay, WhatsApp)

Public routes (no auth):
- `/api/health` — health check
- `/api/contact` — contact form (associates with booking-jharkhand project)
- `/api/auth/login` — returns JWT
- `/api/auth/register`

## CORS
CORS headers added in `src/proxy.ts` for all routes:
- `Access-Control-Allow-Origin: <request origin>`
- `Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization, x-api-key`
- Preflight (OPTIONS) returns 204

Proxy bypasses auth check for all `/api/*` routes (API routes handle their own auth).

## Turbopack Limitation
`next dev` uses Turbopack which does NOT compile custom API route files (only Auth.js routes work).
**Workaround:** `npm run build` (uses `--webpack`) then `npm start` to test API changes.
Vercel builds also use `--webpack` (configured in `package.json` `vercel-build` script).

## Booking Jharkhand Frontend
Location: `C:\Users\User\Documents\Projects\booking-jharkhand\demo\public\api.js`

`API_BASE` defaults to `https://chiti-console.vercel.app/api`. Override via `localStorage.setItem('bj_api_base', '<your-url>')` (without `/api` suffix).

JWT is already handled: `login()` stores token, `headers()` sends `Authorization: Bearer`. Mock data fallback on API failure.

## Vercel Deployment
- **Console:** `prj_0iiiYyS2jKxy7MSnqzmCfsCP2tJ7` (team: `team_3ge6tRwTRNsYUephocJsbpYv`)
- **Booking Jharkhand:** Not yet linked. Import from GitHub (Vercel dashboard → Add New Project → `prabhakarmdes12-cmyk/booking-jharkhand`, set output dir to `dist`)

Required env vars for Console (Vercel → Project Settings → Environment Variables):
- `DATABASE_URL` — Neon connection string
- `DIRECT_URL` — Neon direct connection (for migrations)
- `AUTH_SECRET` — Auth.js encryption secret
- `JWT_SECRET` — JWT signing secret (used by `/api/auth/login`)
- `AUTH_DEV_EMAIL` — `admin@chiti.com` (dev login)
- `AUTH_DEV_PASSWORD` — dev login password

---

## Sprint Log

### 2026-06-22 — Project Operating Models

**Goal:** Replace slug-based marketplace detection with `ProjectType`-based operating model dispatch. Each project type gets a purpose-built dashboard view.

**Changes:**
1. **schema:** Added `MARKETPLACE` to `ProjectType` enum
2. **seed:** Booking Jharkhand changed from `CUSTOM` → `MARKETPLACE`
3. **DB:** Schema pushed to Neon; `UPDATE` ran to convert production row
4. **`dashboard/page.tsx`:** Refactored `fetchDashboardData()` → dispatches per `projectType`. Created `fetchMarketplaceData()`, `fetchEcommerceData()`, `fetchB2BData()`, `fetchSaaSData()`, `fetchContentData()`, `fetchGenericData()`. Shared data (stats, priorities, revenue, orders) in `fetchSharedData()`.
5. **`DashboardClient.tsx`:** Replaced `isMarketplace` boolean with `operatingModel` string prop. Added `MarketplaceSection`, `EcommerceSection`, `B2BSection`, `SaasSection`, `ContentSection` components. Each renders only when matching `operatingModel`.
6. **New project form:** Added `MARKETPLACE` option to type dropdown.

**Dashboard per type:**

| type | View |
|---|---|
| `MARKETPLACE` | CEO Command Center (money cards, marketplace health, funnel, priorities, money by category, vendor health) |
| `ECOMMERCE` | AOV, active/OOS products, repeat buyer rate, paid orders, top products |
| `B2B_CATALOG` | Total leads, products, won deals, conversion rate, pipeline stages |
| `SAAS` | Enrollments, active students, batches, new leads, churn rate |
| `CONTENT` | Entries, published/draft, views, subscribers |
| `CUSTOM` / null | Generic stats (revenue, orders today, customers, conversion) |

**Files changed:**
- `prisma/schema.prisma` — `MARKETPLACE` added to enum
- `prisma/seed.ts` — BJ type `CUSTOM` → `MARKETPLACE`
- `src/app/(app)/dashboard/page.tsx` — operating model dispatch
- `src/app/(app)/dashboard/DashboardClient.tsx` — type-aware sections
- `src/app/(app)/projects/new/page.tsx` — MARKETPLACE option in dropdown

---

### 2026-06-22 — Role-Based Access Control (RBAC)

**Goal:** Add `FINANCE_MANAGER` and `VENDOR_USER` roles, enforce role-based sidebar filtering, scope project selector to user memberships, and update finance API routes to allow `FINANCE_MANAGER`.

**Changes:**
1. **schema:** Added `FINANCE_MANAGER`, `VENDOR_USER` to `UserRole` enum; pushed to Neon
2. **`src/lib/db/queries.ts`:** Added `getCurrentUser()`, `getCurrentUserRole()`, `requireRole()`, `getAccessibleProjects()`, `roleAtLeast()` — helpers for server-component role checks and project membership filtering
3. **`src/lib/api/auth.ts`:** Exported `requireRole()` (returns 403 response), `ADMIN_ROLES`, `FINANCE_ROLES` constants for API route use
4. **Finance API routes:** `payouts/route.ts` and `refunds/route.ts` — POST/PATCH now use `requireRole(FINANCE_ROLES)` instead of old inline check, allowing `SUPER_ADMIN`, `PROJECT_ADMIN`, or `FINANCE_MANAGER`
5. **Sidebar (`Sidebar.tsx`):** Accepts `userRole` prop; nav items filtered via `rolePermissions` map; "Add Project" button hidden for non-admin roles
6. **App layout (`layout.tsx`):** Uses `getAccessibleProjects()` so non-SUPER_ADMIN users only see projects they belong to; passes `userRole` through AppShell → Sidebar
7. **`AppShell.tsx`:** Accepts and forwards `userRole` to both desktop and mobile Sidebar instances
8. **Seed:** Added demo users: `finance@chiti.com` (FINANCE_MANAGER), `vendor@foresthomestay.com` (VENDOR_USER), `content@chiti.com` (CONTENT_EDITOR)

**Sidebar nav visibility by role:**

| role | visible items |
|---|---|
| `SUPER_ADMIN` / `PROJECT_ADMIN` | All 14 nav items + Add Project |
| `FINANCE_MANAGER` | Dashboard, Orders, Customers, Products, Analytics, Finance |
| `SUPPORT_AGENT` | Dashboard, Orders, Customers, Vendors, Listings, Enquiries, Leads, WhatsApp |
| `VENDOR_USER` | Dashboard, Orders, Products, Enquiries |
| `CLIENT_VIEWER` | Dashboard, Analytics |
| `CONTENT_EDITOR` | Dashboard, Content, Analytics |
