# Chiti Console

**Unified operations dashboard for Chiti Technologies projects.**

Single-pane-of-glass for orders, customers, products, leads, analytics, content, and WhatsApp across all projects.

Currently running for **Bighi Brothers** — incense, cones, oils, and puja supplies e-commerce.

---

## Stack

| Layer | Choice |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS v4 + Chiti Design System v3 tokens |
| **Database** | PostgreSQL + Prisma ORM 7.x |
| **Auth** | Auth.js v5 (Google OAuth + Dev Credentials) |
| **Charts** | Recharts |
| **Animations** | Framer Motion (spring physics, glassmorphism) |
| **Icons** | Lucide React |
| **Validation** | Zod 4 |
| **Payment** | Razorpay + Stripe webhooks |
| **Portal Auth** | jose (signed JWTs) |

---

## Getting Started

### Prerequisites

- Node.js 22+
- npm

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local — at minimum set DATABASE_URL

# 3. Generate Prisma client
npx prisma generate

# 4. Start the database (Prisma Postgres WASM)
npx prisma dev

# 5. Push schema and seed data (in another terminal)
npx prisma db push
npm run db:seed

# 6. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Dev login

Sign in with:
- **Email:** `admin@chiti.com`
- **Password:** `dev123`

### Google OAuth

For Google sign-in to work, add your email as a test user in the [Google Cloud Console](https://console.cloud.google.com) OAuth consent screen.

### Client Portal

Clients log in at `/portal/login` using email + access code (stored in `ClientAccess` table). Portal uses signed JWT cookies via `jose`.

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx               # Root layout (fonts, dark theme)
│   ├── page.tsx                 # Root — redirects to /dashboard or /login
│   ├── error.tsx                # Root error boundary
│   ├── global-error.tsx         # Global error boundary
│   ├── loading.tsx              # Root loading skeleton
│   ├── proxy.ts                 # Auth guard proxy (Next.js 16)
│   ├── (app)/                   # Authenticated routes
│   │   ├── layout.tsx           # App layout (Sidebar + TopNav + ToastProvider)
│   │   ├── error.tsx            # Error boundary for all app pages
│   │   ├── loading.tsx          # Loading skeleton for all app pages
│   │   ├── not-found.tsx        # 404 for all app pages
│   │   ├── dashboard/           # Revenue, orders, KPIs, AI QueryBar
│   │   ├── orders/              # List, detail, new order
│   │   ├── customers/           # List, detail
│   │   ├── products/            # List, detail, stock adjust
│   │   ├── leads/               # Kanban board, detail
│   │   ├── analytics/           # Recharts charts
│   │   ├── finance/             # Dashboard, expenses, budgets, invoices
│   │   ├── whatsapp/            # Conversation list
│   │   ├── content/             # Content entries
│   │   ├── projects/            # Multi-project management
│   │   ├── system/              # Project settings
│   │   └── settings/            # User preferences
│   ├── portal/                  # Client portal (separate auth)
│   │   ├── layout.tsx
│   │   ├── login/               # Email + access code login
│   │   ├── dashboard/           # Order/invoice overview
│   │   ├── orders/              # Order list
│   │   └── invoices/            # Invoice list
│   ├── pricing/                 # Plan cards (Starter/Growth/Enterprise)
│   ├── login/                   # Admin sign-in
│   ├── api/auth/[...nextauth]/  # Auth.js API route
│   ├── api/webhook/             # Razorpay, Stripe, WhatsApp, Order
│   ├── api/orders/              # REST CRUD
│   ├── api/products/            # REST CRUD
│   ├── api/customers/           # REST CRUD
│   ├── api/leads/               # REST CRUD
│   ├── api/export/              # CSV export
│   ├── api/health/              # Health check
│   └── api/settings/            # Preferences
├── components/
│   ├── motion/                  # Framer Motion primitives
│   │   ├── FadeIn.tsx
│   │   ├── SlideUp.tsx
│   │   ├── Stagger.tsx
│   │   ├── NumberTicker.tsx
│   │   └── GlowCard.tsx
│   ├── ui/                      # Chiti design system components
│   │   ├── ChitiCard.tsx        # Glassmorphism card
│   │   ├── ChitiButton.tsx      # Motion-enhanced button
│   │   ├── ChitiPageHeader.tsx
│   │   ├── ChitiStatusBadge.tsx
│   │   ├── Sidebar.tsx          # Expandable nav with glow
│   │   ├── TopNav.tsx           # Glass header
│   │   ├── EmptyState.tsx
│   │   └── ErrorBoundary.tsx
│   ├── charts/                  # Recharts wrappers
│   │   ├── MonthlyRevenueChart.tsx
│   │   ├── ProfitLossChart.tsx
│   │   └── SourcePieChart.tsx
│   ├── ai/                      # AI NL query
│   │   └── QueryBar.tsx
│   └── finance/                 # Finance components
│       └── AddExpenseForm.tsx
├── lib/
│   ├── auth/                    # Auth.js + portal auth
│   │   ├── auth.ts
│   │   ├── portal.ts            # jose signed JWT
│   │   └── index.ts
│   ├── db/
│   │   ├── prisma.ts            # Prisma client (DIRECT_URL fallback)
│   │   └── queries.ts           # getProject, projectFilter, verifyProjectAccess
│   ├── actions/                 # Server actions
│   │   ├── orders.ts
│   │   ├── customers.ts
│   │   ├── products.ts
│   │   ├── leads.ts
│   │   ├── finance.ts
│   │   ├── projects.ts
│   │   └── settings.ts
│   ├── api/                     # API utilities
│   │   ├── auth.ts              # authenticateApiKey + rate limit
│   │   ├── rate-limit.ts
│   │   └── validation.ts        # Zod schemas
│   ├── ai/                      # AI actions
│   │   ├── nl-query.ts
│   │   ├── query-data.ts
│   │   └── draft-followup.ts
│   ├── integrations/            # Webhook handlers
│   │   └── payments.ts
│   └── env.ts                   # Env validation
├── types/
│   └── next-auth.d.ts
prisma/
├── schema.prisma                # 17 models, 13 enums
└── seed.ts                      # 4 projects demo data
docs/                            # Project documentation
PROJECT_JOURNAL.md               # Session log
```

---

## Pages

| Route | Description | Features |
|---|---|---|---|
| `/dashboard` | Overview — revenue, orders, customers, conversion rate | ✅ Live |
| `/orders` | Order list + create, status advance, delete | ✅ Live |
| `/orders/[id]` | Order detail — items, timeline, status actions, delete | ✅ Live |
| `/customers` | Customer grid + create, delete | ✅ Live |
| `/customers/[id]` | Customer detail — stats, edit form, recent orders | ✅ Live |
| `/products` | Product table + create, delete | ✅ Live |
| `/products/[id]` | Product detail — stock adjust, edit, movements | ✅ Live |
| `/leads` | Kanban board + create, status shortcuts, delete | ✅ Live |
| `/leads/[id]` | Lead detail — status update, contact info, message | ✅ Live |
| `/analytics` | Metrics — revenue, orders, AOV, source distribution | ✅ Live |
| `/whatsapp` | Conversation list — contact, preview, unread count | ✅ Live |
| `/content` | Content entries — title, type, status, updated | ✅ Live |
| `/system` | Project info — name, type, domain, config | ✅ Live |
| `/settings` | Profile, preferences, toggles (non-functional) | ⚠️ Static |
| `/finance` | Revenue/expense KPIs, budgets, invoices | ✅ Live |
| `/projects` | Multi-project list, health scores, per-project drilldown | ✅ Live |
| `/pricing` | Plan cards (Starter/Growth/Enterprise) | ✅ Live |
| `/portal/dashboard` | Client portal — order/invoice overview | ✅ Live |
| `/portal/orders` | Client portal — order list | ✅ Live |
| `/portal/invoices` | Client portal — invoice list | ✅ Live |

---

## Environment Variables

See `.env.example` for the full list with comments. Key variables:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Prisma connection string |
| `DIRECT_URL` | Yes | Raw PostgreSQL URL for PrismaPg adapter |
| `AUTH_SECRET` | Yes | Auth.js secret (run `npx auth secret`) |
| `AUTH_GOOGLE_ID` | For Google auth | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | For Google auth | Google OAuth client secret |
| `AUTH_DEV_EMAIL` | Dev only | Dev credentials email |
| `AUTH_DEV_PASSWORD` | Dev only | Dev credentials password |
| `NEXT_PUBLIC_CONSOLE_URL` | Yes | Deployment URL for callbacks |
| `OPENAI_API_KEY` | For AI queries | GPT-based NL query |
| `WHATSAPP_*` | No | WhatsApp Cloud API (not configured) |

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js dev server (port 3000) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript check |
| `npm run db:seed` | Run seed script |
| `npx prisma dev` | Start Prisma Postgres database |
| `npx prisma db push` | Push schema to database |
| `npx prisma generate` | Regenerate Prisma client |

---

## Current Status

All phases complete. See `PROJECT_JOURNAL.md` for the full session log.

**What works:**
- Browse all data (orders, customers, products, leads, etc.)
- Create, edit, delete orders / products / customers / leads
- Detail pages with stock adjustments, status updates, timeline
- Recharts (AreaChart, PieChart) on Analytics page
- Financial dashboard (revenue, expenses, budgets, invoices)
- Multi-project management with health scoring
- Client portal (separate JWT auth)
- Pricing & billing pages
- AI NL query on dashboard
- Google OAuth + dev credentials login
- Auth guard middleware (Next.js 16 proxy)
- REST API (14+ routes) with API key authentication + rate limiting
- Webhook receivers (Razorpay, Stripe, WhatsApp, Order sync)
- CSV export for orders, products, customers
- Glassmorphism UI with Framer Motion animations
- Zod input validation on all API routes
- Authorization checks on all server actions (verifyProjectAccess)
- Signed portal JWTs (jose HS256)
- CSP, HSTS, Permissions-Policy security headers
- Timing-safe webhook signature comparison
- Standalone build ready for Docker deployment
- GitHub Actions CI pipeline

**Known limitations:**
- No search, filters, or pagination on any list
- Prisma Postgres (WASM) data is ephemeral — lost on restart, must re-seed
- Google OAuth requires test user setup in Google Cloud Console
- WhatsApp, Content, System pages are still read-only / static
- Rate limiter is in-memory (not Redis) — resets on server restart
- `DIRECT_URL` must be set on Vercel env vars for database pages to work
- Build fails locally if Google Fonts are unreachable (font-src CSP)

---

## Deployment

```bash
# Build standalone output
npm run build

# The .next/standalone/ directory contains everything needed to run
# Copy it to your server along with public/ and .env.local

# Requires a production PostgreSQL database (Neon, Railway, Supabase, etc.)
```

Built by **Chiti Technologies** © 2026
