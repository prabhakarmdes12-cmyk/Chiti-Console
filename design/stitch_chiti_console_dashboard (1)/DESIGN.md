---
name: Chiti Lumina
colors:
  surface: '#121318'
  surface-dim: '#121318'
  surface-bright: '#38393f'
  surface-container-lowest: '#0d0e13'
  surface-container-low: '#1a1b21'
  surface-container: '#1e1f25'
  surface-container-high: '#292a2f'
  surface-container-highest: '#34343a'
  on-surface: '#e3e1e9'
  on-surface-variant: '#cbc3d7'
  inverse-surface: '#e3e1e9'
  inverse-on-surface: '#2f3036'
  outline: '#958ea0'
  outline-variant: '#494454'
  surface-tint: '#d0bcff'
  primary: '#d0bcff'
  on-primary: '#3c0091'
  primary-container: '#a078ff'
  on-primary-container: '#340080'
  inverse-primary: '#6d3bd7'
  secondary: '#bdf4ff'
  on-secondary: '#00363d'
  secondary-container: '#00e3fd'
  on-secondary-container: '#00616d'
  tertiary: '#ddb7ff'
  on-tertiary: '#490080'
  tertiary-container: '#b76dff'
  on-tertiary-container: '#400071'
  error: '#EF4444'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#d0bcff'
  on-primary-fixed: '#23005c'
  on-primary-fixed-variant: '#5516be'
  secondary-fixed: '#9cf0ff'
  secondary-fixed-dim: '#00daf3'
  on-secondary-fixed: '#001f24'
  on-secondary-fixed-variant: '#004f58'
  tertiary-fixed: '#f0dbff'
  tertiary-fixed-dim: '#ddb7ff'
  on-tertiary-fixed: '#2c0051'
  on-tertiary-fixed-variant: '#6900b3'
  background: '#121318'
  on-background: '#e3e1e9'
  surface-variant: '#34343a'
  surface-1: '#14161F'
  surface-2: '#1E212E'
  surface-3: '#282C3D'
  text-main: '#FAFAFA'
  text-muted: '#94A3B8'
  success: '#10B981'
  warning: '#F59E0B'
  info: '#3B82F6'
typography:
  display-metrics:
    fontFamily: Outfit
    fontSize: 48px
    fontWeight: '300'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
  data-table:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.2'
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.08em
  headline-lg-mobile:
    fontFamily: Outfit
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  sidebar-width: 260px
  topnav-height: 64px
  gutter: 24px
  margin-page: 32px
  card-padding: 24px
  card-padding-compact: 16px
---

## Brand & Style

The design system follows a **High-Intensity Glassmorphism** aesthetic, optimized for a technical, high-performance console environment. It targets power users who manage complex data-driven workflows, evoking a sense of "Mission Control" through a premium dark-mode interface.

The brand personality is **Technical, Visionary, and Precise**. It balances the clinical accuracy required for data management with a futuristic, optimistic energy.

### Design Principles
- **Atmospheric Depth:** Visual hierarchy is established through "light-leaks" (glows) and physical layering rather than traditional drop shadows.
- **Glassmorphism:** Surfaces are treated as semi-transparent panels with 1px semi-transparent borders and 12px backdrop blurs to maintain context and breathability.
- **Data-Dense Clarity:** Using an 8pt grid to maximize information density without sacrificing legibility or touch targets.
- **Luminescent Accents:** High-vibrancy primary and secondary colors (Purple and Cyan) are used sparingly to draw attention to critical actions and active states.

## Colors

The palette is built on a high-contrast dark foundation. The primary colors utilize HSL-based vibrancy to ensure they "pop" against dark surfaces.

- **Primary (Purple):** Used for primary CTAs, focus rings, and high-impact branding.
- **Secondary (Cyan):** Used for technical accents, secondary data points, and decorative progress indicators.
- **Surfaces:** Utilize a tiered HSL system (base 4% lightness to 16% lightness) to define depth.
- **Glows:** Primary and Secondary colors should be used with 15-25% opacity for background ambient glows behind glass panels.

## Typography

This design system uses a tri-font strategy to separate intent:
1. **Outfit:** Reserved for headlines and large KPI numbers. Use the Light (300) weight for massive numeric metrics and Bold (700) for structural headlines.
2. **Inter:** The workhorse for UI controls, body copy, and secondary labels. Use Medium (500) for standard interface labels to maintain legibility against glass backgrounds.
3. **JetBrains Mono:** Strictly for technical data, IDs, code snippets, and table values. This ensures alignment and a "developer-first" aesthetic.

**Scaling:** On mobile devices, Display Metrics should scale down to 36px to prevent overflow on portrait orientations.

## Layout & Spacing

The system is anchored to a strict **8pt grid**. All margins, paddings, and component heights must be multiples of 8px (with 4px used as a "half-step" for tight internal component spacing).

- **Grid:** A 12-column fluid grid is used for the main content area.
- **Sidebar:** Fixed at 260px. On screens smaller than 1024px, the sidebar transitions to a collapsed icon-only state (64px) or a hidden mobile drawer.
- **Content Area:** Fluid width with a maximum container of 1440px to ensure data doesn't become over-stretched on ultra-wide monitors.
- **Density:** Provide a "Compact" toggle that reduces vertical spacing in tables and cards by 33% for data-heavy monitoring tasks.

## Elevation & Depth

Depth is communicated through **Refractive Layers** rather than shadows. 

1. **The Floor:** The base background (`#0A0B10`) is the deepest layer.
2. **Surface 1 (Panels):** Use `surface-1` with 80% opacity, 12px backdrop-blur, and a 1px border (`rgba(255, 255, 255, 0.08)`).
3. **Surface 2 (Floating/Modals):** Use `surface-2` with 90% opacity and a slightly brighter border (`rgba(255, 255, 255, 0.15)`).
4. **Active Glows:** High-priority elements (like active project cards) should feature a `200px` radial-gradient "glow" positioned behind the card, using the Primary or Secondary color at 15% opacity.

## Shapes

The shape language is **Refined Geometry**. Elements use a consistent `0.5rem` (8px) base radius to feel modern but structured. 

- **Cards & Panels:** Standard `rounded-lg` (16px) to create a distinct container feel.
- **Inputs & Buttons:** Standard `rounded` (8px).
- **Badges:** Full pill-shape (`rounded-full`) to distinguish status indicators from interactive buttons.
- **Focus Rings:** Use a 2px offset with a 4px spread using the Primary color at 50% opacity.

## Components

### Buttons
- **Solid (Primary):** Brand-primary background with white text.
- **Cinematic (Action):** Linear gradient (Primary to Secondary) with a subtle outer glow on hover.
- **Ghost:** Transparent background, white border at 10% opacity, Primary color text.

### Input Fields
- **Background:** `surface-1` with a 1px glass border.
- **Focus State:** Border changes to Primary color with a subtle inner glow.
- **Height:** Standardized at 48px for comfort; 40px for compact views.

### Glass Cards (`ChitiCard`)
- Always include `backdrop-blur: 12px`.
- Border: `1px solid rgba(255, 255, 255, 0.08)`.
- Hover: Scale 1.02 with a spring transition (`stiffness: 300, damping: 20`).

### Status Badges
- Used with `JetBrains Mono` at 11px.
- Backgrounds are 15% opacity versions of the semantic color (Success, Warning, etc.) with a 100% opacity text color and a subtle left-side accent dot.

### Data Tables
- Header: Sticky with a glass background and 1px bottom border.
- Rows: Zebra striping using `surface-1` and `surface-2`.
- Text: All data values use `JetBrains Mono` for vertical alignment.