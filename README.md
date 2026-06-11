# Chiti Console

**Unified operations dashboard for Chiti Technologies projects.**

Single-pane-of-glass for orders, customers, analytics, content, and WhatsApp across all projects — Bighi Brothers, TS Aromatics, House of Giriraj, NetQ Command, AuraPanchang, and more.

---

## Documentation

| Doc | Description |
|-----|-------------|
| [01-PRD](./docs/01-PRD.md) | Product Requirements Document — full feature specification |
| [02-TECHNICAL-ARCHITECTURE](./docs/02-TECHNICAL-ARCHITECTURE.md) | Stack decisions, data flow, topology diagram |
| [03-UX-FLOW](./docs/03-UX-FLOW.md) | All screens, navigation tree, user journeys |
| [04-DATA-MODEL](./docs/04-DATA-MODEL.md) | Complete Prisma schema with all entities |
| [05-INTEGRATION-STRATEGY](./docs/05-INTEGRATION-STRATEGY.md) | How each project connects to Console |
| [06-SECURITY-AND-AUTH](./docs/06-SECURITY-AND-AUTH.md) | Auth.js config, RBAC, API security |
| [07-ROADMAP](./docs/07-ROADMAP.md) | Phased build plan with milestones |
| [08-DESIGN-GUIDE](./docs/08-DESIGN-GUIDE.md) | Chiti UDS v3 tokens, components, layout |
| [09-API-REFERENCE](./docs/09-API-REFERENCE.md) | All REST API endpoints |

---

## Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4 + Chiti Design System v3 tokens
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** Auth.js v5 (Google OAuth + Email)
- **Analytics:** Self-hosted PostHog
- **Charts:** Recharts
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Queue:** Redis + Bull (future)

---

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local

# Run database migrations
npx prisma migrate dev

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout (sidebar + topnav + main)
│   ├── page.tsx            # Dashboard home
│   ├── login/page.tsx
│   ├── orders/
│   ├── customers/
│   ├── products/
│   ├── leads/
│   ├── analytics/
│   ├── whatsapp/
│   ├── content/
│   ├── system/
│   ├── settings/
│   └── api/                # API routes
├── components/
│   ├── ui/                 # Chiti design system components
│   ├── dashboard/
│   ├── orders/
│   ├── analytics/
│   └── shared/
├── lib/
│   ├── db/                 # Prisma client
│   ├── auth/               # Auth.js config
│   └── integrations/       # WhatsApp, GitHub, Stripe
├── styles/
│   └── globals.css         # Chiti tokens as CSS variables
├── docs/                   # Documentation
└── prisma/
    └── schema.prisma
```

---

## Deployment

Deployed on Vercel. Each push to `main` triggers automatic deployment.

**Production:** https://console.chiti.tech

---

Built by **Chiti Technologies** © 2026
