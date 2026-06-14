"use client";

import { motion } from "framer-motion";

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export default function GlowCard({ children, className, delay = 0 }: GlowCardProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
    >
      {children}
    </motion.div>
  );
}
