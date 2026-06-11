interface ChitiCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
  hover?: boolean;
}

const paddings = {
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export default function ChitiCard({ children, className = "", padding = "md", hover = false }: ChitiCardProps) {
  return (
    <div
      className={`bg-surface-1 border border-white/10 rounded-xl ${paddings[padding]} ${
        hover ? "hover:border-white/20 transition-colors" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
