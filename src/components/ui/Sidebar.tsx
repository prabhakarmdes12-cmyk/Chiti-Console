"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 min-h-screen bg-surface-1 border-r border-white/10 flex flex-col">
      <div className="p-5 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-brand-primary" />
          <span className="text-text-main font-display font-bold text-lg">Chiti Console</span>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
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
