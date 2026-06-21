---
name: chiti-console
description: Use when working on the Chiti Console project — a Next.js 16 operations dashboard for Chiti Technologies. Applies when editing files under src/, prisma/, or docs/.
---

# Chiti Console — Dev Context

## Stack
- Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- Prisma + PostgreSQL (Neon Serverless)
- Auth.js v5 (browser sessions) + JWT via jose (API clients, HS256)
- Framer Motion (animations), Recharts (charts), Lucide React (icons)
- Zustand (client state), React Hook Form + Zod (forms)

## Build
- `npm run dev` — Turbopack (NO API route compilation)
- `npm run build` — webpack (API routes work)
- `npm run build && npm start` — local API testing
- Vercel deploy uses `npm run build` (webpack)

## Auth Architecture
- **Dual auth:** `authenticate()` in `src/lib/api/auth.ts` tries `Authorization: Bearer <jwt>` first, falls back to `x-api-key` header
- **Public routes:** `/api/health`, `/api/contact`, `/api/auth/login`, `/api/auth/register`
- **Webhook routes:** API-key-only (Stripe, Razorpay, WhatsApp)
- **JWT login:** `POST /api/auth/login` returns HS256 token (24h expiry, claims: sub/email/role/projectSlug)
- **Env required:** `JWT_SECRET` must be set at startup (no fallback)

## RBAC (7 roles)
| Role | Scope |
|---|---|
| SUPER_ADMIN | Everything |
| PROJECT_ADMIN | Full CRUD within assigned projects |
| FINANCE_MANAGER | Orders, customers, products, analytics, finance |
| SUPPORT_AGENT | Orders, customers, vendors, listings, enquiries, leads, whatsapp |
| VENDOR_USER | Own orders, products, enquiries |
| CLIENT_VIEWER | Read-only dashboard + analytics |
| CONTENT_EDITOR | Content entries + analytics |

- Server components: `getCurrentUserRole()` + `requireRole()` from `src/lib/db/queries.ts`
- API routes: `requireRole(ADMIN_ROLES | FINANCE_ROLES)` from `src/lib/api/auth.ts`
- Non-SUPER_ADMIN users scoped to `UserProject` memberships via `getAccessibleProjects()`

## Dashboard Operating Models
Dispatch uses `project.type` enum:
- **MARKETPLACE** → CEO Command Center (money cards, funnel, vendor health, money by category)
- **ECOMMERCE** → AOV, OOS products, repeat buyers, top products
- **B2B_CATALOG** → Leads, pipeline stages, won deals
- **SAAS** → Enrollments, active students, churn
- **CONTENT** → Entries, published/draft, views
- **CUSTOM** → Generic stats

## Marketplace Finance Architecture
```
Order (PAID) → Commission (%) + Platform Fee + GST → Net to Vendor
  → Escrow (HELD) → VendorWallet (pending → balance) → Payout (BANK_TRANSFER/UPI)
```
Key models: `Commission`, `Escrow`, `VendorWallet`, `WalletTransaction`, `VendorBankAccount`, `Payout`, `Refund`

## Project Structure
- `src/app/(app)/` — Authenticated app routes (dashboard, orders, vendors, enquiries, listings, finance/*)
- `src/app/api/` — All API routes (orders, customers, products, leads, vendors, enquiries, listings, finance/*, auth)
- `src/components/ui/` — Reusable UI (ChitiCard, ChitiButton, Sidebar, etc.)
- `src/components/layout/` — AppShell
- `src/lib/api/auth.ts` — authenticate(), requireRole(), ADMIN_ROLES, FINANCE_ROLES
- `src/lib/db/queries.ts` — RBAC helpers, project scoping
- `src/lib/actions/` — Server Actions (vendors, marketplace, orders, customers, products)
- `prisma/schema.prisma` — All models

## Key Conventions
- 8pt grid, glassmorphism cards, dark mode default
- Fonts: Outfit (display), Inter (body), JetBrains Mono (code)
- UUID primary keys, Decimal for currency, projectId on every entity
- Enquiry→Booking: `notes: "enquiry:{id}"` for duplicate-safety
- Commission lookup: vendor-specific → category-level → 12% default
- CORS restricted to known origins via Set in `src/proxy.ts`
- All mutations verify project access via `verifyProjectAccess()`
