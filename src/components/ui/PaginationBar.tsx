"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationBarProps {
  total: number;
  pageSize?: number;
}

export default function PaginationBar({ total, pageSize = 20 }: PaginationBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (totalPages <= 1) return null;

  const go = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`?${params.toString()}`);
  };

  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
      <p className="text-xs text-text-muted">
        Page {currentPage} of {totalPages} ({total} results)
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => go(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="px-1.5 text-xs text-text-muted">...</span>
          ) : (
            <button
              key={p}
              onClick={() => go(p)}
              className={`min-w-[28px] h-7 rounded-lg text-xs font-medium transition-colors ${
                p === currentPage
                  ? "bg-brand-primary text-white"
                  : "text-text-muted hover:text-text-main hover:bg-surface-2"
              }`}
            >
              {p}
            </button>
          ),
        )}
        <button
          onClick={() => go(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
