import type { LucideIcon } from "lucide-react";

interface ChitiStatCardProps {
  label: string;
  value: string;
  change?: string;
  changeLabel?: string;
  icon: LucideIcon;
  color?: string;
}

export default function ChitiStatCard({
  label,
  value,
  change,
  changeLabel = "vs yesterday",
  icon: Icon,
  color = "text-brand-primary",
}: ChitiStatCardProps) {
  return (
    <div className="bg-surface-1 border border-white/10 rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-text-muted">{label}</span>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <p className="text-3xl font-display font-bold text-text-main">{value}</p>
      {change && (
        <span className="text-xs text-success">
          {change} {changeLabel}
        </span>
      )}
    </div>
  );
}
