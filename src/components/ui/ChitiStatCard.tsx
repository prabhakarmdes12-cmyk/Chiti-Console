import type { LucideIcon } from "lucide-react";

interface ChitiStatCardProps {
  label: string;
  value: string;
  change?: string;
  changeLabel?: string;
  icon: LucideIcon;
  color?: string;
  glow?: boolean;
}

export default function ChitiStatCard({
  label,
  value,
  change,
  changeLabel = "vs yesterday",
  icon: Icon,
  color = "text-brand-primary",
  glow = false,
}: ChitiStatCardProps) {
  const isPositive = change?.startsWith("+");
  const changeColor = change ? (isPositive ? "text-success" : "text-error") : "";

  return (
    <div className="relative overflow-hidden glass-card p-6 rounded-2xl">
      {glow && <div className="chiti-glow -top-20 -right-20" />}
      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted">{label}</span>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <p className="display-metrics">{value}</p>
        {change && (
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span className={`label-caps ${changeColor} bg-${isPositive ? "success" : "error"}/10 px-2 py-1 rounded-full`}>
              {change}
            </span>
            <span>{changeLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}
