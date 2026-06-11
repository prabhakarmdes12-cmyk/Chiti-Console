"use client";

import { Search, Bell } from "lucide-react";
import { signOut } from "next-auth/react";

export default function TopNav() {

  return (
    <header className="h-16 border-b border-white/10 bg-surface-1/80 backdrop-blur-xl flex items-center justify-between px-6">
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <Search className="w-4 h-4 text-text-muted" />
        <input
          type="text"
          placeholder="Search orders, customers, projects..."
          className="bg-transparent text-text-main text-sm outline-none flex-1 placeholder:text-text-muted/50"
        />
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg hover:bg-surface-2 transition-colors">
          <Bell className="w-4 h-4 text-text-muted" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error" />
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
