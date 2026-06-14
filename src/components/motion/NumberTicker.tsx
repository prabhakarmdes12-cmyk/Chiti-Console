"use client";

import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

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
      <motion.span
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
      >
        <CountUp target={value} isActive={isInView} decimals={decimals} duration={duration} />
      </motion.span>
      {suffix}
    </motion.span>
  );
}

function CountUp({ target, isActive, decimals, duration }: { target: number; isActive: boolean; decimals: number; duration: number }) {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { stiffness: 50, damping: 20, duration });
  const rounded = useTransform(springValue, (v) => v.toFixed(decimals));

  useEffect(() => {
    if (isActive) motionValue.set(target);
  }, [isActive, target, motionValue]);

  return (
    <motion.span initial={{ opacity: 0 }} animate={isActive ? { opacity: 1 } : {}}>
      <motion.span>{rounded}</motion.span>
    </motion.span>
  );
}
