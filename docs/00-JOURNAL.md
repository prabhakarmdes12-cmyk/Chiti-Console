# Chiti Console — System Journal & Decision Log

> **Version:** 1.3.0  
> **Codename:** V1 AI  
> **Last Updated:** 22 June 2026  
> **Maintainer:** Prabhakar Kumar  
> **Audience:** Developers | Designers | Stakeholders

---

## Table of Contents

1. [Executive Overview](#1-executive-overview)
2. [Design System Implementation](#2-design-system-implementation)
3. [Technical Architecture](#3-technical-architecture)
4. [Feature Registry](#4-feature-registry)
5. [Data Architecture](#5-data-architecture)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [Integration Strategy](#7-integration-strategy)
8. [Decisions Log](#8-decisions-log)
9. [Seeded Data Reference](#9-seeded-data-reference)
10. [Roadmap & Implementation Status](#10-roadmap--implementation-status)
11. [Appendices](#11-appendices)

---

## 1. Executive Overview

### What It Is

Chiti Console is a unified, multi-project operations dashboard purpose-built for Chiti Technologies and its client ecosystem. It serves as the single pane of glass through which all operational data — orders, customers, products, leads, content, analytics, and communications — is managed across every project the organisation runs.

Unlike generic back-office tools (Shopify Admin, WooCommerce, WordPress), Console is **project-aware**: it understands the distinction between a D2C skincare brand (Bighi Brothers), a B2B essential oils catalogue (Ts Aromatics), a fine jewellery atelier (House of Giriraj), and an EdTech coaching platform (Bhatia Master Classes) — and presents unified cross-project views alongside per-project drilldowns.

### Who It Serves

| Role | Access Scope | Typical Use |
|------|-------------|-------------|
| **Super Admin** (founder) | All projects, all operations, system settings | Daily ops, cross-project analytics, team management |
| **Project Admin** | Single project — full CRUD | Day-to-day management of one brand |
| **Support Agent** | Orders, customers, WhatsApp within a project | Order processing, customer replies |
| **Content Editor** | Content entries only | CMS content management per project |
| **Client Viewer** (future) | Read-only analytics for their project | Self-service reporting |

### Key Differentiators

- **Cross-project orchestration** — view revenue, orders, and leads across all brands in one dashboard, then drill into any single project
- **Project-aware data model** — every entity (order, customer, product, lead) is scoped to a project with full isolation; the same phone number can be a customer of multiple projects independently
- **WhatsApp-native operations** — orders originate from WhatsApp inquiries; the chat-to-order pipeline is a first-class flow, not an afterthought
- **Design-system aligned** — every pixel respects Chiti Unified Design System v3 tokens (8pt grid, HSL colour system, Outfit/Inter/JetBrains Mono typography)
- **Battery-included seed data** — deployed with real business data for all 4 projects, so every screen has meaningfully populated content from day one

---

## 2. Design System Implementation

### 2.1 Token Architecture

Chiti Console implements the Chiti UDS v3 three-layer token architecture directly via Tailwind v4's `@theme` directive. All visual properties originate from `tokens.json` and are compiled into CSS custom properties in `src/app/globals.css`.

| Layer | Source | Example | Consumption |
|-------|--------|---------|-------------|
| **Primitive** | `tokens.json` | `hsl(260, 100%, 65%)` | Raw colour values |
| **Semantic** | `globals.css` | `--color-brand-primary` | Tailwind utility classes |
| **Component** | Individual components | `bg-brand-primary` | `ChitiButton`, `ChitiCard`, etc. |

**Token-to-CSS mapping** (`src/app/globals.css`):

```css
@theme {
  --color-brand-primary: hsl(260, 100%, 65%);   /* Purple — primary actions */
  --color-brand-secondary: hsl(190, 100%, 50%); /* Cyan — secondary elements */
  --color-surface-1: hsl(220, 10%, 8%);          /* Cards, panels */
  --color-surface-2: hsl(220, 10%, 12%);         /* Elevated surfaces */
  --color-surface-3: hsl(220, 10%, 16%);         /* Hover states */
  --color-bg-dark: hsl(220, 10%, 4%);            /* Page background */
  --color-text-main: hsl(0, 0%, 98%);            /* Primary text */
  --color-text-muted: hsl(220, 10%, 65%);        /* Secondary text */
  --color-success: hsl(150, 80%, 40%);
  --color-error: hsl(350, 80%, 55%);
  --color-info: hsl(210, 90%, 50%);
  --color-warning: hsl(35, 90%, 50%);
  --font-display: "Outfit", sans-serif;
  --font-body: "Inter", sans-serif;
  --font-mono: "JetBrains Mono", monospace;
}
```

**Light mode** is activated via `@media (prefers-color-scheme: light)` with inverted surface/text values. **Reduced motion** is respected via `@media (prefers-reduced-motion: reduce)` which zeros all transitions and animations.

### 2.2 Spacing & Grid

- **8pt grid** enforced throughout: `space-1` (4px) through `space-8` (64px)
- **Sidebar**: 260px fixed width
- **TopNav**: 64px fixed height
- **Content area**: fluid, `calc(100vw - 260px)`
- **Max content width**: 1440px
- **Grid**: 12-column implied via Tailwind grid utilities

### 2.3 Component Library

UI components live in `src/components/ui/` and follow a consistent pattern: server-compatible by default, client-only when interactivity demands it (`"use client"` for animations, dropdowns, toasts).

| Component | File | Type | Purpose |
|-----------|------|------|---------|
| `ChitiCard` | `ChitiCard.tsx` | Server | Glassmorphism card wrapper |
| `ChitiStatCard` | `ChitiStatCard.tsx` | Server | KPI metric display (icon, value, change) |
| `ChitiPageHeader` | `ChitiPageHeader.tsx` | Server | Page title + description + actions slot |
| `ChitiStatusBadge` | `ChitiStatusBadge.tsx` | Server | Colour-coded status indicator |
| `ChitiToast` | `ChitiToast.tsx` | Client | Temporary notification with context |
| `HealthScore` | `HealthScore.tsx` | Server | Circular SVG gauge (0-100) |
| `ProjectSelector` | `ProjectSelector.tsx` | Client | Dropdown to filter dashboard by project |
| `ProjectTabs` | `ProjectTabs.tsx` | Client | Sub-navigation (Overview, Orders, Products, Customers) |
| `Sidebar` | `Sidebar.tsx` | Client | Expandable navigation with project list + brand glow |
| `TopNav` | `TopNav.tsx` | Client | Header bar with project selector + user menu + glass |
| `MonthlyRevenueChart` | `charts/MonthlyRevenueChart.tsx` | Client | Recharts area chart (6-month) with brand gradient |
| `DeleteButton` | (form-level) | Client | Confirmation dialog for destructive actions |
| `ActionForm` | (form-level) | Server | Reusable form action wrapper |
| `FadeIn` | `motion/FadeIn.tsx` | Client | Fade + slide-up entry animation (direction, delay, duration) |
| `SlideUp` | `motion/SlideUp.tsx` | Client | Vertical slide with spring physics |
| `Stagger` | `motion/Stagger.tsx` | Client | Staggered children with configurable delay |
| `NumberTicker` | `motion/NumberTicker.tsx` | Client | Animated counter (SSR-disabled) |
| `GlowCard` | `motion/GlowCard.tsx` | Client | Card with animated brand glow border |
| `EmptyState` | `ui/EmptyState.tsx` | Server | Reusable empty state with icon + message + CTA |
| `ErrorBoundary` | `ui/ErrorBoundary.tsx` | Client | Class component error boundary with retry |
| `ProfitLossChart` | `charts/ProfitLossChart.tsx` | Client | Recharts area chart for revenue vs expenses |
| `AddExpenseForm` | `finance/AddExpenseForm.tsx` | Client | Modal form with category/tags/date |
| `LeadFollowUp` | `ui/LeadFollowUp.tsx` | Client | Email modal for lead follow-ups |

No external UI library is used. All components are custom-built to match Chiti UDS v3 specifications exactly, avoiding the overhead and styling conflicts of shadcn/ui, Material UI, or Chakra.

### 2.4 Typography

| Usage | Font | Weight Scale |
|-------|------|-------------|
| Display / KPIs | Outfit | 300 (large numbers), 700 (headlines) |
| Body / UI | Inter | 400 (body), 500 (medium), 600 (semibold) |
| Code / Data | JetBrains Mono | 400 (regular) |

### 2.5 Motion & Animation

Animations use Framer Motion with timings from the design system:

| Element | Duration | Easing |
|---------|----------|--------|
| Page transitions | 300ms | spring(damping: 20) |
| Card hover | 300ms | spring(damping: 20) |
| Status badge change | 400ms | spring(damping: 15) |
| List stagger | 50ms per item | ease-out |
| Skeleton shimmer | 1.5s loop | linear |

All animations are disabled under `prefers-reduced-motion: reduce`.

### 2.6 Accessibility

- Focus rings on all interactive elements (`focus:ring-2 focus:ring-brand-primary/50`)
- Tab order follows visual layout (sidebar → header → content)
- Status is never conveyed by colour alone (text + icon + colour)
- Reduced motion respected globally
- Semantic HTML throughout (native `<form>`, `<button>`, `<nav>`, `<main>`)

---

## 3. Technical Architecture

### 3.1 Stack Decisions

| Layer | Choice | Rationale | Alternatives Considered |
|-------|--------|-----------|------------------------|
| **Framework** | Next.js 16 (App Router) | Aligns with existing projects (Bighi Brothers, TS Aromatics); React Server Components eliminate waterfall loading | Remix (smaller ecosystem), SvelteKit (team unfamiliar) |
| **Language** | TypeScript 5.7 | Type safety across all layers; Prisma generates types from schema | None |
| **CSS** | Tailwind CSS v4 + CSS variables | Zero-runtime, design-system compatible via `@theme` directive; no style conflicts | CSS Modules (slower iteration), styled-components (runtime cost) |
| **UI Components** | Custom (`src/components/ui/`) | Pixel-perfect control; no external dependency overhead | shadcn/ui (too opinionated), MUI (too heavy) |
| **ORM** | Prisma 7 + PrismaPg adapter | Type-safe queries, auto-generated client, migrations built-in; PrismaPg enables WASM-based local dev | Drizzle (fewer adapters), TypeORM (heavier) |
| **Database** | PostgreSQL (Neon serverless) | Relational model perfectly fits project-scoped data; serverless for Vercel | Supabase (vendor lock-in), PlanetScale (MySQL, no FK support) |
| **Auth** | Auth.js v5 (NextAuth) | Multi-provider OAuth + JWT out of the box; Prisma adapter available | Clerk (too expensive), Lucia (unmaintained) |
| **Charts** | Recharts | React-native composable charting; used in NetQ Command already | Chart.js (class-based), Nivo (complex API) |
| **Animations** | Framer Motion | Design-system motion primitives; spring physics | CSS animations (limited expressiveness) |
| **Icons** | Lucide React | Consistent, tree-shakeable, MIT-licensed | Heroicons (limited set), Phosphor (less known) |
| **Forms** | Server Actions + native FormData | Zero JS for basic CRUD; progressive enhancement by default | React Hook Form (overkill for simple forms), Zod (not needed until validation) |
| **Deployment** | Vercel | Automatic CI/CD from GitHub, edge functions, serverless PostgreSQL | Railway (less mature), AWS (more overhead) |

### 3.2 System Topology

```
┌─────────────────────────────────────────────────────────────┐
│                      CHITI CONSOLE                          │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Next.js 16 App Router                    │  │
│  │                                                      │  │
│  │  ┌──────────────────────┐  ┌──────────────────────┐  │  │
│  │  │  Server Components   │  │  Client Components    │  │  │
│  │  │  (RSC, async)        │  │  (interactivity)      │  │  │
│  │  └──────────┬───────────┘  └──────────┬───────────┘  │  │
│  │             │                         │               │  │
│  │  ┌──────────┴──────────────────────────┴───────────┐  │  │
│  │  │           Server Actions + API Routes            │  │  │
│  │  │  - CRUD actions (products, orders, customers)   │  │  │
│  │  │  - Webhook receivers (WhatsApp, GitHub)         │  │  │
│  │  │  - Auth callbacks                               │  │  │
│  │  └──────────────────────┬──────────────────────────┘  │  │
│  │                         │                              │  │
│  │  ┌──────────────────────┴──────────────────────────┐  │  │
│  │  │              Prisma 7 ORM                       │  │  │
│  │  │  ┌────────────────┐  ┌──────────────────────┐  │  │  │
│  │  │  │  PrismaPg      │  │  Prisma Client        │  │  │  │
│  │  │  │  Adapter       │  │  (auto-generated)     │  │  │  │
│  │  │  └────────────────┘  └──────────────────────┘  │  │  │
│  │  └──────────────────────┬──────────────────────────┘  │  │
│  └─────────────────────────┼────────────────────────────┘  │
│                            │                                │
│              ┌─────────────┴─────────────┐                  │
│              │     PostgreSQL (Neon)      │                  │
│              │     ep-quiet-fire-...      │                  │
│              └───────────────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Data Flow Patterns

**Read path (RSC):**
```
Request → Next.js Server Component
  → auth() verifies JWT session
  → getProjectId() reads chiti_project cookie
  → prisma.query({ where: { ...projectFilter(projectId) }})
  → Render HTML with data
  → Stream to client
```

**Write path (Server Action):**
```
Client submits <form action={serverAction}>
  → Server Action receives FormData
  → auth() verifies session
  → prisma write operation
  → revalidatePath() busts cache
  → redirect() or return result
  → UI re-renders with fresh data
```

### 3.4 Deployment Architecture

- **Host**: Vercel (pro plan), production alias at `chiti-console.vercel.app`
- **Database**: Neon PostgreSQL (serverless, auto-scaling to zero)
- **Build**: Automatic on push to `master` branch
- **Build scripts**:
  - `postinstall`: `prisma generate` — generates Prisma client
  - `vercel-build`: `prisma generate && next build`
- **Environment variables stored on Vercel**: `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_DEV_EMAIL`, `AUTH_DEV_PASSWORD`, `NEXT_PUBLIC_CONSOLE_URL`

**Critical configuration detail — PrismaPg adapter**: The `@prisma/adapter-pg` cannot parse `prisma+postgres://` protocol URLs (used by Prisma Postgres WASM for local dev). The app uses `DIRECT_URL` (raw `postgres://` or `postgresql://` connection string) as the primary connection variable, with `DATABASE_URL` as fallback. Both `prisma.ts` and `seed.ts` use `startsWith("postgres")` to detect valid connection strings, since Neon uses the `postgresql://` scheme.

---

## 4. Feature Registry

Each feature entry below documents what was built, the key technical pattern, and implementation status.

> **Session 11 update (14 June 2026):** 44+ routes, 0 TS errors. Visual refresh: glassmorphism + Framer Motion on all pages. Security hardening: signed portal JWT, CSP + HSTS + Permissions-Policy, timing-safe webhooks, `verifyProjectAccess()` authz on all server actions, Zod v4 input validation on API routes.

### 4.1 Project Registry

| Aspect | Detail |
|--------|--------|
| **Location** | `/projects` (list), `/projects/[id]` (detail), `/projects/new` (create) |
| **Server action** | `src/lib/actions/projects.ts` — `createProject(formData)` |
| **Key query** | `prisma.project.findMany({ orderBy: { name: "asc" } })` with enriched health, revenue, lead counts |
| **Status** | ✅ Complete |

The project is the central organizing entity. Every order, customer, product, lead, and content entry is scoped to exactly one project. The `slug` field is unique and auto-generated from the project name. Each project gets a unique `apiKey` (UUID v4) for programmatic access.

**Create flow**: Form at `/projects/new` captures name, type (ECOMMERCE / B2B_CATALOG / CONTENT / SAAS / CUSTOM), domain, integration type (API / WEBHOOK / CMS / MANUAL), and optional logo URL. On submission, the server action creates the project record and assigns the current user as ADMIN via `UserProject`. Redirects to the new project's detail page.

**Health scoring**: Each project has a computed health score (0-100) based on 5 weighted checks: orders in last 30 days, unread WhatsApp messages, out-of-stock products, stale leads, and content updates.

### 4.2 Dashboard

| Aspect | Detail |
|--------|--------|
| **Location** | `/dashboard` |
| **Implementation** | Single async RSC with 10 parallel Prisma queries |
| **Status** | ✅ Complete |

The dashboard executes 10 database queries in parallel via `Promise.all`:
1. Orders created today (project-scoped)
2. Orders created yesterday (for comparison)
3. Total revenue (aggregate sum)
4. Active customer count
5. Customers created before today (for conversion rate)
6. Recent 4 orders with customer data
7. Active projects list
8. Today's priorities (stale leads, OOS products, unread WhatsApp, old pending orders)
9. Expected revenue (current month vs previous month)
10. Monthly revenue time-series (last 6 months)

**Project filtering**: A `chiti_project` cookie stores the selected project context. When set, all queries are scoped to that project. When "All Projects" is selected, queries return cross-project aggregates.

### 4.3 Order Management

| Aspect | Detail |
|--------|--------|
| **Location** | `/orders`, `/orders/[id]`, `/projects/[id]/orders` |
| **Server actions** | `src/lib/actions/orders.ts` — `createOrder`, `updateOrderStatus`, `deleteOrder` |
| **API routes** | `src/app/api/orders/route.ts` (REST), `src/app/api/orders/[id]/route.ts` |
| **Status** | ✅ Complete |

Orders support the full lifecycle: PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED (or CANCELLED). Each status transition is logged in the `OrderTimeline` table for an auditable history.

Order numbers follow a project-prefixed pattern: `BB-0042`, `HG-0001`, etc.

The order creation flow supports both manual entry (select customer, add line items from product catalog) and WhatsApp-originated orders (auto-created from incoming messages).

**Order items** are denormalized (store `productName` and `unitPrice` at time of order) so historical order data remains accurate even if product prices change.

### 4.4 Customer Management

| Aspect | Detail |
|--------|--------|
| **Location** | `/customers`, `/projects/[id]/customers` |
| **Server actions** | `src/lib/actions/customers.ts` — `createCustomer`, `updateCustomer`, `deleteCustomer` |
| **API routes** | `src/app/api/customers/route.ts` |
| **Status** | ✅ Complete |

Customers are project-scoped with unique constraints on `[projectId, phone]` and `[projectId, email]`, preventing duplicate customers within a project while allowing the same person to be a customer of multiple projects.

Each customer record tracks `totalOrders`, `totalSpent`, and `lastOrderAt` for at-a-glance value assessment.

### 4.5 Product & Inventory

| Aspect | Detail |
|--------|--------|
| **Location** | `/products`, `/projects/[id]/products` |
| **Server actions** | `src/lib/actions/products.ts` — `createProduct`, `updateProduct`, `deleteProduct`, `adjustStock` |
| **API routes** | `src/app/api/products/route.ts` |
| **Status** | ✅ Complete |

Products track `stock` (nullable — null means unlimited) and `lowStockThreshold`. Stock movements are logged in the `StockMovement` table with type (IN / OUT / ADJUSTMENT), quantity, and reason for audit trails.

### 4.6 Lead CRM

| Aspect | Detail |
|--------|--------|
| **Location** | `/leads`, `/projects/[id]/leads` |
| **Server actions** | `src/lib/actions/leads.ts` |
| **API routes** | `src/app/api/leads/route.ts` |
| **Status** | ✅ Complete (basic CRUD) |

Leads follow a pipeline: NEW → CONTACTED → QUALIFIED → PROPOSAL → WON / LOST. Each lead tracks the source (website form, WhatsApp, Calendly, or manual entry), products enquired about, and follow-up dates.

### 4.7 Analytics

| Aspect | Detail |
|--------|--------|
| **Location** | `/analytics` (planned) |
| **Current** | Dashboard provides monthly revenue chart and comparison metrics |
| **Status** | 🟡 Partial (dashboard analytics only; dedicated analytics page not yet built) |

The analytics module currently exists only as embedded charts on the dashboard (monthly revenue via Recharts AreaChart, KPI row via ChitiStatCard). The planned analytics page with cross-project drilldown, traffic sources, and full date-range filtering is not yet implemented.

### 4.8 WhatsApp Operations

| Aspect | Detail |
|--------|--------|
| **Location** | `/whatsapp` (planned) |
| **Current** | Data model exists (`WhatsAppConversation`, `WhatsAppMessage`); seed data includes mock conversations |
| **API routes** | `src/app/api/webhook/whatsapp/route.ts` (webhook receiver, needs env vars) |
| **Status** | 🔴 Not live (blocked on WhatsApp Business API credentials) |

WhatsApp conversations and messages are fully modeled in the database with seed data demonstrating the chat structure. The webhook endpoint is written but requires `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, and `WHATSAPP_APP_SECRET` environment variables to function. The unified WhatsApp inbox UI is not built.

### 4.9 Content Dashboard

| Aspect | Detail |
|--------|--------|
| **Location** | `/content` (planned) |
| **Status** | 🟡 Data model exists (no UI) |

The `ContentEntry` model stores CMS content across projects with title, slug, type, status, and body. Seed data includes pages, collections, and banners for each project. No UI exists to view or manage content entries yet.

### 4.10 System Health

| Aspect | Detail |
|--------|--------|
| **Location** | `/system` (planned) |
| **Status** | 🔴 Not built |

System health monitoring (uptime, SSL, deployment log) is documented in the PRD but not yet implemented.

### 4.11 Settings

| Aspect | Detail |
|--------|--------|
| **Location** | `/settings` |
| **Server action** | `src/lib/actions/settings.ts` — `updatePreferences` |
| **Status** | ✅ Complete (profile/preferences only) |

Settings currently supports user preference toggles (persisted as JSON on the User model).

### 4.12 Financial Module

| Aspect | Detail |
|--------|--------|
| **Location** | `/finance` (dashboard, expenses, budgets, invoices tabs) |
| **Server actions** | `src/lib/actions/finance.ts` — `getFinancialDashboardData`, `createExpense`, `deleteExpense`, `getBudgets`, `getInvoices`, `getInvoiceLineItems` |
| **Status** | ✅ Complete |

The financial dashboard shows real-time KPIs (revenue, expenses, profit, pending invoices) and a ProfitLossChart (Recharts area chart). The Expenses tab includes `AddExpenseForm` modal with category/tags/date filtering. Budgets tab shows progress bars against monthly limits. Invoices tab has status badges, totals, client info, and due dates.

**New DB models:** `Invoice`, `InvoiceItem`, `Expense`, `Budget` (project-scoped, all follow `BaseEntity` pattern with `createdAt`/`updatedAt`).

### 4.13 Client Portal

| Aspect | Detail |
|--------|--------|
| **Location** | `/portal/login`, `/portal/dashboard`, `/portal/orders/[id]`, `/portal/invoices` |
| **Auth** | JWT-based (separate from admin Auth.js); `src/lib/auth/portal.ts` — `generatePortalToken`, `verifyPortalToken` |
| **Status** | ✅ Complete |

Clients log in with email + PIN. The JWT encodes `clientAccessId` for permission scoping. Dashboard shows order status, invoice list, and receipt download. Order detail page has timeline, line items, and tracking. Permission model uses `ClientAccess` model (ties users to companies with optional `order:read`, `invoice:read`, `analytics:read` scopes).

### 4.14 Pricing & Billing

| Aspect | Detail |
|--------|--------|
| **Location** | `/pricing` (plan cards), `/billing` (current plan, payment method, invoice history, usage) |
| **Status** | ✅ Complete |

`/pricing` shows Starter / Growth / Enterprise plan cards with monthly/annual toggle. `/billing` reads plan from `User.plan` field, displays usage metrics (projects, team members, storage), and lists payment methods and billing history. Stripe/Razorpay webhook handlers are scaffolded at `src/app/api/webhook/stripe/` and `src/app/api/webhook/razorpay/`.

### 4.15 AI Chat / NL Query

| Aspect | Detail |
|--------|--------|
| **Location** | `QueryBar` component on `/dashboard` |
| **Server action** | `src/lib/ai/nl-query.ts` — `performNLQuery` |
| **Status** | ✅ Complete (basic) |

The `QueryBar` component floats above the dashboard. Users type natural language questions ("show revenue from last month", "which orders are pending?", "top customers"). The `performNLQuery` action uses intent classification to route to orders, financial, or customers data, returning structured results rendered inline.

### 4.16 Marketplace — Booking Jharkhand

| Aspect | Detail |
|--------|--------|
| **Location** | `/vendors`, `/listings`, `/enquiries`, `/finance/escrow`, `/finance/wallets`, `/finance/payouts`, `/finance/refunds`, `/finance/commissions` |
| **Server actions** | `src/lib/actions/marketplace.ts` — `convertEnquiryToBooking()`; `src/lib/actions/vendors.ts` — `updateVendorStatus()`, `upsertVendorBankAccount()`, `updateVendorDocumentStatus()` |
| **API routes** | `/api/vendors/*`, `/api/enquiries/*`, `/api/listings/*`, `/api/finance/marketplace`, `/api/finance/payouts`, `/api/finance/refunds`, `/api/bj/dashboard` |
| **Status** | ✅ Complete |

Marketplace finance uses dedicated Prisma models: `Commission`, `Escrow`, `VendorWallet`, `WalletTransaction`, `VendorBankAccount`, `Payout`, `Refund`. The `Order` model is extended with tourism-specific fields (`vendorId`, `checkIn`, `checkOut`, `guests`, `roomType`, `pickupLocation`, `dropoffLocation`) and finance fields (`commissionAmount`, `platformFee`, `gstAmount`).

**Enquiry→Booking flow:** Admin clicks "Convert to Booking" → Server action creates CONFIRMED order (with commission/GST/tourism fields), marks enquiry CONFIRMED, creates escrow (HELD), adds pendingBalance to VendorWallet, creates PENDING payout — all in one atomic action. Duplicate-safe via `notes: "enquiry:{id}"` check.

**BJ Dashboard** (`/api/bj/dashboard`): Returns CEO metrics (revenue, GBV, orders), marketplace health (active vendors, pending KYC, suspended), customer funnel (new → contacted → quoted → confirmed), vendor health by category, money by category, platform priorities. Uses `paymentStatus === "PAID"` AND `status !== "CANCELLED"` for revenue accuracy.

### 4.17 Project Operating Models

| Aspect | Detail |
|--------|--------|
| **Location** | `/dashboard` — server dispatch in `page.tsx`, client sections in `DashboardClient.tsx` |
| **Dispatch** | `fetchDashboardData()` switches on `project.type` (MARKETPLACE/ECOMMERCE/B2B_CATALOG/SAAS/CONTENT/CUSTOM) |
| **Shared** | `fetchSharedData()` extracts common stats, priorities, revenue, orders, projects |
| **Status** | ✅ Complete |

Project types get purpose-built dashboard views: Marketplace (CEO Command Center with money cards, funnel, vendor health), Ecommerce (AOV, OOS products, repeat buyers), B2B (leads, pipeline), SaaS (enrollments, churn), Content (views, subscribers).

### 4.18 Role-Based Access Control (RBAC)

| Aspect | Detail |
|--------|--------|
| **New roles** | `FINANCE_MANAGER`, `VENDOR_USER` added to `UserRole` enum |
| **DB helpers** | `src/lib/db/queries.ts` — `getCurrentUser()`, `getCurrentUserRole()`, `requireRole()`, `getAccessibleProjects()`, `roleAtLeast()` |
| **API helpers** | `src/lib/api/auth.ts` — `requireRole()`, `ADMIN_ROLES`, `FINANCE_ROLES` |
| **Sidebar** | Nav items filtered via `rolePermissions` map in `Sidebar.tsx` |
| **Status** | ✅ Complete |

Seven roles with granular sidebar visibility, project membership scoping in the layout, API route role gating (finance mutations require FINANCE_ROLES), and demo users for all roles in seed data.

---

## 5. Data Architecture

### 5.1 Entity Relationships

```
Project ──1:N── Order
Project ──1:N── Customer
Project ──1:N── Product
Project ──1:N── Lead
Project ──1:N── ContentEntry
Project ──1:N── AnalyticsEvent
Project ──1:N── WhatsAppConversation
Project ──N:N── User (via UserProject)
Project ──1:N── Invoice
Project ──1:N── Expense
Project ──1:N── Budget
Project ──1:N── ClientAccess
Project ──1:N── Vendor                  (marketplace)
Project ──1:N── Enquiry                 (marketplace)
Project ──1:N── Listing                 (marketplace)
Project ──1:N── Promotion               (marketplace)
Project ──1:N── Destination             (marketplace)
Project ──1:N── Commission              (marketplace finance)
Project ──1:N── Escrow                  (marketplace finance)
Project ──1:N── Payout                  (marketplace finance)
Project ──1:N── Refund                  (marketplace finance)
Project ──1:N── VendorWallet            (marketplace finance)
Project ──1:N── VendorBankAccount       (marketplace finance)
Project ──1:N── WalletTransaction       (marketplace finance)

Customer ──1:N── Order
Customer ──1:N── Lead
Customer ──1:N── WhatsAppConversation
Customer ──1:N── Invoice
Customer ──1:N── Enquiry                (marketplace)

Order ──1:N── OrderItem
Order ──1:N── OrderTimeline
Order ──1:1── Escrow                    (marketplace)
Order ──1:N── Refund                    (marketplace)
Order ──N:1── Vendor                    (marketplace)

Vendor ──1:N── Listing                  (marketplace)
Vendor ──1:N── Enquiry                  (marketplace)
Vendor ──1:N── Commission               (marketplace finance)
Vendor ──1:N── Escrow                   (marketplace finance)
Vendor ──1:N── Payout                   (marketplace finance)
Vendor ──1:N── Refund                   (marketplace finance)
Vendor ──1:1── VendorWallet             (marketplace finance)
Vendor ──1:N── VendorBankAccount        (marketplace finance)
Vendor ──1:N── WalletTransaction        (marketplace finance)

Product ──1:N── OrderItem
Product ──1:N── StockMovement

Invoice ──1:N── InvoiceItem

User ──1:N── Account (Auth.js)
User ──1:N── Session (Auth.js)

WalletTransaction ──N:1── VendorWallet  (marketplace finance)
```

### 5.2 Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **UUID primary keys** | Avoids sequential ID enumeration; safe for multi-project API exposure |
| **Project scope on every entity** | `projectId` foreign key on all operational tables enables straightforward row-level isolation; querying across projects simply omits the projectId filter |
| **Denormalized OrderItem** | `productName` and `unitPrice` stored at order time so historical invoices remain accurate if product catalog changes |
| **Enum-based statuses** | `OrderStatus`, `LeadStatus`, `OrderSource`, etc. are Prisma enums — type-safe at the database level, no magic strings |
| **Decimal for currency** | `@db.Decimal(10, 2)` for all monetary fields; avoids IEEE 754 floating-point rounding in financial calculations |
| **Nullable stock** | A product with `stock = null` means unlimited inventory (e.g., digital goods, made-to-order jewellery) |
| **Auth.js standard models** | `Account`, `Session`, `VerificationToken` follow Auth.js conventions exactly; no custom modifications that could break adapter compatibility |
| **Marketplace finance models** | Dedicated Prisma models (Commission, Escrow, VendorWallet, Payout, Refund, VendorBankAccount) — not JSON blobs — for proper queryability, referential integrity, and audit trails |
| **Enquiry→Booking conversion** | Creates order with `notes: "enquiry:{id}"` for duplicate-safety; uses existing enquiry JSON `details` fields for checkIn/out/guests |
| **Commission lookup chain** | vendor-specific rate → category-level rate (ordered by `effectiveFrom`) → 12% default fallback |
| **Dashboard type dispatch** | Uses `project.type` enum (not slug comparison) — decouples view logic from project identity |
| **Dual auth** | `authenticate()` tries JWT first, falls back to API key — webhooks remain API-key-only |
| **`requireRole()` for API routes** | Exports `ADMIN_ROLES`, `FINANCE_ROLES` constants for role-gating mutations |

---

## 6. Authentication & Authorization

### 6.1 Identity Providers

| Provider | Status | Config |
|----------|--------|--------|
| **Credentials (dev)** | ✅ Active in all environments | Static check against `AUTH_DEV_EMAIL` / `AUTH_DEV_PASSWORD` env vars |
| **Google OAuth** | 🔴 Configured but non-functional | `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` set on Vercel; JavaScript origins may need updating |

**Credentials guard removed**: The original implementation restricted the credentials provider to `NODE_ENV === "development"`, which prevented login in production. This guard was removed so dev credentials work on the live deployment — a deliberate trade-off for operational pragmatism over strict security, justified by the small team size and the presence of stronger Google OAuth as the intended primary provider.

### 6.2 Session Strategy

- **Type**: JWT (stateless, no database lookups on every request)
- **Storage**: HTTP-only, secure, same-site cookies
- **Expiry**: Configurable via Auth.js (default 30 days)
- **Project context**: Stored in a separate `chiti_project` cookie (read by RSCs to scope queries)

The JWT callback enriches the token with the user's `role` (from the database record). The session callback maps this to `session.user.role` for client-side access.

### 6.3 Access Control

**Route protection** is handled by `src/proxy.ts` (Next.js 16 auth middleware):

```
/api/auth/* → excluded (public)
/login → public (but redirects to /dashboard if already authenticated)
/* → protected (redirects to /login if unauthenticated)
```

All API routes require `auth()` verification. Server actions throw if `session.user` is null. The `UserProject` junction table enables per-project role enforcement via `verifyProjectAccess()` in `src/lib/db/queries.ts`, which checks `SUPER_ADMIN` bypass or `UserProject` membership for the resource's project. This is applied to all mutation server actions (orders, customers, products, leads, finance).

### 6.4 API Security

Chiti Console uses **dual authentication** for API routes:

1. **JWT Bearer Token** (`Authorization: Bearer <jwt>`) — obtained from `POST /api/auth/login` with email/password. Token is HS256-signed with `JWT_SECRET`, 24h expiry, claims: `sub`, `email`, `role`, `projectSlug`.
2. **API Key Fallback** (`x-api-key` header) — each project has a unique API key. Used by tracker scripts and webhook integrations.

The `authenticate()` function in `src/lib/api/auth.ts` tries JWT first, falls back to API key. Webhook routes use `authenticateApiKey()` only. Public routes (`/api/health`, `/api/contact`, `/api/auth/login`) require no auth.

**Role gating**: Finance mutation endpoints use `requireRole(FINANCE_ROLES)` (SUPER_ADMIN, PROJECT_ADMIN, or FINANCE_MANAGER). Server components use `getCurrentUserRole()` + `requireRole()` from `src/lib/db/queries.ts`.

### 6.5 Input Validation

All POST/PUT/PATCH API routes use Zod v4 schemas from `src/lib/api/validation.ts`:

| Schema | Validates |
|--------|-----------|
| `paginationSchema` | `limit` (1–200), `offset` (0+) |
| `productCreateSchema` | `name` (required), `price` (positive number), `stock`, `category`, etc. |
| `orderCreateSchema` | `totalAmount` (positive), `status`/`paymentStatus` (enums), `items` array |
| `orderUpdateSchema` | `status`, `paymentStatus` (optional enums) |
| `leadCreateSchema` | `name` (required), `email` (valid format), `source`/`status` (enums) |
| `customerCreateSchema` | `name` (required), `email` (valid format) |
| `preferencesUpdateSchema` | Key-value boolean pairs |

The `validate()` helper returns a discriminated union — after checking `if (validated.error) return`, TypeScript narrows `validated.data` as fully typed.

---

## 7. Integration Strategy

### 7.1 Integration Matrix

| Project | Current Method | Status | Data Flow |
|---------|---------------|--------|-----------|
| **Bighi Brothers** | Manual entry via Console UI | Active | Orders entered manually; products mirrored in seed |
| **House of Giriraj** | Manual entry via Console UI | Active | Content data seeded for dashboard display |
| **Ts Aromatics** | Manual entry via Console UI | Active | B2B lead data seeded; product catalog imported |
| **Bhatia Master Classes** | Manual entry via Console UI | Active | Course data seeded; JEE/NEET lead pipeline |

### 7.2 Planned Integration Methods

| Method | Details |
|--------|---------|
| **JS Tracker** | Script snippet installed on storefronts to auto-capture page views, add-to-cart, and checkout events |
| **WhatsApp Webhook** | Real-time order creation from incoming WhatsApp messages via Cloud API |
| **GitHub API** | Content sync for projects using Decap CMS (pull product markdown files) |
| **Shared Database** | Direct read connection for projects using the same PostgreSQL instance |
| **REST API** | Full CRUD via project API keys for external systems |

---

## 8. Decisions Log

### 8.1 Design Decisions

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-06 | HSL over HEX for all colour tokens | Programmatic theming; supports dark/light mode inversion by adjusting lightness channel |
| 2026-06 | 8pt grid system | Ensures alignment consistency across data-dense tables and sparse dashboard cards |
| 2026-06 | Glassmorphism as default surface style | Provides visual depth without heavy box-shadows; 1px semi-transparent border + backdrop-blur |
| 2026-06 | Dark mode default, light via `prefers-color-scheme` | Ops tools are used in low-light environments (evening/night shifts); light mode exists for daylight usability |
| 2026-06 | Outfit for display, Inter for body | Outfit's geometric clarity suits large KPI numbers; Inter's readability excels in data tables |
| 2026-06 | Circular gauge for health score | More intuitive at a glance than numeric-only; green/yellow/red zones are universally understood |
| 2026-06 | Recharts over Chart.js | React-native API aligns with component architecture; tree-shakeable; used in existing projects |

### 8.2 Technical Decisions

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-06 | Server Components as default, Client only when needed | Eliminates JS waterfall; 10 parallel DB queries on dashboard execute server-side before any HTML ships |
| 2026-06 | Server Actions for form mutations | Zero JS for basic CRUD; progressive enhancement; simpler than separate API routes for internal operations |
| 2026-06 | PrismaPg adapter + DIRECT_URL env var | PrismaPg enables WASM-based local dev without PostgreSQL installation; but cannot parse `prisma+postgres://` URLs — raw `postgres://` connection string must be provided separately |
| 2026-06 | `startsWith("postgres")` to detect valid connection strings | Both `postgres://` and `postgresql://` are valid schemes; Neon uses the latter; the original `startsWith("postgres://")` check silently fell back to localhost on Vercel |
| 2026-06 | Credentials provider enabled in all environments | Prevents lockout before Google OAuth is fully configured; dev login works on production |
| 2026-06 | Seed data as idempotent bootstrap script | Deletes all existing data then recreates; safe to re-run on any environment; enables reproducible demo deployments |
| 2026-06 | Cookie-based project context (`chiti_project`) | Stateless — no server-side session needed for project scope; readable in RSCs without API calls |
| 2026-06 | UUID primary keys | Prevents ID enumeration attacks; safe for multi-tenant API exposure; no coordination needed between projects |
| 2026-06 | Removed `output: "standalone"` from Next.js config | Conflicted with Vercel's default build output; standalone mode is designed for Docker deployments, not Vercel |
| 2026-06 | WhatsApp message saved locally even if Meta API fails | Ensures outbound messages are never lost due to transient API errors or missing credentials |
| 2026-06 | Webhook uses `phone_number_id` from Meta payload, not cookies | Webhook requests from Meta have no browser cookies; project identified via phone number ID stored in project config |
| 2026-06 | Order-from-Chat navigates to new order form with pre-filled params | Keeps the create flow consistent rather than creating orders inline within the chat UI |
| 2026-06 | All server actions wrapped in try/catch with `console.error` | Prevents raw Prisma errors from reaching the client; provides server-side error logging for debugging |
| 2026-06 | Segment-level loading.tsx added for detail pages | Prevents layout flash on dynamic routes (`projects/[id]`, `orders/[id]`, `customers/[id]`) while data fetches |
| 2026-06 | Client Portal uses separate JWT auth (not Auth.js) | Avoids coupling client-facing auth with internal admin Auth.js; lighter token payload (no DB lookup on every request) |
| 2026-06 | `BaseEntity` pattern for all DB models | `createdAt`/`updatedAt` fields extracted to a shared mixin; every operational entity gets timestamps without repetition |
| 2026-06 | Auth.js `signIn` callback auto-syncs user to Prisma | New users created via OAuth or credentials immediately added to the `User` table with a `USER` role |
| 2026-06 | NL Query uses intent classification over LLM | Lighter, faster, no API dependency; rule-based intent parser routes to existing Prisma queries rather than generating SQL |
| 2026-06 | `QueryBar` as a floating client component | Avoids full-page navigation for NL queries; renders inline results below input without losing dashboard context |
| 2026-06 | Razorpay + Stripe webhook handlers scaffolded upfront | Both payment gateways seeded early for future client onboarding; webhooks most reliable way to sync payment status |
| 2026-06 | Portal cookie replaced base64 with signed JWT (jose HS256) | Plain base64 was tamperable; jose already a transitive dependency via next-auth |
| 2026-06 | CSP includes `object-src 'none'`, HSTS, Permissions-Policy | Blocks plugin-based XSS; enforces HTTPS; disables camera/mic/geo |
| 2026-06 | Webhook validation uses `crypto.timingSafeEqual` | Prevents timing attacks on webhook signature comparison |
| 2026-06 | `verifyProjectAccess` called per-mutation (not middleware) | Explicit per-route authorization; simpler to audit than middleware-based checks |
| 2026-06 | Zod v4 with discriminated union `validate()` helper | After `if (validated.error) return`, TypeScript narrows `validated.data` as defined |
| 2026-06 | Capability-driven engine architecture | Each project has `capabilities` array; engines provide nav items & dashboard sections per capability; sidebar filters by capabilities ∩ role; dependencies enforced (FINANCE→MARKETPLACE→COMMERCE) |
| 2026-06 | Business logic extracted from actions into `src/engines/{engine}/lib/` | Existing API routes/pages stay in place — engines are re-export layers; backward-compatible adapters; avoids massive file moves while centralizing logic |

### 8.3 Product Decisions

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-06 | Seed-first deployment | Deploy with realistic data from day one so every screen is populated; let real operational data accumulate from daily usage |
| 2026-06 | 4 seeded projects from live sites | Bighi Brothers (skincare), House of Giriraj (jewellery), Ts Aromatics (B2B oils), Bhatia Master Classes (EdTech) — diverse types exercise the full data model |
| 2026-06 | Projects nav item expands inline | Keeps sidebar navigation flat without modal dialogs; project sub-items visible at a glance |
| 2026-06 | WhatsApp as first-class operations channel | Most orders originate from chat; the order-creation path starts from a WhatsApp conversation, not an admin form |
| 2026-06 | Console as internal tool first, sellable product second | Build for own operations first; productization (multi-tenant, white-label, billing) deferred to Phase 8 |

---

## 9. Seeded Data Reference

### 9.1 Projects

| Project | Slug | Type | Domain | Integration | Products | Customers | Orders | Leads |
|---------|------|------|--------|-------------|----------|-----------|--------|-------|
| **Bighi Brothers** | `bighi-brothers` | ECOMMERCE | bighibrothers.shop | API | 7 (soaps ₹299, creams ₹499-₹599, lip balm ₹199) | 4 | 4 | 3 |
| **House of Giriraj** | `house-of-giriraj` | ECOMMERCE | house-of-giriraj.vercel.app | WEBHOOK | 5 (jewellery ₹85K-₹3.5L) | 2 | 1 | 1 |
| **Ts Aromatics** | `ts-aromatics` | B2B_CATALOG | tsaromatics.in | API | 7 (carrier oils ₹250-₹650, butters ₹350-₹450) | 4 | 1 | 1 |
| **Booking Jharkhand** | `booking-jharkhand` | MARKETPLACE | booking-jharkhand.vercel.app | MANUAL | 6 (listings: hotel, homestay, cab, tour packages, camping) | 3 | 5 | 3 |

### 9.2 Admin Account

| Field | Value |
|-------|-------|
| Email | `admin@chiti.com` |
| Password | `dev123` |
| Role | SUPER_ADMIN |
| Assigned projects | All 4 (as ADMIN via UserProject) |

### 9.3 Seed Characteristics

- Orders include timeline entries with realistic activity
- WhatsApp conversations have multi-message threads with timestamps
- Content entries include body text specific to each brand's voice
- Lead data includes products enquired about, quantities, and follow-up context
- All product IDs are hardcoded (e.g., `"bb-soap-001"`) for predictable cross-referencing in orders and stock movements

---

## 10. Roadmap & Implementation Status

### Phase Status Overview

| Phase | Name | Status | Key Deliverables |
|-------|------|--------|-----------------|
| **0** | Foundation | ✅ Complete | Next.js scaffold, Prisma, Auth.js, base layout, Vercel deployment |
| **1** | Core | ✅ Complete | Project CRUD, orders, customers, products, leads, dashboard |
| **2** | New Project Flow | ✅ Complete | `/projects/new` form, `createProject` action, project list with "New Project" button |
| **3** | WhatsApp | ✅ Complete | Conversation list, thread UI, order-from-chat flow, webhook handler, send-message resilience — blocked on Meta credentials |
| **4** | Full Analytics | ✅ Complete | Dedicated analytics page with KPI row, monthly revenue chart, source pie chart; empty-data handling |
| **5** | Content Dashboard | 🔴 Not started | Content list view, GitHub sync |
| **6** | System Health | 🔴 Not started | Uptime monitoring, SSL checks, deployment log |
| **7** | Google OAuth Fix | 🟡 In progress | Configured but non-functional; JavaScript origins may need updating |
| **8** | Error Resilience & UX | ✅ Complete | All 8 server actions wrapped in try/catch; empty states on every page; 3 segment-level loading.tsx files; initials null-safety; global error.tsx and not-found.tsx |
| **9** | Productization | 🔴 Future | Multi-tenant, white-label, billing, client onboarding |
| **10** | **Financial Module** | ✅ Complete | `/finance` with dashboard KPIs, expenses, budgets, invoices; ProfitLossChart |
| **11** | **Client Portal** | ✅ Complete | JWT-based portal login, order/invoice viewing, permission scopes via ClientAccess |
| **12** | **Pricing & Billing** | ✅ Complete | `/pricing` plan cards, `/billing` with usage metrics, Stripe/Razorpay webhook scaffold |
| **13** | **AI NL Query** | ✅ Complete | `QueryBar` on dashboard; intent classification routes questions to orders/finance/customers data |
| **14** | **Auth & Cleanup** | ✅ Complete | Login/Register pages, `redirectIfAuthenticated`, removed mock APIs, consolidated server action pattern |
| **15** | Full AI Assistant | 🔴 Future | LLM-powered chat, context-aware suggestions, multi-step workflows |
| **16** | **Visual Refresh** | ✅ Complete | Glassmorphism cards, Framer Motion primitives, brand glow effects |
| **17** | **Security Hardening** | ✅ Complete | Signed portal JWT, CSP + HSTS, timing-safe webhook, authz checks, Zod validation |
| **18** | **Marketplace Finance** | ✅ Complete | Commission, Escrow, VendorWallet, Payout, Refund models + API routes + finance pages |
| **19** | **BJ Console Pages** | ✅ Complete | Vendors, Listings, Enquiries pages + Booking detail + Enquiry→Booking conversion |
| **20** | **Project Operating Models** | ✅ Complete | Type-based dashboard dispatch (MARKETPLACE/ECOMMERCE/B2B/SAAS/CONTENT) |
| **21** | **RBAC** | ✅ Complete | FINANCE_MANAGER/VENDOR_USER roles, sidebar filtering, project scoping, API role gating |
| **22** | **Escrow Release Workflow** | 🔴 Future | Button to release HELD escrow after service completion |
| **23** | **Invoice Automation** | 🔴 Future | Auto-generate GST invoice on booking conversion |
| **24** | **Vendor Portal** | 🔴 Future | Vendor login, own bookings, listings, wallet view |
| **25** | **Automation Engine** | 🔴 Future | Workflow triggers for booking/payment/checkout/payout/refund |

### Next Up

1. Set `DIRECT_URL` env var on Vercel for database pages to work
2. Fix Google OAuth (add authorized JavaScript origins in Google Cloud Console)
3. Enable WhatsApp integration (register Meta developer account, configure webhook, add 3 env vars to Vercel)
4. Implement content dashboard UI
5. Set up PostHog for product analytics
6. Add more NL Query intents (content, system health, WhatsApp data)

---

## 11. Appendices

### A. Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | Prisma connection string (production: Neon; dev: Prisma Postgres) |
| `DIRECT_URL` | Yes | Raw PostgreSQL URL for PrismaPg adapter (required; `prisma+postgres://` won't work) |
| `AUTH_SECRET` | Yes | Auth.js encryption key (`npx auth secret` to generate) |
| `AUTH_GOOGLE_ID` | Yes* | Google OAuth client ID (`*` replaced by dev credentials) |
| `AUTH_GOOGLE_SECRET` | Yes* | Google OAuth client secret |
| `AUTH_DEV_EMAIL` | No | Dev login email (default: `admin@chiti.com`) |
| `AUTH_DEV_PASSWORD` | No | Dev login password (default: `dev123`) |
| `NEXT_PUBLIC_CONSOLE_URL` | Yes | Deployment URL for callbacks |
| `OPENAI_API_KEY` | For AI | GPT-based NL query on dashboard |
| `WHATSAPP_*` | No | WhatsApp Cloud API credentials (optional; not configured) |
| `RAZORPAY_*` | No | Razorpay webhook secret (optional) |
| `STRIPE_*` | No | Stripe webhook secret (optional) |

### B. Ethical Protocol

In alignment with Chiti Technologies standards:

- No dark patterns: no fake countdowns, forced subscriptions, hidden cancellation flows, or manipulative scarcity
- Data transparency: customers can request export or deletion of their data
- AI transparency: any conversational interface will clearly identify itself as AI

### C. Quick Reference

| Resource | Location |
|----------|----------|
| **Live URL** | https://chiti-console.vercel.app |
| **GitHub** | https://github.com/prabhakarmdes12-cmyk/Chiti-Console |
| **Design System** | `C:\Users\User\Documents\Projects\chiti_technologies_Design_System_v3` |
| **Project Docs** | `docs/` (01-PRD through 10-AGENCY-STRATEGY) |
| **Schema** | `prisma/schema.prisma` |
| **Seed Data** | `prisma/seed.ts` |
| **Auth Config** | `src/lib/auth/auth.ts` |
| **Portal Auth** | `src/lib/auth/portal.ts` |
| **API Validation** | `src/lib/api/validation.ts` |
| **Prisma Client** | `src/lib/db/prisma.ts` |
| **DB Queries** | `src/lib/db/queries.ts` |
| **Marketplace Actions** | `src/lib/actions/marketplace.ts` |
| **Vendor Actions** | `src/lib/actions/vendors.ts` |
| **API Auth** | `src/lib/api/auth.ts` |
| **UI Components** | `src/components/ui/` |
| **Motion Primitives** | `src/components/motion/` |
| **Chart Components** | `src/components/charts/` |
| **Finance Components** | `src/components/finance/` |
| **AI Components** | `src/components/ai/` |
| **Server Actions** | `src/lib/actions/` |
| **AI Actions** | `src/lib/ai/` |
| **Webhook Handlers** | `src/lib/integrations/` |
| **CORS Proxy** | `src/proxy.ts` |
| **Styles** | `src/app/globals.css` |
| **Portal Pages** | `src/app/portal/` |
| **Pricing Pages** | `src/app/pricing/` |
| **Security Headers** | `next.config.ts` |
| **Env Validation** | `src/lib/env.ts` |
| **Sidebar** | `src/components/ui/Sidebar.tsx` |
| **AppShell** | `src/components/layout/AppShell.tsx` |

---

**Chiti Technologies © 2026**

*This journal documents the current state, design rationale, and technical decisions of the Chiti Console. Update this document with every significant feature addition, architectural change, or design decision.*
