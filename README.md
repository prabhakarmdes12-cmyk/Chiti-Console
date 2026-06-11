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
| **Animations** | Framer Motion |
| **Icons** | Lucide React |

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

In development mode, sign in with:
- **Email:** `admin@chiti.com`
- **Password:** `dev123`

### Google OAuth

For Google sign-in to work, add your email as a test user in the [Google Cloud Console](https://console.cloud.google.com) OAuth consent screen.

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx               # Root layout (fonts, dark theme)
│   ├── page.tsx                 # Root — redirects to /dashboard or /login
│   ├── proxy.ts                 # Auth guard proxy (Next.js 16)
│   ├── (app)/                   # Authenticated routes
│   │   ├── layout.tsx           # App layout (Sidebar + TopNav + ToastProvider)
│   │   ├── error.tsx            # Error boundary for all app pages
│   │   ├── loading.tsx          # Loading skeleton for all app pages
│   │   ├── not-found.tsx        # 404 for all app pages
│   │   ├── dashboard/page.tsx
│   │   ├── orders/
│   │   │   ├── page.tsx         # Order list with create/delete/status advance
│   │   │   └── [id]/page.tsx    # Order detail + timeline + status actions
│   │   ├── customers/
│   │   │   ├── page.tsx         # Customer grid with create/delete
│   │   │   └── [id]/page.tsx    # Customer detail + edit + recent orders
│   │   ├── products/
│   │   │   ├── page.tsx         # Product table with create/delete
│   │   │   └── [id]/page.tsx    # Product detail + stock adjust + edit
│   │   ├── leads/
│   │   │   ├── page.tsx         # Kanban board with create/delete/status
│   │   │   └── [id]/page.tsx    # Lead detail + status update
│   │   ├── analytics/page.tsx
│   │   ├── whatsapp/page.tsx
│   │   ├── content/page.tsx
│   │   ├── system/page.tsx
│   │   └── settings/page.tsx
│   ├── login/
│   │   ├── layout.tsx
│   │   ├── page.tsx             # Sign-in page (Google + Dev credentials)
│   │   └── error.tsx            # Login error boundary
│   └── api/auth/[...nextauth]/  # Auth.js API route
├── components/
│   └── ui/                      # Chiti design system components
│       ├── ChitiCard.tsx
│       ├── ChitiButton.tsx
│       ├── ChitiInput.tsx
│       ├── ChitiBadge.tsx
│       ├── ChitiTable.tsx
│       ├── ChitiStatCard.tsx
│       ├── ChitiPageHeader.tsx
│       ├── ChitiStatusBadge.tsx
│       ├── Sidebar.tsx
│       └── TopNav.tsx
├── lib/
│   ├── auth/auth.ts             # Auth.js configuration
│   └── db/
│       ├── prisma.ts            # Prisma client singleton
│       └── queries.ts           # Shared helpers (getProject, getProjectId)
└── types/
    └── next-auth.d.ts           # Auth type augmentation
prisma/
├── schema.prisma                # 17 models, 13 enums
└── seed.ts                      # Bighi Brothers demo data
docs/                            # Project documentation (10 docs)
PROJECT_JOURNAL.md               # Session log, decisions, known issues
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

---

## Environment Variables

See `.env.example` for the full list with comments. Key variables:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `AUTH_SECRET` | Yes | Auth.js secret (run `npx auth secret`) |
| `AUTH_GOOGLE_ID` | For Google auth | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | For Google auth | Google OAuth client secret |
| `AUTH_DEV_EMAIL` | Dev only | Dev credentials email |
| `AUTH_DEV_PASSWORD` | Dev only | Dev credentials password |

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js dev server (port 3000) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:seed` | Run seed script |
| `npx prisma dev` | Start Prisma Postgres database |
| `npx prisma db push` | Push schema to database |
| `npx prisma generate` | Regenerate Prisma client |

---

## Current Status

All 4 phases complete. See `PROJECT_JOURNAL.md` for the full session log.

**What works:**
- Browse all data (orders, customers, products, leads, etc.)
- Create, edit, delete orders / products / customers / leads
- Detail pages with stock adjustments, status updates, timeline
- Recharts (AreaChart, PieChart) on Analytics page
- Google OAuth + dev credentials login
- Auth guard middleware (Next.js 16 proxy)
- REST API (8 routes) with API key authentication + rate limiting
- Webhook receiver (`POST /api/webhook/order`) for external store sync
- CSV export for orders, products, customers
- Standalone build (`npm run build`) ready for Docker deployment
- Dockerfile + docker-compose with PostgreSQL
- GitHub Actions CI pipeline
- CSP, security headers, env validation at startup

**Known limitations:**
- No search, filters, or pagination on any list
- Prisma Postgres (WASM) data is ephemeral — lost on restart, must re-seed
- Google OAuth requires test user setup in Google Cloud Console
- WhatsApp, Content, Settings pages are still read-only / static
- Rate limiter is in-memory (not Redis) — resets on server restart
- CSP includes `unsafe-eval` / `unsafe-inline` — tighten for production

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
