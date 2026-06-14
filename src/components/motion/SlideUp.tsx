"use client";

import { motion } from "framer-motion";

interface SlideUpProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export default function SlideUp({ children, className, delay = 0 }: SlideUpProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}
