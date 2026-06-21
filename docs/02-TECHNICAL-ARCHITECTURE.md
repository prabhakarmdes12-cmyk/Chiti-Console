# Chiti Console — Technical Architecture

**Version:** 1.1  
**Status:** Updated — June 2026  

---

## 1. System Topology

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              CHITI CONSOLE                                       │
│                                                                                   │
│  ┌────────────┐  ┌────────────┐  ┌──────────────┐  ┌──────────┐  ┌───────────┐ │
│  │ Next.js 16 │  │  Prisma    │  │  Auth.js v5  │  │  JWT     │  │  PostHog  │ │
│  │  Frontend  │  │  ORM       │  │  (OAuth +    │  │  (jose)  │  │  (Self-   │ │
│  └─────┬──────┘  └─────┬──────┘  │   Creds)     │  │  HS256   │  │   host)   │ │
│        │               │         └──────┬───────┘  └────┬─────┘  └─────┬─────┘ │
│        │               │                │               │              │       │
│  ┌─────┴───────────────┴────────────────┴───────────────┴──────────────┴──┐   │
│  │                    API Layer (Next.js API Routes)                        │   │
│  │  - REST endpoints (orders, customers, products, leads, etc.)            │   │
│  │  - Marketplace endpoints (vendors, listings, enquiries)                 │   │
│  │  - Finance endpoints (payouts, refunds, escrow, wallets)                │   │
│  │  - Auth endpoints (login JWT, register)                                 │   │
│  │  - Webhook receivers (WhatsApp, Stripe, Razorpay, GitHub)               │   │
│  │  - Server Actions (vendor status, bank accounts, enquiry→booking)       │   │
│  └──────────────────────────┬───────────────────────────────────────────────┘   │
│                             │                                                    │
│  ┌──────────────────────────┴───────────────────────────────────────────────┐   │
│  │                         Proxy Layer (src/proxy.ts)                        │   │
│  │  - CORS headers on all /api/* responses                                  │   │
│  │  - Bypasses auth check (API routes handle their own auth)                │   │
│  │  - Public file serving (manifest, favicon, static assets)                │   │
│  └──────────────────────────┬───────────────────────────────────────────────┘   │
│                             │                                                    │
│  ┌──────────────────────────┴───────────────────────────────────────────────┐   │
│  │                    Storage Layer                                          │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐                 │   │
│  │  │ PostgreSQL │  │   Redis    │  │  S3-compatible     │                 │   │
│  │  │ (Neon)     │  │  (future)  │  │  (files, images)   │                 │   │
│  │  └────────────┘  └────────────┘  └────────────────────┘                 │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
           │              │              │               │               │
           ▼              ▼              ▼               ▼               ▼
  ┌──────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────────┐
  │ Bighi        │ │ TS Arom.   │ │ House of   │ │ Booking    │ │ AuraPanch.   │
  │ Brothers     │ │            │ │ Giriraj    │ │ Jharkhand  │ │              │
  └──────────────┘ └────────────┘ └────────────┘ └────────────┘ └──────────────┘
  (Tracker +      (Shared DB +   (GitHub API +  (Marketplace  (API Key +
   Manual Entry)   Tracker)       Tracker)       full-stack)   Webhooks)
```

---

## 2. Stack Decisions

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Framework** | Next.js 16 (App Router) | Aligns with Bighi Brothers, TS Aromatics; latest stable |
| **Language** | TypeScript 5 | Type safety across all layers |
| **CSS** | Tailwind CSS v4 + CSS variables from `tokens.json` | Chiti design system compatibility |
| **UI Components** | Custom (`@chiti/ui` pattern) | Reusable console-specific components |
| **Fonts** | Outfit (display), Inter (body), JetBrains Mono (code) | Per Chiti UDS v3 |
| **State (client)** | Zustand | Already used in Bighi Brothers |
| **State (server)** | React Server Components + Server Actions | Next.js best practices |
| **Database ORM** | Prisma 7 | Already used in TS Aromatics v3 |
| **Database** | PostgreSQL (Neon Serverless) | Relational, well-supported, serverless |
| **Auth (Browser)** | Auth.js v5 (NextAuth) | OAuth-ready, JWT sessions, Credentials provider |
| **Auth (API)** | JWT via jose (HS256) | Stateless Bearer token, 24h expiry |
| **Analytics** | Self-hosted PostHog | Open-source, no per-user pricing |
| **Charts** | Recharts | React-native, used in NetQ Command |
| **Animations** | Framer Motion | Per Chiti motion standards |
| **Icons** | Lucide React | Consistent with existing projects |
| **Forms** | React Hook Form + Zod | Used in TS Aromatics |
| **HTTP Client** | native `fetch` | Built-in, no extra dependency |
| **Queue** | Redis + Bull (future) | For WhatsApp + order processing at scale |
| **Deployment** | Vercel (webpack for API builds) | Turbopack doesn't compile API routes |

---

## 3. Data Flow

### 3.1 Auth Flow (Dual System)

```
Browser Session:
  User → Console Login
    → Auth.js OAuth (Google) or Credentials (dev)
      → Auth.js JWT in HTTP-only cookie
        → Middleware validates → session.user available

API Client (e.g. Booking Jharkhand):
  User → POST /api/auth/login { email, password }
    → Returns HS256 JWT { sub, email, role, projectSlug }
      → Frontend stores in localStorage
        → Every fetch() sends Authorization: Bearer <jwt>
          → authenticate() decodes + verifies with jose
```

### 3.2 Marketplace Order Flow

```
Customer → Enquiry (WhatsApp/Website/Phone)
  → Enquiry created in Console
    → Admin reviews → "Convert to Booking"
      → Server Action: convertEnquiryToBooking()
        → Creates: Order (CONFIRMED) + Escrow (HELD)
          → VendorWallet pendingBalance += netToVendor
            → Payout (PENDING) created
              → Escrow auto-release at checkOut + 2 days
                → Payout marked ready → Finance Manager processes
```

### 3.3 Analytics Flow

```
Visitor → Storefront page load
  → Chiti Tracker script (JS snippet)
    → POST /api/track (to Console)
      → Console processes + stores event
        → PostHog captures for dashboard
          → Real-time dashboard updates
```

### 3.4 Cross-Project Auth Flow

```
User → Console Login
  → Auth.js OAuth (Google/GitHub) or Credentials
    → JWT issued with role + project scopes
      → Every API request validated against project permissions
        → Non-SUPER_ADMIN limited to accessible projects only
```

---

## 4. Platform Operating Models

Dashboard dispatch uses `project.type` enum, not slug-based detection:

| Type | Dashboard View | Key Metrics |
|------|---------------|-------------|
| `MARKETPLACE` | CEO Command Center | Revenue, GBV, commissions, escrow, vendor health, funnel, money by category |
| `ECOMMERCE` | Ecommerce Ops | AOV, active/OOS products, repeat buyer rate, paid orders, top products |
| `B2B_CATALOG` | B2B Pipeline | Leads, products, won deals, conversion rate, pipeline stages |
| `SAAS` | EdTech Ops | Enrollments, active students, batches, new leads, churn rate |
| `CONTENT` | Content Dashboard | Entries, published/draft, views, subscribers |
| `CUSTOM` / null | Generic Stats | Revenue, orders today, customers, conversion |

---

## 5. Marketplace Finance Architecture

```
Order (PAID)
  │
  ├── Commission (platform cut %)
  ├── Platform Fee (fixed)
  ├── GST (on commission)
  └── Net to Vendor (total - commission - fees - GST)
       │
       ▼
  Escrow (HELD until release)
       │
       ▼
  VendorWallet (pendingBalance → balance on release)
       │
       ▼
  Payout (PENDING → PROCESSING → COMPLETED)
       │
       ▼
  Bank Transfer / UPI to VendorBankAccount
```

---

## 6. RBAC Architecture

### Role Hierarchy (ordered by access level)

```
SUPER_ADMIN
PROJECT_ADMIN
FINANCE_MANAGER
SUPPORT_AGENT
CONTENT_EDITOR
VENDOR_USER
CLIENT_VIEWER
```

### Role Enforcement Points

| Layer | Mechanism | Location |
|-------|-----------|----------|
| **Server Components** | `getCurrentUser()` + `requireRole()` | `src/lib/db/queries.ts` |
| **API Routes** | `authenticate()` + `requireRole()` | `src/lib/api/auth.ts` |
| **Sidebar** | `rolePermissions` map | `src/components/ui/Sidebar.tsx` |
| **Project Scoping** | `getAccessibleProjects()` | `src/app/(app)/layout.tsx` |
| **Layout** | `userRole` prop → AppShell → Sidebar | `src/components/layout/AppShell.tsx` |

---

## 7. Project Structure

```
src/
├── app/
│   ├── (app)/                    # Authenticated app routes
│   │   ├── dashboard/            # Operating model dispatch
│   │   ├── orders/[id]/          # Booking detail (tourism view)
│   │   ├── vendors/[id]/         # Vendor detail (KYC, bank, wallet)
│   │   ├── enquiries/            # Enquiry pipeline + convert
│   │   ├── listings/             # Listing grid
│   │   └── finance/              # Escrow, wallets, payouts, refunds, commissions
│   └── api/                      # All API routes
├── components/
│   ├── ui/                       # ChitiCard, ChitiButton, Sidebar, etc.
│   └── layout/                   # AppShell
└── lib/
    ├── api/auth.ts               # authenticate(), requireRole(), constants
    ├── db/queries.ts             # RBAC helpers, project scoping
    ├── actions/                  # Server Actions (vendors, marketplace)
    └── integrations/             # Webhook handlers
```

---

## 8. Security Boundaries

- **Projects are isolated** — Project Admin can see ONLY their project's data
- **Project membership scoping** — Non-SUPER_ADMIN users scoped to their `UserProject` records
- **API keys** — Each project gets a unique API key for tracker + integrations
- **JWT required at startup** — `JWT_SECRET` env var must be set, no fallback
- **CORS restricted** — Explicit origin allow-list via Set
- **Webhooks** — Verified via HMAC signatures or provider SDK
- **Sessions** — HTTP-only cookies + JWT refresh tokens
- **Rate limiting** — Per-project, per-endpoint (100 req/min for reads, 10 req/min for mutations)
- **Cross-project FK injection** — Prevented via `verifyProjectAccess()` on all data mutations
