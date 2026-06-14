"use client";

import { Bell } from "lucide-react";
import { signOut } from "next-auth/react";
import { ReactNode } from "react";

export default function TopNav({ children }: { children?: ReactNode }) {
  return (
    <header className="h-16 border-b border-white/10 glass-card flex items-center justify-between px-6 gap-4">
      <div className="flex items-center gap-4 flex-1">
        {children}
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg hover:bg-surface-2 transition-colors group">
          <Bell className="w-4 h-4 text-text-muted group-hover:text-text-main transition-colors" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error animate-pulse" />
        </button>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-sm text-text-muted hover:text-text-main transition-colors"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
