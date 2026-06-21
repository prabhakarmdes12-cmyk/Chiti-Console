# Chiti Console — Roadmap

**Version:** 1.0  
**Status:** Draft  

---

## Phase 0: Foundation (Week 1)

**Goal:** Project scaffolded, database ready, auth working.

| Task | Output |
|------|--------|
| Initialize Next.js 16 with App Router | Running dev server |
| Set up Tailwind v4 with Chiti tokens | `globals.css` with CSS variables from `tokens.json` |
| Configure fonts (Outfit + Inter + JetBrains Mono) | Font loading in layout |
| Install + configure Prisma with PostgreSQL | `prisma/schema.prisma`, first migration |
| Set up Auth.js v5 with Google OAuth | `/login` page, session management |
| Create base layout (sidebar + topnav + main) | `app/layout.tsx` |
| Deploy to Vercel | `console.chiti.tech` live |

**Milestone:** Can login and see an empty dashboard.

---

## Phase 1: Core (Weeks 2-3)

**Goal:** Project registry, customer management, manual order entry.

| Task | Output |
|------|--------|
| Project Registry CRUD | `/projects`, add/edit/delete projects |
| Customer Management | `/customers`, add/edit, dedup by phone/email |
| Manual Order Entry | `/orders/new` — select customer, add items, set status |
| Order List + Detail | `/orders` table + `/orders/[id]` detail view |
| Order Status Workflow | Status transitions with timeline logging |
| Dashboard KPI Row | Total orders, revenue, customers, active projects |

**Milestone:** Can add a Bighi Brothers order manually and track its status.

---

## Phase 2: Analytics (Weeks 4-5)

**Goal:** Tracker script built, analytics captured, dashboard shows real data.

| Task | Output |
|------|--------|
| Build JS tracker script (`tracker.js`) | CDN-hosted script with auto-capture |
| POST `/api/track` endpoint | Event ingestion + validation |
| Set up PostHog (self-hosted or cloud) | Event pipeline connected |
| Analytics dashboard | Revenue chart, visitors, top products, traffic sources |
| Per-project analytics drilldown | `/analytics/[projectId]` |
| Date range picker | Custom date filtering for all charts |

**Milestone:** Bighi Brothers tracker installed, can see real traffic data in Console.

---

## Phase 3: WhatsApp (Weeks 6-7)

**Goal:** WhatsApp Business API connected, orders auto-created from messages.

| Task | Output |
|------|--------|
| WhatsApp Cloud API onboarding | Business account + webhook verified |
| Incoming message webhook | POST `/api/webhooks/whatsapp` |
| Auto-create order from WhatsApp message | New message → Order draft |
| Unified WhatsApp inbox | `/whatsapp` — conversations grouped by project |
| Quick reply templates | Saved responses for common queries |
| Order → WhatsApp notification | Status change triggers outbound message |

**Milestone:** Customer sends "I want 2 soaps" on WhatsApp → Order appears in Console.

---

## Phase 4: Products & Inventory (Week 8)

**Goal:** Product management with stock tracking.

| Task | Output |
|------|--------|
| Product CRUD | `/products` — add/edit products per project |
| Stock movement log | `/products/[id]/stock` — in/out/adjustment |
| Low stock alerts | Dashboard notifications for products below threshold |
| Product sync API | Products can be pushed from storefront via API |

**Milestone:** All Bighi Brothers products in Console, stock levels tracked.

---

## Phase 5: Lead CRM (Week 9)

**Goal:** TS Aromatics leads flow into Console.

| Task | Output |
|------|--------|
| Lead kanban board | `/leads` — drag-drop status pipeline |
| Lead → Customer → Order conversion | One-click convert with data carry-over |
| Follow-up reminders | Notification when follow-up date is due |
| Lead source tracking | See which page/form generated the lead |

**Milestone:** TS Aromatics contact form → Lead in Console → Converted to order.

---

## Phase 6: Content Dashboard (Week 10)

**Goal:** See all content from House of Giriraj (and others) in one place.

| Task | Output |
|------|--------|
| GitHub API integration | Content sync from House of Giriraj repo |
| Content index | `/content` — all entries, filterable by project |
| Recently updated feed | Timeline of content changes |
| SEO preview | Title, description, OG image per entry |

**Milestone:** Can see all Giriraj product pages + TS Aromatics academy articles in Console.

---

## Phase 7: Integration Finalization (Weeks 11-12)

**Goal:** All existing projects connected.

| Task | Output |
|------|--------|
| AuraPanchang API integration | User + consultation sync |
| Bighi Brothers — replace static products with Console API | Products fetched live from Console |
| TS Aromatics — shared database migration | Lead capture via Console API |
| System health monitoring | Uptime checks for all project domains |
| Notification preferences | Email/SMS/WhatsApp alert settings |

**Milestone:** All 5 projects fully connected to Console.

---

## Phase 8: Booking Jharkhand Integration (Weeks 13-14)

**Goal:** Complete marketplace operations — finance, pages, tools for the BJ marketplace.

| Task | Output |
|------|--------|
| Marketplace finance models (Commission, Escrow, VendorWallet, Payout, Refund) | Dedicated Prisma models + migration SQL |
| Finance API routes (`/api/finance/marketplace`, `/api/finance/payouts`, `/api/finance/refunds`) | GET/POST/PATCH with auth + role gating |
| First-class BJ pages (Vendors, Listings, Enquiries) | Grid + detail pages with KYC/bank/wallet/actions per vendor |
| Finance console pages (Escrow, Wallets, Payouts, Refunds, Commissions) | Per-page management views |
| Enquiry→Booking conversion action | Creates order + escrow + wallet tx + payout in one action |
| Booking detail page (`/orders/[id]`) | Tourism-specific view: checkIn/out, guests, roomType, vendor card, escrow card, financial breakdown, refunds |
| Marketplace dashboard (CEO Command Center) | Money cards, marketplace health, funnel, priorities, money by category, vendor health |

**Milestone:** Can manage BJ marketplace end-to-end — vendor onboarding to payout release.

---

## Phase 9: Productization (Weeks 15-18)

**Goal:** Console ready to sell as a product.

| Task | Output |
|------|--------|
| Multi-tenant isolation | Each client sees only their data |
| White-label branding | Custom logo, colors, domain per client |
| Client invitation flow | Send invite → create account → access granted |
| Onboarding wizard | "Connect your first project" guided flow |
| Documentation for clients | Public docs.chiti.tech |
| Billing integration (future) | Stripe subscription management |
| Public landing page | console.chiti.tech marketing site |

**Milestone:** Onboard first paying client.

---

## Phase 10: Platform Operating Models (Weeks 19-20)

**Goal:** Dashboard adapts per project type — marketplace, ecommerce, b2b, saas, content each get a purpose-built view.

| Task | Output |
|------|--------|
| ProjectType dispatch (`MARKETPLACE`, `ECOMMERCE`, `B2B_CATALOG`, `SAAS`, `CONTENT`) | Server-side fetch routing by `project.type` |
| Marketplace section | CEO Command Center with money cards, marketplace health, funnel, vendor health |
| Ecommerce section | AOV, active/OOS products, repeat buyer rate, paid orders, top products |
| B2B section | Leads, products, won deals, conversion rate, pipeline stages |
| SaaS section | Enrollments, active students, batches, new leads, churn rate |
| Content section | Entries, published/draft, views, subscribers |

**Milestone:** Each project type shows relevant metrics — ecommerce projects never see marketplace data.

---

## Phase 11: RBAC & Team Management (Weeks 21-22)

**Goal:** Role-based access control with 7 roles, filtered sidebar, project membership scoping.

| Task | Output |
|------|--------|
| Add FINANCE_MANAGER, VENDOR_USER roles | Schema enum update + migration |
| Server-side RBAC helpers (`getCurrentUser()`, `requireRole()`, `getAccessibleProjects()`) | `src/lib/db/queries.ts` exports |
| API route role gating | `requireRole(FINANCE_ROLES)` on finance mutations |
| Sidebar filtered by role | 7 role profiles with nav allow-lists |
| Project membership scoping | Non-SUPER_ADMIN users see only their projects |
| Seed demo users | finance@chiti.com, vendor@foresthomestay.com, content@chiti.com |

**Milestone:** Finance team can process payouts without seeing system settings; vendors see only their own orders and products.

## Success Criteria

| Phase | Exit Criteria |
|-------|---------------|
| 0 | Login works, dashboard renders |
| 1 | Can enter and track 10 orders manually |
| 2 | Bighi Brothers shows real analytics data |
| 3 | WhatsApp order creates Console order automatically |
| 4 | Products synced, stock alerts trigger |
| 5 | TS Aromatics lead capture via Console |
| 6 | Content index populated from Giriraj |
| 7 | All projects show green health status |
| 8 | BJ marketplace fully operational — vendors, bookings, finance |
| 9 | First non-Chiti client onboarded |
| 10 | Dashboard adapts per project type |
| 11 | Role-based access enforced across all pages + APIs |
