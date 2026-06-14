interface ChitiCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
  hover?: boolean;
  glass?: boolean;
}

const paddings = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export default function ChitiCard({ children, className = "", padding = "md", hover = false, glass = false }: ChitiCardProps) {
  const base = glass
    ? "glass-card"
    : "bg-surface-1 border border-white/10 rounded-xl";
  const hov = hover
    ? glass
      ? "hover:border-brand-primary/25 transition-all duration-300"
      : "hover:border-white/20 hover:shadow-lg hover:shadow-black/10 transition-all duration-300"
    : "";

  return (
    <div className={`${base} rounded-xl ${paddings[padding]} ${hov} ${className}`}>
      {children}
    </div>
  );
}
