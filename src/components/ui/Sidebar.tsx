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
  ShieldCheck,
  Settings,
  ChevronDown,
  ChevronRight,
  Building2,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Orders", href: "/orders", icon: ShoppingCart },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Products", href: "/products", icon: Package },
  { label: "Leads", href: "/leads", icon: Target },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "WhatsApp", href: "/whatsapp", icon: MessageCircle },
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
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-brand-primary" />
          <span className="text-text-main font-display font-bold text-lg">Chiti Console</span>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {/* Projects expandable */}
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
              pathname.startsWith("/projects")
                ? "bg-brand-primary/10 text-brand-primary font-medium"
                : "text-text-muted hover:text-text-main hover:bg-surface-2"
            }`}
          >
            <div className="flex items-center gap-3">
              <Building2 className="w-4 h-4" />
              Projects
            </div>
            {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
          {expanded && (
            <div className="ml-2 mt-0.5 space-y-0.5 border-l border-white/10">
              <Link
                href="/projects"
                className={`flex items-center gap-3 pl-9 pr-3 py-1.5 rounded-lg text-xs transition-all duration-150 ${
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
                    className={`flex items-center gap-3 pl-9 pr-3 py-1.5 rounded-lg text-xs transition-all duration-150 ${
                      isActive
                        ? "text-brand-primary font-medium"
                        : "text-text-muted hover:text-text-main"
                    }`}
                  >
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
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                isActive
                  ? "bg-brand-primary/10 text-brand-primary font-medium"
                  : "text-text-muted hover:text-text-main hover:bg-surface-2"
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center">
            <span className="text-xs text-brand-primary font-bold">PK</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-text-main truncate">Prabhakar Kumar</p>
            <p className="text-xs text-text-muted truncate">Super Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
