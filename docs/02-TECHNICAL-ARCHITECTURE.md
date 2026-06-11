# Chiti Console — Technical Architecture

**Version:** 1.0  
**Status:** Draft  

---

## 1. System Topology

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CHITI CONSOLE                                │
│                                                                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐   │
│  │ Next.js 16 │  │  Prisma    │  │ Auth.js    │  │ PostHog    │   │
│  │  Frontend  │  │  ORM       │  │ v5 (OAuth) │  │ (Self-host)│   │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘   │
│        │               │               │               │          │
│  ┌─────┴───────────────┴───────────────┴───────────────┴──────┐   │
│  │                 API Gateway (Next.js API Routes)            │   │
│  │  - REST endpoints for CRUD operations                      │   │
│  │  - Webhook receivers (WhatsApp, GitHub, Stripe)            │   │
│  │  - Server Actions for form submissions                     │   │
│  └──────────────────────────┬─────────────────────────────────┘   │
│                             │                                      │
│  ┌──────────────────────────┴─────────────────────────────────┐   │
│  │                    Storage Layer                            │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐   │   │
│  │  │ PostgreSQL │  │   Redis    │  │  S3-compatible     │   │   │
│  │  │ (primary)  │  │  (queues)  │  │  (files, images)   │   │   │
│  │  └────────────┘  └────────────┘  └────────────────────┘   │   │
│  └───────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
           │              │              │               │
           ▼              ▼              ▼               ▼
  ┌──────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
  │ Bighi        │ │ TS Arom.   │ │ House of   │ │ AuraPanch. │
  │ Brothers     │ │            │ │ Giriraj    │ │            │
  └──────────────┘ └────────────┘ └────────────┘ └────────────┘
  (Tracker +      (Shared DB +   (GitHub API +  (API Key +
   Manual Entry)   Tracker)       Tracker)       Webhooks)
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
| **Database** | PostgreSQL (Vercel Postgres or Supabase) | Relational, well-supported |
| **Auth** | Auth.js v5 (NextAuth) | OAuth-ready, JWT sessions |
| **Analytics** | Self-hosted PostHog | Open-source, no per-user pricing |
| **Charts** | Recharts | React-native, used in NetQ Command |
| **Animations** | Framer Motion | Per Chiti motion standards |
| **Icons** | Lucide React | Consistent with existing projects |
| **Forms** | React Hook Form + Zod | Used in TS Aromatics |
| **HTTP Client** | native `fetch` | Built-in, no extra dependency |
| **Queue** | Redis + Bull (future) | For WhatsApp + order processing at scale |
| **Deployment** | Vercel | Already in use across all projects |

---

## 3. Data Flow

### 3.1 Order Ingest Flow

```
Customer → WhatsApp Message
  → WhatsApp Cloud API Webhook
    → Console Webhook Receiver
      → Order Draft Created (status: "pending")
        → Notification to Super Admin
          → Admin reviews/confirms → status: "confirmed"
            → Customer notified via WhatsApp
              → Fulfillment → status: "shipped"
```

### 3.2 Analytics Flow

```
Visitor → Storefront page load
  → Chiti Tracker script (JS snippet)
    → POST /api/events (to Console)
      → Console processes + stores event
        → PostHog captures for dashboard
          → Real-time dashboard updates
```

### 3.3 Cross-Project Auth Flow

```
User → Console Login
  → Auth.js OAuth (Google/GitHub)
    → JWT issued with role + project scopes
      → Every API request validated against project permissions
```

---

## 4. Security Boundaries

- **Projects are isolated** — Project Admin can see ONLY their project's data
- **API keys** — Each project gets a unique write-only API key for the tracker
- **Webhooks** — Verified via HMAC signatures
- **Sessions** — HTTP-only cookies + JWT refresh tokens
- **Rate limiting** — Per-project, per-endpoint (100 req/min for reads, 10 req/min for mutations)
