"use client";

import { Loader2 } from "lucide-react";

interface ChitiButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
}

const variants = {
  primary: "bg-brand-primary text-white hover:bg-brand-primary/90",
  secondary: "bg-surface-2 text-text-main hover:bg-surface-3 border border-white/10",
  ghost: "text-text-muted hover:text-text-main hover:bg-surface-2",
  danger: "bg-error/10 text-error hover:bg-error/20 border border-error/20",
};

const sizes = {
  sm: "px-3 py-2 text-xs",
  md: "px-4 py-3 text-sm",
  lg: "px-6 py-4 text-base",
};

export default function ChitiButton({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  children,
  className = "",
  disabled,
  ...props
}: ChitiButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 ${
        variants[variant]
      } ${sizes[size]} ${disabled || loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}
