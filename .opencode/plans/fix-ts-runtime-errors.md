# Fix Runtime Errors (manifest + Server Components render)

## Root Causes Found

CSS classes OK (`glass-card`, `animate-float` are defined in globals.css). The likely cause is the `CountUp` component in `NumberTicker.tsx` rendering a `MotionValue<string>` as children of `<motion.span>`, which can fail during SSR hydration in framer-motion 12.

## Steps

### 1. Simplify `NumberTicker.tsx` — replace CountUp animation

Replace `useMotionValue`/`useSpring`/`useTransform` with `useState` + `useEffect` + `requestAnimationFrame` for a safe count-up.

**File:** `src/components/motion/NumberTicker.tsx`

Change import:
```tsx
import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
```

Replace `CountUp`:
```tsx
function CountUp({ target, isActive, decimals, duration }: { target: number; isActive: boolean; decimals: number; duration: number }) {
  const [display, setDisplay] = useState("0");
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!isActive) return;
    const startTime = performance.now();
    const startVal = 0;

    function animate(now: number) {
      const elapsed = (now - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (target - startVal) * eased;
      setDisplay(current.toFixed(decimals));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    }

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [isActive, target, decimals, duration]);

  return (
    <motion.span initial={{ opacity: 0 }} animate={isActive ? { opacity: 1 } : {}}>
      {display}
    </motion.span>
  );
}
```

Remove the inner `<motion.span>` wrapper in `CountUp`'s return — just render `{display}` directly.

### 2. Add `as const` to ease arrays

**File:** `src/components/motion/GlowCard.tsx` line 17:
```tsx
ease: [0.25, 0.1, 0.25, 1] as const
```

**File:** `src/components/motion/FadeIn.tsx` line 29:
```tsx
ease: [0.25, 0.1, 0.25, 1] as const
```

### 3. Add error boundary to DashboardClient

Create `src/components/ui/ErrorBoundary.tsx`:
```tsx
"use client";

import { Component, ReactNode } from "react";

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; }

export default class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false };

  static getDerivedStateFromError() { return { hasError: true }; }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-12 text-center text-text-muted text-sm">Something went wrong loading this section.</div>
      );
    }
    return this.props.children;
  }
}
```

Wrap the dashboard page content or `DashboardClient` with `<ErrorBoundary>`.

### 4. Verify and push

```bash
npx tsc --noEmit
npm run build
git add -A && git commit -m "fix: runtime errors in NumberTicker, ease types, and add error boundary"
git push
```
