interface ChitiTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export default function ChitiTextarea({ label, error, className = "", ...props }: ChitiTextareaProps) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm text-text-muted">{label}</label>}
      <textarea
        className={`w-full px-3 py-2 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 resize-vertical min-h-[80px] ${
          error ? "border-error" : ""
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
