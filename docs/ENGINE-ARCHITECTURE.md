# Engine Architecture

## Overview

Chiti Console uses a **capability-driven engine architecture**. Each project has a set of capabilities (enabled/disabled per project), and the system dispatches views, nav items, and business logic based on which capabilities are active.

## Capabilities

| Capability | Label | Depends On | Provides |
|---|---|---|---|
| `COMMERCE` | Commerce | — | Orders, Products, Inventory |
| `MARKETPLACE` | Marketplace | COMMERCE | Vendors, Listings, Enquiries, Bookings |
| `CRM` | CRM | — | Customers, Leads, WhatsApp |
| `FINANCE` | Finance | MARKETPLACE | Escrow, Payouts, Refunds, Wallets |
| `CONTENT` | Content | — | CMS, Blog, Pages |
| `ANALYTICS` | Analytics | — | Reports, Dashboards |
| `AI` | AI | — | Business Assistant, Automation |

Dependencies are enforced: `FINANCE` requires `MARKETPLACE`, `MARKETPLACE` requires `COMMERCE`. Enabling a capability auto-enables its dependencies; disabling a dependency removes dependent capabilities.

## Engine Registry

File: `src/engines/registry.ts`

The `ENGINE_REGISTRY` map defines each engine's:
- `id` — capability name
- `label`, `description` — display info
- `dependsOn` — prerequisite capabilities
- `navItems` — sidebar navigation items contributed by this engine
- `dashboardSection` — which dashboard section (if any) this engine unlocks

## Utilities

File: `src/engines/capabilities.ts`

- `hasCapability(enabled, cap)` — single check
- `hasAllCapabilities(enabled, required)` — all required present
- `hasAnyCapability(enabled, required)` — any present
- `getEnabledEngines(enabled)` — returns capabilities with deps met
- `getEngineNavItems(enabled)` — all nav items from enabled engines
- `getDashboardSections(enabled)` — deduplicated dashboard sections
- `projectTypeToCapabilities(type)` — legacy type → capabilities mapping
- `getDefaultNavItems()` — Dashboard, Analytics, Settings, System

## Identity Engine

File: `src/engines/identity/lib/`

Core auth/rbac/capabilities helpers shared across the app:

| Function | File | Purpose |
|---|---|---|
| `authenticate()` | `auth.ts` | JWT + API-key dual auth |
| `requireRole(roles)` | `auth.ts` | Middleware-friendly role guard |
| `getCurrentUser()` | `rbac.ts` | Server-side user lookup |
| `getCurrentUserRole()` | `rbac.ts` | Current user's role |
| `getAccessibleProjects()` | `rbac.ts` | Projects user can see |
| `roleAtLeast(minRole)` | `rbac.ts` | Role hierarchy check |
| `getProjectCapabilities(projectId)` | `capabilities.ts` | Read or default capabilities |
| `checkCapability(projectId, cap)` | `capabilities.ts` | Boolean capability check |

## Other Engines

| Engine | Directory | Key Exports |
|---|---|---|
| **Commerce** | `src/engines/commerce/` | `createOrder`, `updateOrderStatus`, `getProductMetrics`, `getCustomerMetrics` |
| **Marketplace** | `src/engines/marketplace/` | `enquiryToBooking`, `lookupCommissionRate`, `getVendorKycStatus`, `getMarketplaceDashboardMetrics` |
| **CRM** | `src/engines/crm/` | `getLeadPipeline`, `getCustomerInsights`, `getWhatsAppMetrics` |
| **Finance** | `src/engines/finance/` | `releaseEscrow`, `cancelEscrow`, `createPayout`, `processPayout`, `approveRefund`, `processRefund`, `getFinanceSummary` |
| **Content** | `src/engines/content/` | `getContentMetrics`, `syncContent` |
| **Analytics** | `src/engines/analytics/` | `getRevenueMetrics`, `getDashboardMetrics` |
| **AI** | `src/engines/ai/` | `performQuery` (intent-based NL routing), `getBusinessInsights` |
| **Integration** | `src/engines/integration/` | `handleWebhook` (WhatsApp/Stripe/Razorpay), `verifyWhatsAppSignature`, `verifyRazorpaySignature` |

## Layered Filtering

Nav items pass through two filters:

1. **Capability filter** — only items from enabled engines are included
2. **Role filter** — only items permitted by the user's role are shown

Both must pass for an item to appear. Default items (Dashboard, Analytics, System, Settings) are always included and deduplicated by href.

## Dashboard Sections

Each capability can contribute a dashboard section via `dashboardSection` in the registry. The `DashboardClient` renders sections conditionally using `sections.includes(...)`. Multiple capabilities can map to the same section.

## Migration

To add a new capability:
1. Add it to the `Capability` enum in `prisma/schema.prisma`
2. Add an `EngineDefinition` in `src/engines/registry.ts`
3. Run migration: `npx prisma db push`
4. Seed: `npx prisma db seed`
