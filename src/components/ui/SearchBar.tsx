"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface SearchBarProps {
  placeholder?: string;
  param?: string;
}

export default function SearchBar({ placeholder = "Search...", param = "q" }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get(param) || "");
  const timer = useRef(0);
  const initialRef = useRef(false);

  useEffect(() => {
    if (!initialRef.current) {
      initialRef.current = true;
      return;
    }
    setValue(searchParams.get(param) || "");
  }, [searchParams, param]);

  const handleChange = (val: string) => {
    setValue(val);
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (val) {
        params.set(param, val);
      } else {
        params.delete(param);
      }
      params.delete("page");
      router.push(`?${params.toString()}`);
    }, 300);
  };

  const clear = () => {
    setValue("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete(param);
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
      <input
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 rounded-lg bg-surface-2 border border-white/10 text-sm text-text-main placeholder:text-text-muted outline-none focus:border-brand-primary/50 transition-colors"
      />
      {value && (
        <button onClick={clear} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
