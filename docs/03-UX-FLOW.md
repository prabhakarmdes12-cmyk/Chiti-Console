# Chiti Console — UX Flow & Screen Map

**Version:** 1.0  
**Status:** Draft  

---

## 1. Navigation Tree

```
┌─ Login (/login)
│  ├─ Google OAuth
│  └─ Email + Password
│
├─ Dashboard (/dashboard) — HOME
│  ├─ KPI Row (Revenue, Orders Today, Customers, Conversion)
│  ├─ Operating Model Section (varies by project type)
│  │   ├─ MARKETPLACE: Money cards, marketplace health, funnel, priorities, money by category, vendor health
│  │   ├─ ECOMMERCE: AOV, active/OOS products, repeat buyer rate, paid orders, top products
│  │   ├─ B2B_CATALOG: Leads, products, won deals, conversion rate, pipeline stages
│  │   ├─ SAAS: Enrollments, active students, batches, new leads, churn rate
│  │   └─ CONTENT: Entries, published/draft, views, subscribers
│  ├─ Orders Timeline (latest 10 across all projects)
│  ├─ Revenue Graph (last 30 days)
│  ├─ Project Priorities (actionable items per project)
│  └─ Project Status Cards (Bighi, TS Aromatics, Giriraj, BJ, etc.)
│
├─ Orders (/orders)
│  ├─ List View (sortable, filterable table)
│  ├─ Kanban View (by status)
│  └─ Order Detail (/orders/[id])
│      ├─ Order info header
│      ├─ Customer card
│      ├─ Items table
│      ├─ Timeline activity log
│      ├─ Financial Breakdown (gross, discount, commission, fees, GST, net)
│      ├─ Vendor card (marketplace orders)
│      ├─ Escrow card (marketplace orders)
│      ├─ Refunds section
│      └─ Actions (status transitions, mark paid, generate invoice, delete)
│
├─ Customers (/customers)
│  ├─ List View (searchable)
│  └─ Customer Detail (/customers/[id])
│      ├─ Profile info
│      ├─ Order history
│      └─ Tags / Notes
│
├─ Products (/products)
│  ├─ List View with stock levels
│  ├─ Stock movement log
│  └─ Low stock alerts
│
├─ Vendors (/vendors) — BOOKING JHARKHAND
│  ├─ Grid View (vendor cards with type, rating, kyc)
│  └─ Vendor Detail (/vendors/[id])
│      ├─ Profile info & KYC documents
│      ├─ Bank account(s)
│      ├─ Wallet & transactions
│      ├─ Listings
│      ├─ Orders & payouts
│      └─ Actions (status, approve KYC, edit bank)
│
├─ Listings (/listings) — BOOKING JHARKHAND
│  ├─ Grid View (listing cards with type, vendor, price, rating)
│  └─ Listing Detail (/listings/[id])
│
├─ Enquiries (/enquiries) — BOOKING JHARKHAND
│  ├─ List View (pipeline: New → Contacted → Quoted → Confirmed)
│  └─ Enquiry Detail (/enquiries/[id])
│      └─ Action: Convert to Booking (creates order + escrow + wallet tx)
│
├─ Leads (/leads)
│  ├─ Kanban (New → Contacted → Qualified → Won/Lost)
│  └─ Lead Detail (/leads/[id])
│
├─ Finance (/finance) — BOOKING JHARKHAND
│  ├─ Escrow Management (held/released/cancelled)
│  ├─ Vendor Wallets (balance, pending, lifetime earnings)
│  ├─ Payouts (pending/processing/completed/failed)
│  ├─ Refunds (pending/approved/processed/rejected)
│  └─ Commission Rates (default + per-vendor overrides)
│
├─ Analytics (/analytics)
│  ├─ Cross-project overview
│  ├─ Per-project drilldown (/analytics/[projectId])
│  ├─ Revenue reports
│  └─ Export (PDF/CSV)
│
├─ WhatsApp (/whatsapp)
│  ├─ Unified inbox
│  ├─ Conversations by project
│  └─ Templates
│
├─ Content (/content)
│  ├─ All CMS content across projects
│  └─ Recent updates timeline
│
├─ System (/system)
│  ├─ Uptime status
│  ├─ SSL certificates
│  └─ Deployment log
│
└─ Settings (/settings)
   ├─ Profile
   ├─ Projects
   ├─ Team members
   ├─ API keys
   └─ Notifications
```

## 1.1 Sidebar Visibility by Role

| Role | Visible Nav Items |
|------|-------------------|
| SUPER_ADMIN / PROJECT_ADMIN | All items + "Add Project" |
| FINANCE_MANAGER | Dashboard, Orders, Customers, Products, Analytics, Finance |
| SUPPORT_AGENT | Dashboard, Orders, Customers, Vendors, Listings, Enquiries, Leads, WhatsApp |
| VENDOR_USER | Dashboard, Orders, Products, Enquiries |
| CLIENT_VIEWER | Dashboard, Analytics |
| CONTENT_EDITOR | Dashboard, Content, Analytics |

---

## 2. Key User Journeys

### Journey A: Daily Ops Check (Super Admin)

```
1. Login → Dashboard
2. Review KPI row — "Revenue MTD is ₹45K"
3. Scan Orders Timeline — "3 new orders overnight"
4. Click order → Update status → "Shipped"
5. Check WhatsApp inbox → Reply to customer inquiry
6. Done (5 min total)
```

### Journey B: New Order from WhatsApp (Support Agent)

```
1. WhatsApp notification comes in
2. Agent opens Console → WhatsApp inbox
3. Reads: "I want 2 Marigold soaps and 1 White Lotus cream"
4. Clicks "Create Order" → auto-fills customer if existing
5. Selects products from catalog → fills quantity
6. Sets status: "confirmed"
7. Customer gets auto-reply: "Your order #BB-0042 is confirmed!"
8. Done (2 min)
```

### Journey C: Monthly Report for Client (Project Admin)

```
1. Login → Analytics
2. Select project → Date range: "This Month"
3. View: revenue, orders, top products, traffic sources
4. Click "Export PDF"
5. Download generated report → send to client
6. Done (1 min)
```

### Journey D: Lead Follow-up (TS Aromatics)

```
1. Dashboard shows 8 open leads
2. Click into Leads
3. Filter: "status: new, source: website-form"
4. See "ABC Ayurveda — enquired about Lavender Oil, 5kg"
5. Click profile → see previous inquiries
6. Click "Send WhatsApp" → template: "Sample available"
7. Status → "contacted"
8. Done (3 min)
```

### Journey E: Enquiry to Booking Conversion (Marketplace Admin)

```
1. Dashboard → Enquiries shows 12 new enquiries
2. Click enquiry from "Rajesh — Forest Homestay, 3 nights"
3. Review details: checkIn: 25-Jun, checkOut: 28-Jun, 2 guests, pickup needed
4. Click "Convert to Booking"
5. System creates: Order (CONFIRMED) + Escrow (HELD) + Wallet tx + Payout (PENDING)
6. Opens order detail — see financial breakdown, escrow card, vendor card
7. Done (1 min)
```

### Journey F: Vendor Payout Run (Finance Manager)

```
1. Login → Finance → Payouts
2. See 5 pending payouts (18,500 total)
3. Click each → verify escrow status = RELEASED
4. Mark as "PROCESSING" → transfer via bank → enter reference ID
5. Mark as "COMPLETED" — vendor wallet updates, balance deducted
6. Done (3 min)
```

### Journey G: Vendor Onboarding (Support Agent)

```
1. Login → Vendors → "Add Vendor"
2. Enter: name "Green Valley Camps", type "CAMPING", phone, email
3. Upload KYC: PAN card, GST cert
4. Add bank account: account holder, IFSC, account number
5. Set commission override: 10% (default is 12%)
6. Vendor appears in listings dropdown
7. Done (2 min)
```

---

## 3. Screen States

Every screen must handle 4 states:

| State | Behavior | Visual |
|-------|----------|--------|
| **Loading** | Skeleton shimmer (ChitiSkeleton) | Glass cards with animated gradient |
| **Empty** | Empty state illustration + CTA | "No orders yet. Connect your store to get started." |
| **Error** | Error card with retry button | Red-tinted glass card |
| **Populated** | Normal data display | Full UI |

---

## 4. Mobile Considerations

- Console is primarily desktop-first (ops tool)
- Must work on tablet (768px+) for on-the-go WhatsApp replies
- Key actions (order updates, WhatsApp replies) must be usable on mobile
- Complex features (analytics charts, kanban) remain desktop-only initially
