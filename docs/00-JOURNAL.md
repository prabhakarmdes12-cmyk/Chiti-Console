# Chiti Console — System Journal & Decision Log

> **Version:** 1.0.0  
> **Codename:** Founder OS  
> **Last Updated:** June 2026  
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
| `Sidebar` | `Sidebar.tsx` | Client | Expandable navigation with project list |
| `TopNav` | `TopNav.tsx` | Client | Header bar with project selector + user menu |
| `MonthlyRevenueChart` | `charts/MonthlyRevenueChart.tsx` | Client | Recharts area chart (6-month) |
| `DeleteButton` | (form-level) | Client | Confirmation dialog for destructive actions |
| `ActionForm` | (form-level) | Server | Reusable form action wrapper |

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

Customer ──1:N── Order
Customer ──1:N── Lead
Customer ──1:N── WhatsAppConversation

Order ──1:N── OrderItem
Order ──1:N── OrderTimeline

Product ──1:N── OrderItem
Product ──1:N── StockMovement

User ──1:N── Account (Auth.js)
User ──1:N── Session (Auth.js)
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

All API routes require `auth()` verification. Server actions throw if `session.user` is null. The `UserProject` junction table enables per-project role enforcement (not yet fully implemented in queries — all queries currently operate at the Super Admin level).

### 6.4 API Security

API endpoints use the same JWT session for browser-based requests. Programmatic access (planned) will use project-level API keys validated via `Bearer` token header.

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
| **Bhatia Master Classes** | `bhatia-master-classes` | SAAS | bhatiamasterclasses.com | MANUAL | 6 (courses ₹299-₹4,999) | 3 | 3 | 2 |

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
| **3** | WhatsApp | 🔴 Not started | Unified inbox, auto-create order from message, templates |
| **4** | Full Analytics | 🟡 Partial | Monthly revenue chart exists; no dedicated analytics page |
| **5** | Content Dashboard | 🔴 Not started | Content list view, GitHub sync |
| **6** | System Health | 🔴 Not started | Uptime monitoring, SSL checks, deployment log |
| **7** | Google OAuth Fix | 🟡 In progress | Configured but non-functional; JavaScript origins may need updating |
| **8** | Productization | 🔴 Future | Multi-tenant, white-label, billing, client onboarding |

### Next Up

1. Fix Google OAuth (add authorized JavaScript origins in Google Cloud Console)
2. Enable WhatsApp integration (register Meta developer account, configure webhook)
3. Build dedicated analytics page with cross-project drilldown and date range filtering
4. Implement content dashboard UI

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
| `WHATSAPP_*` | No | WhatsApp Cloud API credentials (optional; not configured) |

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
| **Prisma Client** | `src/lib/db/prisma.ts` |
| **DB Queries** | `src/lib/db/queries.ts` |
| **UI Components** | `src/components/ui/` |
| **Server Actions** | `src/lib/actions/` |
| **Styles** | `src/app/globals.css` |

---

**Chiti Technologies © 2026**

*This journal documents the current state, design rationale, and technical decisions of the Chiti Console. Update this document with every significant feature addition, architectural change, or design decision.*
