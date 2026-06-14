"use client";

import { motion } from "framer-motion";

interface StaggerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  direction?: "up" | "none";
}

export default function Stagger({ children, className, staggerDelay = 0.08, direction = "up" }: StaggerProps) {
  const variants = {
    hidden: { opacity: 0, y: direction === "up" ? 16 : 0 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, delay: i * staggerDelay, ease: [0.25, 0.1, 0.25, 1] as const },
    }),
  };

  return (
    <div className={className}>
      {Array.isArray(children)
        ? children.map((child, i) => (
            <motion.div key={i} custom={i} initial="hidden" animate="visible" variants={variants}>
              {child}
            </motion.div>
          ))
        : children}
    </div>
  );
}
