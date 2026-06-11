interface ChitiSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export default function ChitiSelect({ label, error, options, className = "", ...props }: ChitiSelectProps) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm text-text-muted">{label}</label>}
      <select
        className={`w-full px-3 py-2 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50 appearance-none ${
          error ? "border-error" : ""
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
