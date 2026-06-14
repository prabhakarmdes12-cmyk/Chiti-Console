"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface NumberTickerProps {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}

export default function NumberTicker({ value, suffix = "", prefix = "", decimals = 0, duration = 1.5, className }: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
    >
      {prefix}
      <CountUp target={value} isActive={isInView} decimals={decimals} duration={duration} />
      {suffix}
    </motion.span>
  );
}

function CountUp({ target, isActive, decimals, duration }: { target: number; isActive: boolean; decimals: number; duration: number }) {
  const [display, setDisplay] = useState("0");
  const frameRef = useRef(0);

  useEffect(() => {
    if (!isActive) return;
    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = (now - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = 0 + (target - 0) * eased;
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
