# Chiti Console — Integration Strategy

**Version:** 1.0  
**Status:** Draft  

---

## 1. Integration Matrix

| Project | Method | Direction | Data Synced | Priority |
|---------|--------|-----------|-------------|----------|
| **Bighi Brothers** | JS Tracker + Manual | Push (tracker) + Manual (orders) | Events, Products (manual) | P0 |
| **TS Aromatics** | Shared Prisma DB + Tracker | Bidirectional | Leads, Products, Events | P0 |
| **House of Giriraj** | GitHub API + Tracker | Pull (content) + Push (events) | Content index, Events | P1 |
| **NetQ Command** | JS Tracker only | Push | Events only | P2 |
| **AuraPanchang** | API Key + Webhooks | Bidirectional | Users, Consultations, Events | P1 |

---

## 2. Integration: Bighi Brothers (P0)

### Current State
- Next.js 16 app with static product data in `products.ts`
- Zustand cart persisted to localStorage
- Orders sent via WhatsApp deep link (`wa.me`)
- No backend, no database
- No analytics

### Integration Method
**Phase 1 — Tracker Snippet + Manual Order Entry**
```
1. Add <script src="https://console.chiti.tech/tracker.js"> to layout.tsx
2. Tracker auto-captures: page views, add-to-cart, checkout clicks
3. Orders entered manually in Console by staff when WhatsApp order comes in
```

**Phase 2 — WhatsApp API Integration**
```
1. Connect WhatsApp Business API to Console
2. Incoming order messages auto-create order drafts
3. Outgoing status updates sent automatically
```

**Phase 3 — Product Sync**
```
1. Console API exposes product CRUD
2. Bighi Brothers fetches products from Console API (replacing static data)
3. Admin updates products in Console, storefront reflects changes
```

### Implementation
```tsx
// tracker.js snippet to add in Bighi Brothers layout.tsx
<script
  src="https://console.chiti.tech/tracker.js"
  data-project="bighi-brothers"
  data-api-key="pk_live_abc123"
  data-debug="false"
  async
></script>

// Custom event tracking
window.chiti?.track('add_to_cart', {
  productId: 'marigold-mountain-soap',
  productName: 'Marigold Mountain Soap',
  price: 299,
  quantity: 1
});
```

---

## 3. Integration: TS Aromatics (P0)

### Current State
- Next.js 16 app with Prisma/PostgreSQL ready (schema exists)
- 180+ products with GC/MS data, COA documentation
- Lead capture via contact form (currently console.logs)
- Enquiry/cart system using React context
- No admin panel

### Integration Method
**Shared Database — Console IS the database for TS Aromatics**

Since TS Aromatics already has Prisma set up, Console's database becomes the single source of truth. TS Aromatics' Prisma schema becomes a subset of Console's schema.

```
Architecture:

TS Aromatics App                  Chiti Console
┌──────────────────┐              ┌──────────────────┐
│  Next.js 16      │              │  Next.js 16      │
│  ┌────────────┐  │              │  ┌────────────┐  │
│  │ Prisma     │──┼──shared─────┼──│ Prisma     │  │
│  │ Client    │  │  PostgreSQL  │  │ Client    │  │
│  └────────────┘  │              │  └────────────┘  │
│                  │              │                  │
│  Leads → Console │              │  ← Reads leads   │
│  Webhook         │              │  ← Manages users │
└──────────────────┘              └──────────────────┘
```

**Migration:**
1. Deploy Console's Prisma schema to PostgreSQL
2. TS Aromatics connects to the same database with a read-scoped connection
3. TS Aromatics `submitContact` Server Action POSTs leads to Console API instead of console.log
4. Console admin can view, manage, and export leads

**Product Sync:**
TS Aromatics products are imported into Console via a one-time seed script. Updates via Console push to TS Aromatics via webhook or shared DB read.

---

## 4. Integration: House of Giriraj (P1)

### Current State
- Vite + React 19 static site
- Decap CMS with GitHub backend
- Products as Markdown files in GitHub repo
- No orders, no analytics, no backend

### Integration Method
**Content Index via GitHub API + Tracker**
```
1. Console periodically fetches product markdown files via GitHub API
2. Parses frontmatter + content into ContentEntry records
3. Console shows all content in unified content dashboard
4. Tracker snippet added for analytics
5. Order management via manual entry (inquiries come via website form/phone)
```

**GitHub API Usage:**
```
GET https://api.github.com/repos/prabhakarmdes12-cmyk/House-of-Giriraj/contents/products/
  → Returns list of category directories

GET https://api.github.com/repos/prabhakarmdes12-cmyk/House-of-Giriraj/contents/products/necklaces/
  → Returns list of product markdown files

GET https://api.github.com/repos/prabhakarmdes12-cmyk/House-of-Giriraj/contents/products/necklaces/diamond-necklace.md
  → Returns product content with frontmatter
```

**Sync frequency:** Every 15 minutes via cron job or GitHub webhook on push.

---

## 5. Integration: NetQ Command (P2)

### Current State
- Vite + React 19 SaaS dashboard demo
- No backend, no auth, no data persistence
- Frontend-only prototype

### Integration Method
**Analytics tracker only** — no order/lead management needed for a SaaS demo.

```
1. Add tracker snippet to index.html
2. Track page views, demo launches, feature clicks
3. Console shows engagement metrics for NetQ landing page
```

---

## 6. Integration: AuraPanchang (P1)

### Current State
- Built with Lovable (AI-generated)
- Has auth (Sign In/Sign Up)
- User accounts, kundli data, consultations
- No admin panel

### Integration Method
**API Key + Webhooks**

```
Console                                    AuraPanchang
   │                                            │
   │  Register project + generate API key       │
   │◄───────────────────────────────────────────│
   │                                            │
   │  POST /api/webhooks/aura/users (new signup)│
   │◄───────────────────────────────────────────│
   │                                            │
   │  POST /api/webhooks/aura/consultation      │
   │◄───────────────────────────────────────────│
   │                                            │
   │  GET /api/aura/users (admin view)          │
   │────────────────────────────────────────────►│
```

**Data Synced:**
- New user signups → Console Customer records
- Consultation bookings → Console Lead records
- Revenue from consultations → Console Analytics events

---

## 7. Tracker Script Specification

### Installation
```html
<script src="https://console.chiti.tech/tracker.js"
  data-project="<project-slug>"
  data-api-key="<project-api-key>"
  async>
</script>
```

### Auto-captured Events
| Event | Trigger | Properties |
|-------|---------|------------|
| `page_view` | Page load | url, referrer, viewport, timestamp |
| `click_whatsapp` | Click on wa.me link | productId from data attribute |
| `add_to_cart` | Cart add | productId, name, price, quantity |
| `remove_from_cart` | Cart remove | productId |
| `checkout_start` | Checkout page load | cartItems count, subtotal |

### Custom Events (via JS API)
```js
window.chiti.track('custom_event', { key: 'value' });
```

### Data Flow
```
Tracker → POST https://console.chiti.tech/api/track
  → Console validates API key
    → Upserts AnalyticsEvent
      → PostHog capture (real-time)
        → Dashboard updates
```
