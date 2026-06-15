"use client";

import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";

const variantStyles: Record<string, { bar: string; bg: string; icon: string }> = {
  error: { bar: "border-error", bg: "bg-error/10", icon: "text-error" },
  warning: { bar: "border-warning", bg: "bg-warning/10", icon: "text-warning" },
  primary: { bar: "border-brand-primary", bg: "bg-brand-primary/10", icon: "text-brand-primary" },
  info: { bar: "border-info", bg: "bg-info/10", icon: "text-info" },
  success: { bar: "border-success", bg: "bg-success/10", icon: "text-success" },
};

type Variant = "error" | "warning" | "primary" | "info" | "success";

interface ChitiPriorityCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  variant?: Variant;
  onClick?: () => void;
  href?: string;
}

export default function ChitiPriorityCard({
  icon: Icon,
  title,
  description,
  variant = "primary",
  onClick,
  href,
}: ChitiPriorityCardProps) {
  const styles = variantStyles[variant];
  const base = `flex items-center gap-4 p-4 ${styles.bg} border-l-4 ${styles.bar} rounded-r-xl group hover:${styles.bg.replace("/10", "/15")} transition-all cursor-pointer`;

  const inner = (
    <>
      <Icon className={`w-5 h-5 ${styles.icon} shrink-0`} />
      <div className="flex-1 min-w-0">
        <p className="text-text-main font-semibold text-sm">{title}</p>
        <p className="text-text-muted text-xs">{description}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </>
  );

  if (href) {
    return (
      <a href={href} className={base}>
        {inner}
      </a>
    );
  }

  return (
    <div className={base} onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onClick?.()}>
      {inner}
    </div>
  );
}
