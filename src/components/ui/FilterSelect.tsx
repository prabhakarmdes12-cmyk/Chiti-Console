"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface FilterSelectProps {
  param: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export default function FilterSelect({ param, options, placeholder = "All" }: FilterSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const value = searchParams.get(param) || "";

  const handleChange = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val) {
      params.set(param, val);
    } else {
      params.delete(param);
    }
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  return (
    <select
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      className="px-3 py-2 rounded-lg bg-surface-2 border border-white/10 text-sm text-text-main outline-none focus:border-brand-primary/50 transition-colors"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}
