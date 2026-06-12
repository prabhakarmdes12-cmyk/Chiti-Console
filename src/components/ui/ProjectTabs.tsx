"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Overview", href: "" },
  { label: "Orders", href: "/orders" },
  { label: "Products", href: "/products" },
  { label: "Customers", href: "/customers" },
];

interface ProjectTabsProps {
  projectId: string;
}

export default function ProjectTabs({ projectId }: ProjectTabsProps) {
  const pathname = usePathname();
  const base = `/projects/${projectId}`;

  return (
    <div className="flex gap-1 border-b border-white/10 mb-6">
      {tabs.map((tab) => {
        const href = base + tab.href;
        const isActive = tab.href === "" ? pathname === base : pathname.startsWith(href);
        return (
          <Link
            key={tab.href}
            href={href}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              isActive
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-text-muted hover:text-text-main"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
