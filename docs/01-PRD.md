# Chiti Console — Product Requirements Document

**Version:** 1.0  
**Status:** Draft  
**Author:** Chiti Technologies  

---

## 1. Executive Summary

**Chiti Console** is a unified, white-label operations dashboard that connects to all Chiti Technologies projects (and client projects) to provide a single-pane-of-glass for:

- Order & lead management
- Revenue & traffic analytics
- Content administration
- Customer & user management
- System health monitoring

It is both Chiti's internal operations tool AND a sellable product for agencies/brands that need a lightweight back office without adopting Shopify, WordPress, or expensive SaaS.

---

## 2. Problem Statement

Every project you build has the same gaps:

| Project | Built | Missing |
|---------|-------|---------|
| **Bighi Brothers** | Next.js storefront | Order processing, payment pipeline, inventory, analytics, admin panel |
| **TS Aromatics** | Next.js B2B catalog | Lead CRM, COA management, order system, analytics |
| **House of Giriraj** | Vite + Decap CMS | Content managed (good), but no order tracking, no analytics, no client activity log |
| **NetQ Command** | React dashboard (UI only) | No real backend, no auth, no data persistence |
| **AuraPanchang** | Lovable app | Auth + users exist, but no admin panel for gurus, no consultation management |

**The pattern:** Every project re-solves the same backend problems — and none solve them fully. Chiti Console solves this once, for all.

---

## 3. Personas & User Roles

| Role | Description | Access |
|------|-------------|--------|
| **Super Admin** (you) | Full access to all projects, system settings, billing | Everything |
| **Project Admin** | Manages a single project (e.g., Bighi Brothers day-to-day ops) | That project only |
| **Support Agent** | Views orders, chats, can update order status | Orders + Customers |
| **Client** (future) | Views their own project's analytics and reports | Read-only per project |
| **Content Editor** | Manages CMS content (Decap-style) for a specific project | Content only |

---

## 4. Feature Modules

### 4.1 Project Registry

The core organizing concept. Every project registers with Chiti Console once.

- CRUD for projects (name, slug, type, domain, logo)
- Installation guide per project type ("Add this script tag to your site")
- Connection status indicator (green/yellow/red per project)

### 4.2 Order Management

Solves Bighi Brothers' WhatsApp order chaos. Also serves TS Aromatics leads, House of Giriraj inquiries.

- Order inbox — all orders from all projects in one timeline view
- WhatsApp order capture via Business API
- Bulk status update (pending → confirmed → processing → shipped → delivered)
- PDF invoice generation
- Order timeline with activity log

### 4.3 Customer Management

- Unified customer profile across projects
- Order history per customer
- Customer segments (by total spent, recency, location)
- Export to CSV
- Merge duplicate customers

### 4.4 Product & Inventory

- Product list synced from storefront or manual entry
- Stock level tracking with movement log
- Low stock alerts
- Margin calculation (cost vs price)
- WhatsApp out-of-stock notifications

### 4.5 Lead CRM

For TS Aromatics and B2B lead generation.

- Lead inbox with status pipeline (kanban or list)
- Convert lead to customer + order
- Follow-up reminders
- Bulk email/WhatsApp via templates
- Source tracking

### 4.6 Content Dashboard

- See all Decap CMS content from House of Giriraj (via GitHub API)
- See all TS Aromatics academy articles
- Recently updated content timeline
- Basic SEO preview

### 4.7 Analytics & Reporting

- Cross-project overview — total traffic, revenue, orders, leads
- Per-project drilldown — DAU/MAU, page views, conversion rate
- Revenue tracking — orders vs revenue vs pending
- Top products across all stores
- Traffic sources — direct, organic, social, referral
- Geographic data
- WhatsApp analytics — inquiries, conversion rate, response time
- Export — PDF reports, CSV data

### 4.8 WhatsApp Operations Center

- Unified inbox — all WhatsApp conversations from all projects
- Quick reply templates
- Order-to-chat linking
- Broadcast to customer segments
- Automation rules

### 4.9 System Health

- Uptime monitoring (HTTP ping every 5 minutes)
- SSL certificate expiry tracking
- Page load speed (Lighthouse scores)
- Recent deployments log
- Status page (public or private)

---

## 5. Success Metrics

| Metric | Target (6 months) |
|--------|-------------------|
| Orders processed via Console | 100% of all project orders |
| Projects connected | All 5 existing + 3 new |
| Time saved per week | 10+ hours (no more manual WhatsApp tracking) |
| Analytics accuracy | < 1% discrepancy |
| Client NPS (if sold) | 40+ |
