# Chiti Console — Design Guide

**Version:** 1.0  
**Status:** Draft  
**Based on:** Chiti Technologies Unified Design System v3

---

## 1. Design Tokens (from `tokens.json`)

### 1.1 Color Palette

```css
/* Brand */
--color-brand-primary: hsl(260, 100%, 65%);     /* Purple */
--color-brand-secondary: hsl(190, 100%, 50%);    /* Cyan */

/* Dark Theme (DEFAULT) */
--color-bg: hsl(220, 10%, 4%);                    /* Near-black */
--color-surface-1: hsl(220, 10%, 8%);             /* Cards, panels */
--color-surface-2: hsl(220, 10%, 12%);            /* Elevated surfaces */
--color-surface-3: hsl(220, 10%, 16%);            /* Hover states */
--color-text-main: hsl(0, 0%, 98%);               /* Primary text */
--color-text-muted: hsl(220, 10%, 65%);           /* Secondary text */

/* Light Theme */
--color-bg-light: hsl(0, 0%, 98%);
--color-surface-1-light: hsl(0, 0%, 100%);
--color-surface-2-light: hsl(0, 0%, 95%);
--color-text-main-light: hsl(220, 10%, 10%);
--color-text-muted-light: hsl(220, 10%, 40%);

/* Semantic */
--color-success: hsl(150, 80%, 40%);
--color-info: hsl(210, 90%, 50%);
--color-warning: hsl(35, 90%, 50%);
--color-error: hsl(350, 80%, 55%);

/* DataViz (colorblind-safe) */
--color-dataviz-sapphire: hsl(215, 90%, 55%);
--color-dataviz-teal: hsl(175, 80%, 45%);
--color-dataviz-amber: hsl(45, 95%, 60%);
--color-dataviz-rose: hsl(340, 80%, 65%);

/* Glassmorphism */
--glass-border: 1px solid rgba(255, 255, 255, 0.08);
--glass-blur: 12px;
```

### 1.2 Typography

| Usage | Font | Weight | Size Scale |
|-------|------|--------|------------|
| **Display / Metrics** | Outfit | 700 (bold) for KPIs, 300 (light) for large numbers | `xs` to `5xl` |
| **Body / UI** | Inter | 400 (regular), 500 (medium), 600 (semibold) | `sm` to `lg` |
| **Code / Data** | JetBrains Mono | 400 (regular) | `xs` to `md` |

### 1.3 Spacing (8pt Grid)

```
--space-1: 4px
--space-2: 8px
--space-3: 16px
--space-4: 24px
--space-5: 32px
--space-6: 48px
--space-8: 64px
```

### 1.4 Motion

```
--duration-fast: 150ms
--duration-normal: 300ms
--duration-slow: 500ms

--ease-in: cubic-bezier(0.4, 0, 1, 1)
--ease-out: cubic-bezier(0, 0, 0.2, 1)
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)

Spring defaults:
  Default: stiffness 300, damping 20
  Modal: stiffness 150, damping 15
```

---

## 2. Component Usage

### 2.1 ChitiCard (Glass-Metric)

**Purpose:** Dashboard metric cards, data containers.

```tsx
// KPI Card
<ChitiCard variant="glass" padding="md">
  <div className="flex items-center gap-2">
    <ShoppingCartIcon className="w-5 h-5 text-brand-secondary" />
    <span className="text-sm text-text-muted">Orders Today</span>
  </div>
  <p className="text-4xl font-bold font-display text-text-main">12</p>
  <span className="text-xs text-success">↑ 20% vs yesterday</span>
</ChitiCard>
```

**States:**
- Default: Glass surface with subtle border
- Hover: Slight scale (1.02) with spring animation
- Loading: ChitiSkeleton with shimmer
- Empty: Dashed border with "No data" message

### 2.2 ChitiButton

| Variant | Usage | Colors |
|---------|-------|--------|
| `solid` | Primary actions (Create, Save) | Brand primary bg |
| `cinematic` | Premium CTAs (deploy, export) | Gradient brand-primary → brand-secondary |
| `ghost` | Secondary actions (Cancel, Back) | Transparent, text-muted |
| `danger` | Destructive (Delete) | Error color |

### 2.3 ChitiInput

**Pattern:**
- Label: Inter 600, text-muted, space-1 above input
- Input: Surface-1 bg, glass border, 56px height
- Focus: Brand primary border + 4px glow ring
- Error: Error color border + error message below (Inter 400, space-1 gap)
- Loading: Skeleton placeholder

### 2.4 Data Table (Zebra Density)

**Pattern:**
- Sticky header with glassmorphic background
- Alternating row colors (surface-1 → surface-2)
- Row hover: 300ms spring transition to surface-2 → surface-3
- Compact density for executive dashboards
- Zebra-striped for readability
- Skeleton shimmer for loading rows

### 2.5 Status Badges

| Status | Color |
|--------|-------|
| Pending | Warning (amber) |
| Confirmed | Info (blue) |
| Processing | Brand secondary (cyan) |
| Shipped | Brand primary (purple) |
| Delivered | Success (green) |
| Cancelled | Error (red) |

---

## 3. Layout Grid

### 3.1 Dashboard Layout

```
┌─────────────────────────────────────────────────────┐
│  SIDEBAR          MAIN CONTENT                       │
│  ─────────                                         │
│  260px            fluid (calc(100vw - 260px))       │
│  ┌──────┐        ┌──────────────────────────────┐  │
│  │ Logo │        │  TopNav (64px)               │  │
│  ├──────┤        ├──────────────────────────────┤  │
│  │ Nav  │        │  Content (scrollable)        │  │
│  │ Items│        │  ┌─────┐ ┌─────┐ ┌─────┐   │  │
│  │      │        │  │KPI  │ │KPI  │ │KPI  │   │  │
│  │      │        │  └─────┘ └─────┘ └─────┘   │  │
│  │      │        │                              │  │
│  │User  │        │  ┌─────────────────────────┐ │  │
│  │Card  │        │  │ Chart / Table           │ │  │
│  └──────┘        │  └─────────────────────────┘ │  │
│                  └──────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### 3.2 Grid System

- 12-column grid
- Gap: space-4 (24px)
- Max width: 1440px (wider than standard 1200px for data density)
- Sidebar: 260px fixed
- TopNav: 64px fixed height

### 3.3 Density Modes

| Mode | Usage | Card Padding | Table Row Height |
|------|-------|-------------|------------------|
| **Default** | Standard dashboard | space-5 (32px) | 56px |
| **Compact** | Data-heavy lists | space-3 (16px) | 40px |

---

## 4. Animation Guidelines

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Page transitions | Fade + slide up | 300ms | spring(damping: 20) |
| Modal open | Scale + fade | 300ms | spring(stiffness: 150, damping: 15) |
| Sidebar toggle | Slide | 200ms | ease-out |
| List stagger | Cascade | 50ms per item | ease-out |
| Row hover | Background shift | 300ms | spring(damping: 20) |
| Skeleton | Shimmer sweep | 1.5s loop | linear |
| Status badge change | Pulse + color shift | 400ms | spring(damping: 15) |

### Reduced Motion

Wrap all animations in `prefers-reduced-motion: reduce` media query. When detected, use 0ms cross-fades.

```css
@media (prefers-reduced-motion: reduce) {
  .animate-card {
    transition: none;
  }
}
```

---

## 5. UX Writing (Console-Specific)

- **Voice:** Confident, precise, authoritative (Enterprise SaaS tone)
- **No exclamation points** in UI copy
- **Buttons:** Always specific verbs — "Create Project", not "Submit"; "Update Status", not "OK"
- **Empty states:** Explain what to do — "No orders yet. Connect your store or add one manually."
- **Errors:** Follow formula: `[What went wrong] + [Why] + [How to fix]`

### Examples

| Context | Copy |
|---------|------|
| Empty order list | "No orders yet. Track your first order manually or connect WhatsApp to auto-capture them." |
| Error loading chart | "Could not load analytics data. The API may be temporarily unavailable. Retry." |
| Successful action | "Order #BB-0042 updated to Shipped." |
| Delete confirmation | "Delete this customer? This will also remove their order history. This action cannot be undone." |
