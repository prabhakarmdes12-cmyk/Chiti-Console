import { LucideIcon } from "lucide-react";
import ChitiButton from "./ChitiButton";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick?: () => void; href?: string };
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-surface-2/50 border border-white/5 flex items-center justify-center mb-5 animate-float">
          <Icon className="w-7 h-7 text-text-muted/40" />
        </div>
      )}
      <h3 className="text-base font-display font-semibold text-text-main mb-1.5">{title}</h3>
      {description && <p className="text-sm text-text-muted max-w-xs mb-5">{description}</p>}
      {action && (
        <ChitiButton variant="primary" size="sm" onClick={action.onClick}>
          {action.label}
        </ChitiButton>
      )}
    </div>
  );
}
