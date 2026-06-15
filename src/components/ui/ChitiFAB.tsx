"use client";

import { Plus } from "lucide-react";
import Link from "next/link";

interface ChitiFABProps {
  href?: string;
  label?: string;
  onClick?: () => void;
}

export default function ChitiFAB({ href = "/orders/new", label = "Quick Order", onClick }: ChitiFABProps) {
  const base = "fixed bottom-20 sm:bottom-8 right-4 sm:right-8 w-12 h-12 sm:w-14 sm:h-14 bg-brand-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group";

  if (onClick) {
    return (
      <button onClick={onClick} className={base}>
        <Plus className="w-7 h-7" />
        <span className="absolute right-full mr-4 bg-surface-1 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity text-text-main">
          {label}
        </span>
      </button>
    );
  }

  return (
    <Link href={href} className={base}>
      <Plus className="w-7 h-7" />
      <span className="absolute right-full mr-4 bg-surface-1 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity text-text-main">
        {label}
      </span>
    </Link>
  );
}
