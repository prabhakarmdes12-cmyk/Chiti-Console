"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  Target,
  BarChart3,
  MessageCircle,
  FileText,
  Wallet,
  ShieldCheck,
  Settings,
  ChevronDown,
  ChevronRight,
  Building2,
  Sparkles,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Orders", href: "/orders", icon: ShoppingCart },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Products", href: "/products", icon: Package },
  { label: "Leads", href: "/leads", icon: Target },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "WhatsApp", href: "/whatsapp", icon: MessageCircle },
  { label: "Finance", href: "/finance", icon: Wallet },
  { label: "Content", href: "/content", icon: FileText },
  { label: "System", href: "/system", icon: ShieldCheck },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar({ projects }: { projects: { id: string; name: string }[] }) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(pathname.startsWith("/projects"));

  return (
    <aside className="w-60 min-h-screen bg-surface-1 border-r border-white/10 flex flex-col">
      <div className="p-5 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/30 transition-shadow">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-text-main font-display font-bold text-base block leading-tight">Chiti</span>
            <span className="text-[10px] text-text-muted font-medium tracking-wider uppercase">Console</span>
          </div>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {/* Projects expandable */}
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
              pathname.startsWith("/projects")
                ? "gradient-brand/10 text-brand-primary font-medium"
                : "text-text-muted hover:text-text-main hover:bg-surface-2"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <span>Projects</span>
            </div>
            {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
          {expanded && (
            <div className="ml-3 mt-0.5 space-y-0.5 border-l border-white/5">
              <Link
                href="/projects"
                className={`flex items-center gap-3 pl-10 pr-3 py-1.5 rounded-lg text-xs transition-all duration-150 ${
                  pathname === "/projects"
                    ? "text-brand-primary font-medium"
                    : "text-text-muted hover:text-text-main"
                }`}
              >
                All Projects
              </Link>
              {projects.map((p) => {
                const isActive = pathname === `/projects/${p.id}` || pathname.startsWith(`/projects/${p.id}/`);
                return (
                  <Link
                    key={p.id}
                    href={`/projects/${p.id}`}
                    className={`flex items-center gap-3 pl-10 pr-3 py-1.5 rounded-lg text-xs transition-all duration-150 ${
                      isActive
                        ? "text-brand-primary font-medium"
                        : "text-text-muted hover:text-text-main"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-success/60" />
                    {p.name}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group ${
                isActive
                  ? "text-brand-primary font-medium bg-brand-primary/10 glow-brand-sm"
                  : "text-text-muted hover:text-text-main hover:bg-surface-2"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full gradient-brand" />
              )}
              <div className="w-4 h-4 flex items-center justify-center">
                <Icon className={`w-4 h-4 ${isActive ? "text-brand-primary" : "text-text-muted group-hover:text-text-main transition-colors"}`} />
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full gradient-brand flex items-center justify-center shadow-lg shadow-purple-500/20">
            <span className="text-xs text-white font-bold">PK</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-text-main font-medium truncate">Prabhakar Kumar</p>
            <p className="text-xs text-text-muted truncate flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              Super Admin
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
