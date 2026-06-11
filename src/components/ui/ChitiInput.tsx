"use client";

import { useState } from "react";

interface ChitiInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export default function ChitiInput({ label, error, icon, className = "", ...props }: ChitiInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && <label className="text-sm text-text-main font-medium">{label}</label>}
      <div
        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-colors ${
          error
            ? "border-error bg-error/5"
            : focused
              ? "border-brand-primary bg-surface-2"
              : "border-white/10 bg-surface-2 hover:border-white/20"
        }`}
      >
        {icon && <span className="text-text-muted">{icon}</span>}
        <input
          className="bg-transparent text-text-main text-sm outline-none flex-1 placeholder:text-text-muted/50"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
