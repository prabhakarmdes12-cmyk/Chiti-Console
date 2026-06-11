interface ChitiBadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md";
  className?: string;
}

const styleMap = {
  default: "bg-surface-2 text-text-muted",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  error: "bg-error/10 text-error",
  info: "bg-info/10 text-info",
};

const sizes = {
  sm: "text-[10px] px-1.5 py-0.5",
  md: "text-xs px-2 py-0.5",
};

export default function ChitiBadge({ children, variant = "default", size = "md", className = "" }: ChitiBadgeProps) {
  return (
    <span className={`inline-flex items-center font-medium rounded-full ${styleMap[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}
