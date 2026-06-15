"use client";

import { ShoppingCart, TrendingUp, Users, DollarSign, AlertTriangle, MessageCircle, Package, ArrowRight, Sparkles, Building2, type LucideIcon } from "lucide-react";
import ChitiCard from "@/components/ui/ChitiCard";
import ChitiStatCard from "@/components/ui/ChitiStatCard";
import ChitiStatusBadge from "@/components/ui/ChitiStatusBadge";
import ChitiPriorityCard from "@/components/ui/ChitiPriorityCard";
import ChitiFAB from "@/components/ui/ChitiFAB";
import MonthlyRevenueChart from "@/components/charts/MonthlyRevenueChart";
import FadeIn from "@/components/motion/FadeIn";
import Link from "next/link";

interface Stat {
  label: string;
  value: number;
  display: string;
  change: string;
  icon: LucideIcon;
  gradient: string;
}

interface AttentionItem {
  type: "lead" | "oos" | "wa" | "order";
  label: string;
  project: string;
  href: string;
}

interface DashboardClientProps {
  stats: Stat[];
  attentionItems: AttentionItem[];
  expectedRevenue: { current: number; previous: number; change: number };
  monthlyData: { month: string; revenue: number; orders: number }[];
  recentOrders: { id: string; orderNumber: string; totalAmount: number; status: string; customer: { name: string } | null }[];
  projects: { id: string; name: string }[];
}

const priorityVariant: Record<string, "error" | "warning" | "primary" | "info"> = {
  lead: "info",
  oos: "error",
  wa: "primary",
  order: "warning",
};

const priorityIcon: Record<string, LucideIcon> = {
  lead: Users,
  oos: Package,
  wa: MessageCircle,
  order: ShoppingCart,
};

export default function DashboardClient({ stats, attentionItems, expectedRevenue, monthlyData, recentOrders, projects }: DashboardClientProps) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <FadeIn key={stat.label} direction="up" delay={i * 0.1}>
            <ChitiStatCard
              label={stat.label}
              value={stat.display}
              change={stat.change}
              icon={stat.icon}
              glow
            />
          </FadeIn>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {attentionItems.length > 0 && (
          <FadeIn direction="up" delay={0.2}>
            <ChitiCard padding="md" glass>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <AlertTriangle className="w-3.5 h-3.5 text-white" />
                </div>
                <h2 className="text-sm font-medium text-text-main">Today&apos;s Priorities</h2>
                <span className="text-xs text-text-muted bg-surface-2/50 px-2 py-0.5 rounded-full">{attentionItems.length}</span>
              </div>
              <div className="space-y-3">
                {attentionItems.slice(0, 6).map((item, i) => (
                  <ChitiPriorityCard
                    key={i}
                    icon={priorityIcon[item.type]}
                    title={item.label}
                    description={item.project}
                    variant={priorityVariant[item.type]}
                    href={item.href}
                  />
                ))}
              </div>
              <button className="mt-6 w-full py-3 text-center text-xs label-caps tracking-widest text-text-muted hover:text-text-main transition-colors">
                VIEW ALL TASKS
              </button>
            </ChitiCard>
          </FadeIn>
        )}

        <FadeIn direction="up" delay={0.3}>
          <ChitiCard padding="md" glass>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <DollarSign className="w-3.5 h-3.5 text-white" />
              </div>
              <h2 className="text-sm font-medium text-text-main">Revenue Forecast</h2>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "This Month", value: `₹${expectedRevenue.current.toLocaleString("en-IN")}`, change: "" },
                { label: "Last Month", value: `₹${expectedRevenue.previous.toLocaleString("en-IN")}`, change: "" },
                { label: "Change", value: `${expectedRevenue.change >= 0 ? "+" : ""}${expectedRevenue.change.toFixed(1)}%`, positive: expectedRevenue.change >= 0 },
              ].map((item) => (
                <div key={item.label} className="bg-surface-2/30 rounded-lg p-3 text-center">
                  <p className="text-xs text-text-muted mb-1">{item.label}</p>
                  <p className={`text-lg font-display font-bold ${item.positive !== undefined ? (item.positive ? "text-success" : "text-error") : "text-text-main"}`}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </ChitiCard>
        </FadeIn>
      </div>

      <FadeIn direction="up" delay={0.4}>
        <ChitiCard padding="md" glass>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-white" />
              </div>
              <h2 className="text-sm font-medium text-text-main">Revenue Trend</h2>
            </div>
            <Link href="/analytics" className="text-xs text-brand-primary hover:text-brand-primary/80 transition-colors flex items-center gap-1">
              View full analytics <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <MonthlyRevenueChart data={monthlyData} />
        </ChitiCard>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FadeIn direction="up" delay={0.5}>
          <ChitiCard padding="md" glass>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                <ShoppingCart className="w-3.5 h-3.5 text-white" />
              </div>
              <h2 className="text-sm font-medium text-text-main">Recent Orders</h2>
            </div>
            <div className="space-y-1">
              {recentOrders.length === 0 && (
                <div className="py-8 text-center">
                  <ShoppingCart className="w-8 h-8 text-text-muted/30 mx-auto mb-2" />
                  <p className="text-sm text-text-muted">No orders yet</p>
                </div>
              )}
              {recentOrders.map((order) => (
                <Link key={order.id} href={`/orders/${order.id}`} className="flex items-center justify-between py-2.5 px-3 -mx-3 rounded-lg hover:bg-surface-2/40 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-surface-2/50 flex items-center justify-center">
                      <ShoppingCart className="w-3.5 h-3.5 text-text-muted" />
                    </div>
                    <div>
                      <p className="text-sm text-text-main font-medium">{order.customer?.name || "Unknown"}</p>
                      <p className="text-xs text-text-muted">{order.orderNumber}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <p className="text-sm text-text-main">₹{Number(order.totalAmount).toLocaleString("en-IN")}</p>
                      <ChitiStatusBadge status={order.status} type="order" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </div>
                </Link>
              ))}
            </div>
          </ChitiCard>
        </FadeIn>

        <FadeIn direction="up" delay={0.6}>
          <ChitiCard padding="md" glass>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <h2 className="text-sm font-medium text-text-main">Active Projects</h2>
            </div>
            <div className="space-y-1">
              {projects.length === 0 && (
                <div className="py-8 text-center">
                  <Building2 className="w-8 h-8 text-text-muted/30 mx-auto mb-2" />
                  <p className="text-sm text-text-muted">No active projects</p>
                </div>
              )}
              {projects.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`} className="flex items-center justify-between py-2.5 px-3 -mx-3 rounded-lg hover:bg-surface-2/40 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-surface-2/50 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    </div>
                    <span className="text-sm text-text-main group-hover:text-brand-primary transition-colors">{project.name}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                </Link>
              ))}
            </div>
          </ChitiCard>
        </FadeIn>
      </div>

      <ChitiFAB href="/orders/new" label="Quick Order" />
    </>
  );
}
