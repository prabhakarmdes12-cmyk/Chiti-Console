"use client";

import { Bell, Search, AppWindow, LogOut, Menu } from "lucide-react";
import { signOut } from "next-auth/react";
import { ReactNode } from "react";

interface TopNavProps {
  children?: ReactNode;
  onMenuToggle?: () => void;
}

export default function TopNav({ children, onMenuToggle }: TopNavProps) {
  return (
    <header className="h-16 border-b border-white/10 glass-card flex items-center justify-between px-4 sm:px-6 gap-3">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-surface-2 transition-colors"
          title="Toggle menu"
        >
          <Menu className="w-5 h-5 text-text-main" />
        </button>
        <div className="min-w-0">
          {children}
        </div>
        <div className="relative group hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search data..."
            className="bg-surface-2/50 border border-white/10 rounded-full pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary w-48 lg:w-64 transition-all text-text-main placeholder:text-text-muted"
          />
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <button className="p-2 rounded-lg hover:bg-surface-2 transition-colors group" title="Apps">
          <AppWindow className="w-4 h-4 text-text-muted group-hover:text-text-main transition-colors" />
        </button>
        <button className="relative p-2 rounded-lg hover:bg-surface-2 transition-colors group">
          <Bell className="w-4 h-4 text-text-muted group-hover:text-text-main transition-colors" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error animate-pulse" />
        </button>
        <div className="h-6 w-px bg-white/10" />
        <div className="hidden lg:block text-right">
          <p className="text-sm font-semibold text-text-main">Chiti Admin</p>
          <p className="text-xs text-text-muted">Operations Hub</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="p-2 rounded-lg text-text-muted hover:text-error hover:bg-surface-2 transition-all"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
