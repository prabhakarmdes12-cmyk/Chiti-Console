# Chiti Console — V1 Upgrade Plan

> **Status:** Draft  
> **Target:** V1.0 release  
> **Stack:** Next.js 16, TypeScript, Tailwind v4, Prisma + PostgreSQL, Auth.js v5  
> **AI SDK:** Vercel AI SDK v7 (`npm i ai`) + OpenAI GPT-5-mini (primary)  
> **Reference:** `docs/00-JOURNAL.md` for current state and decisions log

---

## Table of Contents

1. [Strategic Position](#1-strategic-position)
2. [AI SDK Decision](#2-ai-sdk-decision)
3. [Feature Roadmap](#3-feature-roadmap)
4. [Phase 1: AI Foundation (Months 1-2)](#4-phase-1-ai-foundation-months-1-2)
5. [Phase 2: Core Upgrades (Months 2-4)](#5-phase-2-core-upgrades-months-2-4)
6. [Phase 3: Monetization & Launch (Months 4-6)](#6-phase-3-monetization--launch-months-4-6)
7. [Anti-Features](#7-anti-features)
8. [Pricing Model](#8-pricing-model)
9. [Cost Estimates](#9-cost-estimates)
10. [Build Order — Dependency Graph](#10-build-order--dependency-graph)
11. [Success Metrics](#11-success-metrics)
12. [Risk Register](#12-risk-register)
13. [Open Questions](#13-open-questions)

---

## 1. Strategic Position

### The Wedge

Chiti V1 positions as the **Operations OS for Indian multi-project businesses**, with WhatsApp commerce as the primary on-ramp.

| Decision | Rationale |
|----------|-----------|
| **WhatsApp-first ops** | Indian WhatsApp Business market is ₹4,200 Cr, growing 38% YoY; 15M users, <2% automated |
| **Multi-project isolation** | Already built. Agencies running 5-20 client projects need a unified ops dashboard with data isolation |
| **Health scoring** | Genuinely unique. No competitor has a single glanceable score aggregating orders, WhatsApp, stock, leads, content |
| **India-first** | ₹/INR pricing, INR currency formatting, WhatsApp as primary commerce channel, GST invoicing |

### What we do NOT compete on

| Don't try to beat | Because |
|-------------------|---------|
| **Odoo** on ERP breadth (accounting, manufacturing, HR, payroll) | They have 50+ modules and 20 years of feature depth |
| **Kartib / Opal** on founder dashboards (Stripe sync, AI insights, investor pipeline) | They are read-only aggregators; we are an operations platform |
| **WatEase / Interakt** on pure WhatsApp commerce (storefront, catalog, payment links) | They are narrow channel tools; we are a full ops platform |
| **Crmzix / Conduyt** on AI-native CRM (MCP servers, AI agents as users) | They target enterprise sales teams; we target operations |

---

## 2. AI SDK Decision

### Why Vercel AI SDK

| Factor | Vercel AI SDK | Building Custom |
|--------|--------------|-----------------|
| **Integration** | `npm i ai`, ~5 lines per feature | Months of ML pipeline engineering |
| **Provider flexibility** | Swap OpenAI ↔ Anthropic ↔ Google by changing 1 string in model config | Locked to one provider |
| **Structured output** | `generateObject` + Zod schema — type-safe, validated output | Manual JSON parsing, regex hacks |
| **Streaming** | `streamText` + `useChat` hook — built-in SSE handling | Build from scratch |
| **Tool calling** | Native. Agent can read Prisma, write orders, send WhatsApp | Custom function-calling infrastructure |
| **Caching** | `"use cache"` directive cuts repeated calls by 97% | Build Redis + cache invalidation |
| **Vercel native** | Free $5/mo tier on AI Gateway, no extra server | Need separate inference server |
| **Community** | 24.7K GitHub stars, 480 contributors, Vercel-maintained | Solo maintenance burden |

### Model Selection

| Feature | Model | Cost (input) | Cost (output) | Rationale |
|---------|-------|-------------|--------------|-----------|
| Lead scoring | `openai/gpt-5-mini` | $0.20/1M tokens | $0.80/1M tokens | Fast, cheap, good at classification |
| Order extraction | `openai/gpt-5-mini` | $0.20/1M tokens | $0.80/1M tokens | Structured output with Zod works well |
| NL query | `openai/gpt-5-mini` | $0.20/1M tokens | $0.80/1M tokens | Tool calling for Prisma queries |
| Follow-up drafts | `openai/gpt-5-mini` | $0.20/1M tokens | $0.80/1M tokens | Context window fits conversation history |
| Complex reasoning | `openai/gpt-5.4` (fallback) | $2.50/1M tokens | $10.00/1M tokens | Only when mini fails |

### Caching Strategy

```
"use cache" directive on every AI call:
  - System prompts (never change) → 100% cache hit rate
  - Lead scoring for same name+source combo → 70% cache hit
  - NL queries with same intent → 60% cache hit

Estimated cache savings: 60-80% reduction in AI costs
```

---

## 3. Feature Roadmap

```
V1.0 ──────────────────────────────────────────────────────────▶
│                                                               │
├─ Phase 1: AI Foundation    ───── Months 1-2 ──── P0           │
│  ├─ AI Lead Scoring                                            │
│  ├─ AI Order Extraction from WhatsApp                          │
│  ├─ Vercel AI Gateway setup                                   │
│  └─ "use cache" infrastructure                                │
│                                                               │
├─ Phase 2: Core Upgrades     ──── Months 2-4 ──── P1           │
│  ├─ Razorpay/Stripe integration                               │
│  ├─ WhatsApp API activation (env vars)                        │
│  ├─ NL Dashboard Query                                        │
│  ├─ AI Follow-up Drafting                                     │
│  ├─ Financial module (invoicing, P&L)                         │
│  └─ Mobile PWA                                                │
│                                                               │
├─ Phase 3: Launch             ─── Months 4-6 ──── P2           │
│  ├─ GA4 integration                                           │
│  ├─ Client portal                                             │
│  ├─ Public pricing page                                       │
│  ├─ Freemium tier gating                                      │
│  └─ Stripe billing integration                                │
│                                                               │
└─ V2 (Future): WhatsApp interactive messages,                 │
   AI agent inside chat, marketplace                            │
```

---

## 4. Phase 1: AI Foundation (Months 1-2)

### P0 — Ship these first, in order

#### 4.1 Vercel AI Gateway Setup

**Files to create/modify:**
- `.env.local` — add `OPENAI_API_KEY` (or use AI Gateway with free $5 tier)
- `src/lib/ai/index.ts` — shared AI client config
- `src/app/api/ai/route.ts` — optional streaming endpoint

**Implementation:**

```typescript
// src/lib/ai/index.ts
import { generateText, generateObject } from "ai";
// Vercel AI Gateway is default provider — no extra config needed
// Models referenced as "openai/gpt-5-mini", "openai/gpt-5.4", etc.
```

**Cost:** $0 (free tier covers $5/mo, enough for dev)

---

#### 4.2 AI Lead Scoring

**Files to create/modify:**
- `src/lib/ai/score-lead.ts` — scoring function
- `src/lib/actions/leads.ts` — integrate scoring into createLead
- `prisma/schema.prisma` — add `score` field to Lead model

**Schema change:**

```prisma
model Lead {
  // ... existing fields
  score        Int?      // 0-100, set by AI on creation
  scoreReason  String?   // Brief explanation from AI
}
```

**Implementation:**

```typescript
// src/lib/ai/score-lead.ts
import { generateObject } from "ai";
import { z } from "zod";

const leadScoreSchema = z.object({
  score: z.number().min(0).max(100),
  reason: z.string(),
  category: z.enum(["HOT", "WARM", "COLD"]),
});

export async function scoreLead(input: {
  name: string;
  source: string;
  message?: string;
  company?: string;
  projectType: string;
}) {
  const { object } = await generateObject({
    model: "openai/gpt-5-mini",
    schema: leadScoreSchema,
    system: `You are a lead scoring assistant for an Indian multi-project operations platform.
Score leads 0-100 based on:
- Source quality (WHATSAPP > WEBSITE_FORM > MANUAL > CALENDLY)
- Message specificity (product mentioned, budget, urgency)
- Company/B2B signal
- Relevance to project type

Output a score, a 1-line reason, and a category.`,
    prompt: JSON.stringify(input),
  });

  return object;
}
```

**Integration:** Call `scoreLead()` inside `createLead` server action. Store result in `lead.score` and `lead.scoreReason`.

**Display:** Add score badge to leads list and detail page (colour-coded: green 70+, yellow 40-69, red <40).

**Cost estimate:** ~500 tokens per lead × ₹ leads = negligible at current volume. At 10K leads/mo: ~500K tokens × $0.20/1M = **$0.10/mo**.

---

#### 4.3 AI Order Extraction from WhatsApp

**Files to create/modify:**
- `src/lib/ai/extract-order.ts` — extraction function
- `src/app/(app)/whatsapp/[id]/ConversationThread.tsx` — "Extract Order" button
- `src/lib/actions/whatsapp.ts` — `extractOrderFromConversation` action

**Implementation:**

```typescript
// src/lib/ai/extract-order.ts
import { generateObject } from "ai";
import { z } from "zod";

const orderItemSchema = z.object({
  productName: z.string(),
  quantity: z.number().min(1),
  unitPrice: z.number().optional(),
  notes: z.string().optional(),
});

const extractedOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1),
  customerName: z.string().optional(),
  phone: z.string().optional(),
  totalAmount: z.number(),
  confidence: z.enum(["HIGH", "MEDIUM", "LOW"]),
  missingInfo: z.array(z.string()),
});

export async function extractOrderFromMessages(messages: Array<{
  content: string;
  isFromCustomer: boolean;
}>) {
  const conversation = messages
    .map((m) => `${m.isFromCustomer ? "Customer" : "You"}: ${m.content}`)
    .join("\n");

  const { object } = await generateObject({
    model: "openai/gpt-5-mini",
    schema: extractedOrderSchema,
    system: `You are an order extraction assistant for Indian WhatsApp commerce.
Read the conversation and extract order details. Be conservative — only extract
what is clearly stated. If information is ambiguous, list it in missingInfo.

Products may be mentioned with Indian names (e.g., "chandan soap", "almond oil").
Prices in ₹. Quantities as numbers or words (e.g., "2", "dozen", "half kg").`,
    prompt: conversation,
  });

  return object;
}
```

**UX:** Add "Extract Order" button on conversation thread (only when customer is linked). Clicking opens a modal/drawer showing extracted order data. User can edit before confirming. On confirm, creates order draft and redirects to order detail.

**Cost estimate:** ~1,500 tokens per extraction × 100 orders/mo = 150K tokens × $0.20/1M = **$0.03/mo**.

---

#### 4.4 Caching Infrastructure

**Files to create/modify:**
- `next.config.ts` — ensure `experimental.useCache` is enabled (already default in Next.js 16)

**Implementation:** The `"use cache"` directive is a React 19 / Next.js 16 built-in. No extra code needed — just add the directive to server action calls that use AI.

```typescript
export async function scoreLeadWithCache(...args) {
  "use cache";
  return scoreLead(...args);
}
```

**Benefit:** Repeated lead scoring (same name + source) hits cache instead of API. Estimated 97% cost reduction for repeated queries.

---

## 5. Phase 2: Core Upgrades (Months 2-4)

### 5.1 Razorpay/Stripe Integration

**Files to create/modify:**
- `src/lib/integrations/payments.ts` — payment client
- `src/lib/actions/payments.ts` — sync payment status
- `src/app/api/webhook/razorpay/route.ts` — webhook receiver
- `prisma/schema.prisma` — add `paymentProvider`, `paymentProviderId` to Order

**Scope:**
- Read-only sync of payment status (paid/unpaid/refunded)
- Auto-update `order.paymentStatus` when webhook fires
- No P&L or invoicing in this phase (see 5.5)

**Why this order:** Payment status is the #1 missing data point. Without it, orders are incomplete. Razorpay webhooks are straightforward (signature verification + event handling).

---

### 5.2 WhatsApp API Activation

**Files to modify:**
- `src/lib/integrations/whatsapp.ts` — verify all 3 env vars are wired
- Vercel dashboard — set `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_APP_SECRET`

**Why this is P1 not P0:** WhatsApp features already work with local save fallback. The API activation enables real messaging but requires Meta Business Account setup on the user's side. This is blocked until user completes Meta onboarding.

---

### 5.3 NL Dashboard Query

**Files to create/modify:**
- `src/lib/ai/query-data.ts` — NL-to-Prisma-query function
- `src/components/ai/QueryBar.tsx` — search bar component
- `src/app/api/ai/query/route.ts` — streaming endpoint

**Implementation:**

```typescript
// src/lib/ai/query-data.ts
import { generateText, tool } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";

const queryTools = {
  getOrders: tool({
    description: "Query orders with filters. Use when user asks about revenue, orders, sales",
    parameters: z.object({
      minAmount: z.number().optional(),
      maxAmount: z.number().optional(),
      status: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      projectId: z.string().optional(),
      source: z.string().optional(),
      limit: z.number().default(10),
    }),
    execute: async (params) => {
      const where: any = {};
      if (params.minAmount) where.totalAmount = { gte: params.minAmount };
      if (params.maxAmount) where.totalAmount = { ...where.totalAmount, lte: params.maxAmount };
      if (params.status) where.status = params.status;
      if (params.projectId) where.projectId = params.projectId;
      if (params.source) where.source = params.source;
      if (params.startDate) where.createdAt = { ...where.createdAt, gte: new Date(params.startDate) };
      if (params.endDate) where.createdAt = { ...where.createdAt, lte: new Date(params.endDate) };

      const orders = await prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: params.limit,
        include: { customer: true },
      });

      return JSON.stringify(orders.map(o => ({
        number: o.orderNumber,
        amount: o.totalAmount,
        status: o.status,
        customer: o.customer?.name,
        date: o.createdAt,
      })));
    },
  }),
  // Similar tools for customers, products, leads...
};
```

**UX:** A command-bar-style input at the top of the dashboard and analytics page. User types natural language, AI interprets, executes via tools, returns answer in plain text + optional chart.

**Cost estimate:** ~800 tokens per query × 500 queries/mo = 400K tokens × $0.20/1M = **$0.08/mo**.

---

### 5.4 AI Follow-up Drafting

**Files to create/modify:**
- `src/lib/ai/draft-followup.ts` — drafting function
- `src/app/(app)/leads/[id]/page.tsx` — "Draft Follow-up" button

**Implementation:**

```typescript
// src/lib/ai/draft-followup.ts
import { generateText } from "ai";

export async function draftFollowUp(lead: {
  name: string;
  message?: string;
  status: string;
  projectType: string;
}) {
  const { text } = await generateText({
    model: "openai/gpt-5-mini",
    system: `You are a sales assistant for an Indian business operations platform.
Draft a WhatsApp follow-up message for a lead. Be concise, professional,
and contextually appropriate for the lead's current status. Use Hinglish
sparingly — only if the original conversation uses it.

Keep under 200 characters. Include a call to action.`,
    prompt: JSON.stringify(lead),
  });

  return text;
}
```

**UX:** Button on lead detail page. Clicking generates a draft message in a textarea. User can edit and send (via WhatsApp or copy).

---

### 5.5 Financial Module (Invoicing + P&L)

**Files to create/modify:**
- `prisma/schema.prisma` — add `Invoice` model, `Expense` model
- `src/lib/actions/finance.ts` — CRUD for invoices, expenses
- `src/app/(app)/finance/page.tsx` — finance dashboard
- `src/app/(app)/orders/[id]/page.tsx` — "Generate Invoice" button

**Schema additions:**

```prisma
model Invoice {
  id          String   @id @default(uuid())
  orderId     String?
  order       Order?   @relation(fields: [orderId], references: [id])
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id])
  invoiceNumber String @unique
  amount      Decimal  @db.Decimal(10, 2)
  taxAmount   Decimal  @db.Decimal(10, 2) @default(0)
  totalAmount Decimal  @db.Decimal(10, 2)
  status      String   @default("DRAFT") // DRAFT, SENT, PAID, CANCELLED
  dueDate     DateTime?
  paidAt      DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  items       InvoiceItem[]
}

model InvoiceItem {
  id          String  @id @default(uuid())
  invoiceId   String
  invoice     Invoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  description String
  quantity    Int
  unitPrice   Decimal @db.Decimal(10, 2)
  total       Decimal @db.Decimal(10, 2)
}

model Expense {
  id          String   @id @default(uuid())
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id])
  description String
  amount      Decimal  @db.Decimal(10, 2)
  category    String   // OPERATIONS, MARKETING, HOSTING, TOOLS, SALARY, OTHER
  date        DateTime
  receipt     String?  // URL to uploaded receipt
  createdAt   DateTime @default(now())
}
```

**P&L Calculation:**

```typescript
async function getProfitLoss(projectId: string, startDate: Date, endDate: Date) {
  const [revenue, expenses] = await Promise.all([
    prisma.order.aggregate({
      where: { projectId, createdAt: { gte: startDate, lte: endDate } },
      _sum: { totalAmount: true },
    }),
    prisma.expense.aggregate({
      where: { projectId, date: { gte: startDate, lte: endDate } },
      _sum: { amount: true },
    }),
  ]);

  const totalRevenue = Number(revenue._sum.totalAmount ?? 0);
  const totalExpenses = Number(expenses._sum.amount ?? 0);

  return {
    revenue: totalRevenue,
    expenses: totalExpenses,
    profit: totalRevenue - totalExpenses,
    margin: totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue * 100).toFixed(1) : 0,
  };
}
```

**Scope:** Basic invoicing (generate from order, mark sent/paid, PDF download) + expense tracking (manual entry, categorize) + P&L dashboard (revenue vs expenses per project/month).

---

### 5.6 Mobile PWA

**Files to create/modify:**
- `src/app/manifest.ts` — PWA manifest
- `public/icons/` — app icons (192x192, 512x512)
- `src/app/layout.tsx` — add meta theme-color, viewport

**Implementation:** Next.js supports PWA out of the box with `metadata` export in layout. No extra packages needed.

```typescript
// src/app/manifest.ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Chiti Console",
    short_name: "Chiti",
    description: "Operations OS for your businesses",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0f0f1a",
    theme_color: "#0f0f1a",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
```

**Mobile-first CSS:** Ensure the WhatsApp conversation list and thread work on mobile widths. The sidebar collapses to hamburger on <768px. Dashboard grid stacks to single column on mobile.

---

## 6. Phase 3: Monetization & Launch (Months 4-6)

### 6.1 GA4 Integration

**Files to create/modify:**
- `src/lib/integrations/analytics.ts` — GA4 client
- `src/app/(app)/analytics/page.tsx` — add traffic source panel

**Scope:** Pull pageview and session data from GA4 API for each project's domain. Display as additional panel on analytics page alongside revenue chart.

### 6.2 Client Portal

**Files to create/modify:**
- `src/app/(portal)/layout.tsx` — portal layout (no sidebar, minimal header)
- `src/app/(portal)/[slug]/page.tsx` — client-facing dashboard
- `src/app/(portal)/[slug]/orders/page.tsx` — order list
- `prisma/schema.prisma` — `Client` model with portal access

**Scope:** Read-only view for clients. See their project's orders, invoices, and delivery status. No admin features. Auth via magic link or shared secret.

### 6.3 Pricing & Billing

**Files to create/modify:**
- `src/app/(marketing)/pricing/page.tsx` — public pricing page
- `src/lib/billing/stripe.ts` — Stripe subscription management
- `src/lib/middleware/billing.ts` — feature gating
- `prisma/schema.prisma` — `Subscription` model

**Feature gating pattern:**

```typescript
// src/lib/billing/plan.ts
type Plan = "FREE" | "STARTER" | "PRO" | "ENTERPRISE";

const PLAN_LIMITS = {
  FREE: { projects: 1, ordersPerMonth: 50, integrations: 1, ai: false },
  STARTER: { projects: 3, ordersPerMonth: -1, integrations: 3, ai: true },
  PRO: { projects: 15, ordersPerMonth: -1, integrations: -1, ai: true },
  ENTERPRISE: { projects: -1, ordersPerMonth: -1, integrations: -1, ai: true },
};
```

---

## 7. Anti-Features

These are explicitly **not** in V1 scope:

| Feature | Reason for Exclusion |
|---------|---------------------|
| **Content CMS** | Too broad. Current content module is unused. Remove or defer to V2 |
| **System health monitoring** | Uptime/SSL/deployment log. Low adoption risk. Not core to ops |
| **HR / Payroll** | Odoo territory. Never build |
| **Manufacturing / MRP** | Not relevant for our target market (D2C, B2B catalog, EdTech) |
| **Customizable dashboards** | Drag-and-drop widget builders. Scope creep. Ship fixed layouts first |
| **Third-party app marketplace** | Network effects game. Requires critical mass first |
| **Real-time collaboration** | Google Docs-style co-editing. Overkill for ops data |
| **Email integration** | Gmail/Outlook sync. WhatsApp is the primary channel. Defer |

---

## 8. Pricing Model

```
┌─────────────────────────────────────────────────────────────────┐
│                         PRICING TIERS                           │
├──────────────┬──────────┬───────────┬───────────┬───────────────┤
│              │  FREE    │  STARTER   │   PRO     │  ENTERPRISE   │
├──────────────┼──────────┼───────────┼───────────┼───────────────┤
│ Price        │  ₹0      │  ₹999/mo   │ ₹2,999/mo  │  Custom       │
│ Projects     │  1       │  3         │ 15        │  Unlimited    │
│ Orders/mo    │  50      │  Unlimited │ Unlimited │  Unlimited    │
│ AI Features  │  ❌     │  ✅       │ ✅        │  ✅          │
│ Integrations │  1       │  3         │ Unlimited │  Unlimited    │
│ Team Seats   │  1       │  3         │ 10        │  Unlimited    │
│ Client Portal│  ❌     │  ❌       │ ✅        │  ✅          │
│ Invoicing    │  ❌     │  Basic     │ Full      │  Full + GST   │
│ Support      │  Community│ Email      │ Priority  │  Dedicated    │
└──────────────┴──────────┴───────────┴───────────┴───────────────┘

Annual billing: 2 months free (₹9,999/yr for Starter, ₹29,999/yr for Pro)
```

---

## 9. Cost Estimates

### Monthly Operating Costs (at 100 paying customers)

| Item | Cost | Notes |
|------|------|-------|
| **Vercel Pro** | $20/mo | Production hosting |
| **Neon PostgreSQL** | $19/mo | Scale to zero, 10GB storage |
| **OpenAI API (AI)** | $80-165/mo | GPT-5-mini at peak usage |
| **Stripe** | 2.9% + ₹3/transaction | Payment processing |
| **Vercel AI Gateway** | $5/mo (free tier) | Included in Pro |
| **Total** | **~$124-209/mo** | Scales with customers |

### Per-User Economics

| Metric | Value |
|--------|-------|
| AI cost per lead scored | ~$0.0001 (0.01 paisa) |
| AI cost per order extracted | ~$0.0003 (0.03 paisa) |
| AI cost per NL query | ~$0.00016 (0.016 paisa) |
| Infrastructure per customer | ~$2-5/mo at scale |
| Gross margin (Starter) | ~85%+ |

---

## 10. Build Order — Dependency Graph

```
Phase 1                      Phase 2                      Phase 3
───────                      ───────                      ───────

AI Gateway Setup ──────┐
                       ├──▶ Lead Scoring ──────────┐
                       │                           ├──▶ NL Query
                       ├──▶ Order Extraction ─────┤
                       │                           │
                       │    Razorpay/Stripe ───────┤
                       │                           │
                       │    WhatsApp Activation ───┤
                       │                           ├──▶ Financial Module ──▶ GA4
                       │                           │
                       │    Follow-up Drafting ────┘
                       │
                       │    Mobile PWA ─────────────────────────▶ Client Portal
                       │
                       │                                        Pricing Page
                       │                                            │
                       │                                    Stripe Billing ──▶ Feature Gating
```

---

## 11. Success Metrics

### V1.0 Launch Criteria

| Metric | Target | How to Measure |
|--------|--------|---------------|
| **AI lead scoring accuracy** | >85% agreement with manual scoring | 100-lead validation set, compare AI vs human |
| **Order extraction precision** | >90% of extracted fields correct | Manual audit of 50 extracted orders |
| **NL query success rate** | >80% first-attempt correct answer | User feedback on 100 queries |
| **Page load time** | <500ms for all pages | Lighthouse, Vercel Analytics |
| **Mobile usability** | All core pages usable on 375px width | Responsive design audit |
| **Build health** | 0 TS errors, 0 warnings | `next build` output |
| **Monthly AI cost per active user** | <₹5/user | OpenAI usage dashboard |

### Business Milestones

| Milestone | Target | Timeline |
|-----------|--------|----------|
| Public beta (free tier only) | 10 active users | Month 4 |
| Paid plans go live | 5 paying customers | Month 5 |
| V1.0 stable release | 25 active projects | Month 6 |
| Monthly revenue | ₹25,000+ | Month 6 |

---

## 12. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **OpenAI API pricing changes** | Medium | High | Vercel AI Gateway abstracts providers; can switch to Anthropic or Google in 1 day |
| **WhatsApp API approval delays** | High | Medium | System works with local save fallback; not a blocker for other features |
| **User adoption — manual data entry friction** | Medium | High | Razorpay/Stripe integration (Phase 2) reduces entry; WhatsApp extraction reduces it further |
| **AI hallucination in order extraction** | Low | Medium | Always show extracted data for user confirmation before committing; confidence flag |
| **Single-developer bus factor** | Medium | High | Document all patterns in code; use established libraries (Vercel AI SDK, Prisma); avoid custom infra |
| **Mobile PWA not sticky enough** | Medium | Low | Start with responsive web; build native app only if retention data justifies it |
| **GPT-5-mini deprecation** | Low | Medium | Vercel AI Gateway will handle model versioning; migrate when needed |

---

## 13. Open Questions

| Question | Decision Needed By | Who Decides |
|----------|-------------------|-------------|
| **Should we use Vercel AI Gateway (free tier) or direct OpenAI API?** | Before Phase 1 starts | Developer |
| **GST invoicing — integrated or external (e.g., ClearTax API)?** | Phase 2 financial module | Developer + Compliance |
| **Client portal — magic link auth or shared password?** | Phase 3 client portal | Product |
| **WhatsApp Business API — user's own Meta account or shared?** | Varies per user | User |
| **Pricing — fixed INR or USD?** | Before Phase 3 | Product |
| **Free tier — truly free forever or time-limited trial?** | Before Phase 3 | Product |
| **Do we keep the Content module or remove/archive it?** | Before V1 release | Product |

---

## Quick Reference — Key File Paths

### Phase 1 (AI Foundation)
| File | Purpose |
|------|---------|
| `src/lib/ai/index.ts` | AI client singleton, model config |
| `src/lib/ai/score-lead.ts` | Lead scoring function |
| `src/lib/ai/extract-order.ts` | WhatsApp order extraction |
| `src/lib/actions/leads.ts` | Integrate scoring into createLead |

### Phase 2 (Core Upgrades)
| File | Purpose |
|------|---------|
| `src/lib/integrations/payments.ts` | Razorpay/Stripe client |
| `src/lib/actions/payments.ts` | Payment sync actions |
| `src/lib/ai/query-data.ts` | NL-to-Prisma query tools |
| `src/lib/ai/draft-followup.ts` | Follow-up drafting |
| `src/components/ai/QueryBar.tsx` | NL query input component |
| `src/app/manifest.ts` | PWA manifest |

### Phase 3 (Launch)
| File | Purpose |
|------|---------|
| `src/lib/billing/plan.ts` | Plan definitions + limits |
| `src/lib/billing/stripe.ts` | Stripe subscription setup |
| `src/app/(marketing)/pricing/page.tsx` | Public pricing |

---

**Chiti Technologies © 2026**  
*This document is the execution plan for V1.0. Update as decisions are made and features are shipped.*
