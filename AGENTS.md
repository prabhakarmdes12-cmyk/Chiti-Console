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
