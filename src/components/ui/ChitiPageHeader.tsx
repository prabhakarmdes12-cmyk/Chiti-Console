interface ChitiPageHeaderProps {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}

export default function ChitiPageHeader({ title, description, actions }: ChitiPageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-display font-bold text-text-main">{title}</h1>
        {description && <p className="text-text-muted text-sm mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
