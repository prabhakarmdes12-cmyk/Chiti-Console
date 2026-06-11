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
│  ├─ KPI Row (Total Visitors, Orders Today, Open Leads, Revenue MTD)
│  ├─ Orders Timeline (latest 10 across all projects)
│  ├─ Revenue Graph (last 30 days)
│  └─ Project Status Cards (Bighi, TS Aromatics, Giriraj, etc.)
│
├─ Orders (/orders)
│  ├─ List View (sortable, filterable table)
│  ├─ Kanban View (by status)
│  └─ Order Detail (/orders/[id])
│      ├─ Order info header
│      ├─ Customer card
│      ├─ Items table
│      ├─ Timeline activity log
│      └─ Actions (update status, assign, send WhatsApp)
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
├─ Leads (/leads)
│  ├─ Kanban (New → Contacted → Qualified → Won/Lost)
│  └─ Lead Detail (/leads/[id])
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
