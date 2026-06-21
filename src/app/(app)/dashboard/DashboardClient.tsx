"use client";

import { ShoppingCart, TrendingUp, Users, DollarSign, AlertTriangle, MessageCircle, Package, ArrowRight, Sparkles, Building2, Wallet, Landmark, ReceiptText, ShieldCheck, BookOpen, GraduationCap, type LucideIcon } from "lucide-react";
import ChitiCard from "@/components/ui/ChitiCard";
import ChitiStatCard from "@/components/ui/ChitiStatCard";
import ChitiStatusBadge from "@/components/ui/ChitiStatusBadge";
import ChitiPriorityCard from "@/components/ui/ChitiPriorityCard";
import ChitiFAB from "@/components/ui/ChitiFAB";
import MonthlyRevenueChart from "@/components/charts/MonthlyRevenueChart";
import FadeIn from "@/components/motion/FadeIn";
import Link from "next/link";

const iconMap: Record<string, LucideIcon> = {
  DollarSign, ShoppingCart, Users, TrendingUp,
};

interface Stat {
  label: string; value: number; display: string; change: string; icon: string; gradient: string;
}

interface AttentionItem {
  type: "lead" | "oos" | "wa" | "order";
  label: string; project: string; href: string;
}

interface DashboardClientProps {
  capabilities?: string[];
  sections?: string[];
  stats: Stat[];
  attentionItems: AttentionItem[];
  expectedRevenue: { current: number; previous: number; change: number };
  monthlyData: { month: string; revenue: number; orders: number }[];
  recentOrders: { id: string; orderNumber: string; totalAmount: number; status: string; customer: { name: string } | null }[];
  projects: { id: string; name: string }[];
  ceoMetrics?: {
    todayRevenue: number; grossBookingValue: number; platformEarnings: number;
    pendingSettlement: number; escrowBalance: number; refunds: number;
    vendorPayoutToday: number; gstCollected: number;
  };
  marketplaceHealth?: {
    vendors: number; liveListings: number; pendingVendors: number;
    occupancy: number; averageRating: number; averageCommission: number;
  };
  customerFunnel?: {
    visitors: number; searches: number; hotelViews: number;
    bookingsStarted: number; paymentSuccess: number; completedStay: number;
  };
  vendorHealth?: Record<string, { pending: number; active: number; inactive: number; revenue: number; commission: number; topPerformer: string | null }>;
  moneyByCategory?: Record<string, { revenue: number; commission: number; gst: number }>;
  marketplacePriorities?: { type: string; label: string; amount?: number; severity: string }[];
  ecommerceMetrics?: {
    aov: number; activeProducts: number; oosCount: number;
    repeatBuyers: number; repeatRate: number; paidOrders: number;
  };
  topProducts?: { name: string; revenue: number; quantity: number }[];
  b2bMetrics?: {
    totalLeads: number; products: number; wonLeads: number; conversionRate: number;
  };
  pipelineStages?: Record<string, number>;
  saasMetrics?: {
    totalEnrollments: number; activeStudents: number; batches: number;
    newLeads: number; churned: number; churnRate: number;
  };
  contentMetrics?: {
    totalEntries: number; published: number; draft: number;
    totalViews: number; avgViewsPerEntry: number; subscribers: number;
  };
}

const priorityVariant: Record<string, "error" | "warning" | "primary" | "info"> = {
  lead: "info", oos: "error", wa: "primary", order: "warning",
};

const priorityIcon: Record<string, LucideIcon> = {
  lead: Users, oos: Package, wa: MessageCircle, order: ShoppingCart,
};

function formatMoney(value: number) {
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function MarketplaceSection({ ceoMetrics, marketplaceHealth, customerFunnel, vendorHealth, moneyByCategory, marketplacePriorities }: DashboardClientProps) {
  if (!ceoMetrics || !marketplaceHealth || !customerFunnel) return null;
  const moneyCards = [
    { label: "Today's Revenue", value: ceoMetrics.todayRevenue, icon: DollarSign, tone: "from-emerald-500 to-teal-500" },
    { label: "Gross Booking Value", value: ceoMetrics.grossBookingValue, icon: ShoppingCart, tone: "from-sky-500 to-cyan-500" },
    { label: "Platform Earnings", value: ceoMetrics.platformEarnings, icon: Landmark, tone: "from-violet-500 to-purple-500" },
    { label: "Pending Settlement", value: ceoMetrics.pendingSettlement, icon: Wallet, tone: "from-amber-500 to-orange-500" },
    { label: "Escrow Balance", value: ceoMetrics.escrowBalance, icon: ShieldCheck, tone: "from-blue-500 to-indigo-500" },
    { label: "Refunds", value: ceoMetrics.refunds, icon: AlertTriangle, tone: "from-rose-500 to-red-500" },
    { label: "Vendor Payout Today", value: ceoMetrics.vendorPayoutToday, icon: ReceiptText, tone: "from-lime-500 to-green-500" },
    { label: "GST Collected", value: ceoMetrics.gstCollected, icon: ReceiptText, tone: "from-fuchsia-500 to-pink-500" },
  ];
  const funnel = [
    ["Visitors", customerFunnel.visitors],
    ["Searches", customerFunnel.searches],
    ["Hotel Views", customerFunnel.hotelViews],
    ["Bookings Started", customerFunnel.bookingsStarted],
    ["Payment Success", customerFunnel.paymentSuccess],
    ["Completed Stay", customerFunnel.completedStay],
  ] as const;

  return (
    <>
      <FadeIn direction="up">
        <ChitiCard padding="md" glass glow>
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <p className="text-xs label-caps tracking-widest text-brand-primary mb-2">Marketplace Command Center</p>
              <h2 className="text-xl font-display font-bold text-text-main">Money, vendors, settlements, and operations</h2>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 text-success text-xs label-caps tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> LIVE CEO VIEW
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {moneyCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="rounded-xl bg-surface-2/35 border border-white/10 p-4 hover:border-brand-primary/20 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${card.tone} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[10px] label-caps tracking-widest text-text-muted">Today</span>
                  </div>
                  <p className="text-xs text-text-muted mb-1">{card.label}</p>
                  <p className="text-2xl font-display font-bold text-text-main">{formatMoney(card.value)}</p>
                </div>
              );
            })}
          </div>
        </ChitiCard>
      </FadeIn>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <FadeIn direction="up" delay={0.1}>
          <ChitiCard padding="md" glass>
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-4 h-4 text-brand-primary" />
              <h2 className="text-sm font-medium text-text-main">Marketplace Health</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Vendors", marketplaceHealth.vendors],
                ["Live", marketplaceHealth.liveListings],
                ["Pending", marketplaceHealth.pendingVendors],
                ["Occupancy", `${marketplaceHealth.occupancy}%`],
                ["Avg Rating", marketplaceHealth.averageRating.toFixed(1)],
                ["Avg Commission", `${marketplaceHealth.averageCommission.toFixed(1)}%`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-surface-2/30 p-3">
                  <p className="text-[11px] text-text-muted mb-1">{label}</p>
                  <p className="text-lg font-display font-bold text-text-main">{value}</p>
                </div>
              ))}
            </div>
          </ChitiCard>
        </FadeIn>

        <FadeIn direction="up" delay={0.15}>
          <ChitiCard padding="md" glass>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-brand-primary" />
              <h2 className="text-sm font-medium text-text-main">Customer Funnel</h2>
            </div>
            <div className="space-y-2">
              {funnel.map(([label, value], index) => {
                const max = funnel[0][1] || 1;
                const width = Math.max(8, Math.round((Number(value) / Number(max)) * 100));
                return (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-text-muted">{label}</span>
                      <span className="text-text-main font-medium">{Number(value).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-2/60 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary" style={{ width: `${width}%`, opacity: 1 - index * 0.08 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </ChitiCard>
        </FadeIn>

        <FadeIn direction="up" delay={0.2}>
          <ChitiCard padding="md" glass>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <h2 className="text-sm font-medium text-text-main">Today&apos;s Priorities</h2>
            </div>
            <div className="space-y-2">
              {(!marketplacePriorities || marketplacePriorities.length === 0) && <p className="text-sm text-text-muted py-8 text-center">No marketplace blockers today</p>}
              {marketplacePriorities?.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-3 rounded-lg bg-surface-2/30 p-3">
                  <div>
                    <p className="text-sm text-text-main">{item.label}</p>
                    <p className="text-[11px] text-text-muted label-caps tracking-widest">{item.type}</p>
                  </div>
                  {item.amount !== undefined && <span className="text-sm font-semibold text-warning">{formatMoney(item.amount)}</span>}
                </div>
              ))}
            </div>
          </ChitiCard>
        </FadeIn>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <FadeIn direction="up" delay={0.25}>
          <ChitiCard padding="md" glass>
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-4 h-4 text-brand-primary" />
              <h2 className="text-sm font-medium text-text-main">Money by Category</h2>
            </div>
            <div className="space-y-3">
              {moneyByCategory && Object.entries(moneyByCategory).map(([category, totals]) => (
                <div key={category} className="grid grid-cols-4 gap-3 items-center rounded-lg bg-surface-2/30 p-3">
                  <p className="text-sm text-text-main font-medium">{category.replace("_", " ")}</p>
                  <div><p className="text-[11px] text-text-muted">Revenue</p><p className="text-sm text-text-main">{formatMoney(totals.revenue)}</p></div>
                  <div><p className="text-[11px] text-text-muted">Commission</p><p className="text-sm text-success">{formatMoney(totals.commission)}</p></div>
                  <div><p className="text-[11px] text-text-muted">GST</p><p className="text-sm text-text-main">{formatMoney(totals.gst)}</p></div>
                </div>
              ))}
            </div>
          </ChitiCard>
        </FadeIn>

        <FadeIn direction="up" delay={0.3}>
          <ChitiCard padding="md" glass>
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-brand-primary" />
              <h2 className="text-sm font-medium text-text-main">Vendor Health</h2>
            </div>
            <div className="space-y-3">
              {vendorHealth && Object.entries(vendorHealth).map(([category, health]) => (
                <div key={category} className="rounded-lg bg-surface-2/30 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-text-main font-medium">{category.replace("_", " ")}</p>
                    <p className="text-xs text-text-muted">Top: {health.topPerformer || "-"}</p>
                  </div>
                  <div className="grid grid-cols-5 gap-2 text-xs">
                    <span className="text-success">Active {health.active}</span>
                    <span className="text-warning">Pending {health.pending}</span>
                    <span className="text-error">Inactive {health.inactive}</span>
                    <span className="text-text-main">{formatMoney(health.revenue)}</span>
                    <span className="text-brand-primary">{formatMoney(health.commission)}</span>
                  </div>
                </div>
              ))}
            </div>
          </ChitiCard>
        </FadeIn>
      </div>
    </>
  );
}

function EcommerceSection({ ecommerceMetrics, topProducts }: DashboardClientProps) {
  if (!ecommerceMetrics) return null;
  return (
    <>
      <FadeIn direction="up">
        <ChitiCard padding="md" glass glow>
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <p className="text-xs label-caps tracking-widest text-brand-primary mb-2">E-Commerce Overview</p>
              <h2 className="text-xl font-display font-bold text-text-main">Revenue, inventory, and customer health</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {[
              { label: "Average Order Value", value: formatMoney(ecommerceMetrics.aov), icon: DollarSign, tone: "from-emerald-500 to-teal-500" },
              { label: "Active Products", value: String(ecommerceMetrics.activeProducts), icon: Package, tone: "from-sky-500 to-cyan-500" },
              { label: "Out of Stock", value: String(ecommerceMetrics.oosCount), icon: AlertTriangle, tone: "from-rose-500 to-red-500" },
              { label: "Repeat Buyers", value: String(ecommerceMetrics.repeatBuyers), icon: Users, tone: "from-violet-500 to-purple-500" },
              { label: "Repeat Rate", value: `${ecommerceMetrics.repeatRate}%`, icon: TrendingUp, tone: "from-amber-500 to-orange-500" },
              { label: "Paid Orders", value: String(ecommerceMetrics.paidOrders), icon: ShoppingCart, tone: "from-blue-500 to-indigo-500" },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="rounded-xl bg-surface-2/35 border border-white/10 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${card.tone} flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <p className="text-xs text-text-muted mb-1">{card.label}</p>
                  <p className="text-xl font-display font-bold text-text-main">{card.value}</p>
                </div>
              );
            })}
          </div>
        </ChitiCard>
      </FadeIn>

      {topProducts && topProducts.length > 0 && (
        <FadeIn direction="up" delay={0.1}>
          <ChitiCard padding="md" glass>
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="w-4 h-4 text-brand-primary" />
              <h2 className="text-sm font-medium text-text-main">Top Products</h2>
            </div>
            <div className="space-y-2">
              {topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center justify-between rounded-lg bg-surface-2/30 p-3">
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-brand-primary/20 text-brand-primary text-xs font-bold flex items-center justify-center">{i + 1}</span>
                    <span className="text-sm text-text-main">{p.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-text-main">{formatMoney(p.revenue)}</p>
                    <p className="text-xs text-text-muted">{p.quantity} sold</p>
                  </div>
                </div>
              ))}
            </div>
          </ChitiCard>
        </FadeIn>
      )}
    </>
  );
}

function B2BSection({ b2bMetrics, pipelineStages }: DashboardClientProps) {
  if (!b2bMetrics) return null;
  return (
    <FadeIn direction="up">
      <ChitiCard padding="md" glass glow>
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <p className="text-xs label-caps tracking-widest text-brand-primary mb-2">B2B Catalog Overview</p>
            <h2 className="text-xl font-display font-bold text-text-main">RFQ pipeline, leads, and sales</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {[
            { label: "Total Leads", value: String(b2bMetrics.totalLeads), icon: Users, tone: "from-violet-500 to-purple-500" },
            { label: "Products", value: String(b2bMetrics.products), icon: Package, tone: "from-sky-500 to-cyan-500" },
            { label: "Won Deals", value: String(b2bMetrics.wonLeads), icon: TrendingUp, tone: "from-emerald-500 to-teal-500" },
            { label: "Conversion", value: `${b2bMetrics.conversionRate}%`, icon: DollarSign, tone: "from-amber-500 to-orange-500" },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="rounded-xl bg-surface-2/35 border border-white/10 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${card.tone} flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <p className="text-xs text-text-muted mb-1">{card.label}</p>
                <p className="text-xl font-display font-bold text-text-main">{card.value}</p>
              </div>
            );
          })}
        </div>
        {pipelineStages && (
          <div className="mt-4 grid grid-cols-3 sm:grid-cols-6 gap-2">
            {Object.entries(pipelineStages).map(([stage, count]) => (
              <div key={stage} className="rounded-lg bg-surface-2/30 p-3 text-center">
                <p className="text-lg font-display font-bold text-text-main">{count}</p>
                <p className="text-[10px] text-text-muted label-caps tracking-widest">{stage}</p>
              </div>
            ))}
          </div>
        )}
      </ChitiCard>
    </FadeIn>
  );
}

function SaasSection({ saasMetrics }: DashboardClientProps) {
  if (!saasMetrics) return null;
  return (
    <FadeIn direction="up">
      <ChitiCard padding="md" glass glow>
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <p className="text-xs label-caps tracking-widest text-brand-primary mb-2">Education Overview</p>
            <h2 className="text-xl font-display font-bold text-text-main">Students, enrollments, and retention</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {[
            { label: "Total Enrollments", value: String(saasMetrics.totalEnrollments), icon: GraduationCap, tone: "from-emerald-500 to-teal-500" },
            { label: "Active Students", value: String(saasMetrics.activeStudents), icon: Users, tone: "from-violet-500 to-purple-500" },
            { label: "Batches", value: String(saasMetrics.batches), icon: BookOpen, tone: "from-sky-500 to-cyan-500" },
            { label: "New Leads", value: String(saasMetrics.newLeads), icon: TrendingUp, tone: "from-blue-500 to-indigo-500" },
            { label: "Churned", value: String(saasMetrics.churned), icon: AlertTriangle, tone: "from-rose-500 to-red-500" },
            { label: "Churn Rate", value: `${saasMetrics.churnRate}%`, icon: ShieldCheck, tone: "from-amber-500 to-orange-500" },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="rounded-xl bg-surface-2/35 border border-white/10 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${card.tone} flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <p className="text-xs text-text-muted mb-1">{card.label}</p>
                <p className="text-xl font-display font-bold text-text-main">{card.value}</p>
              </div>
            );
          })}
        </div>
      </ChitiCard>
    </FadeIn>
  );
}

function ContentSection({ contentMetrics }: DashboardClientProps) {
  if (!contentMetrics) return null;
  return (
    <FadeIn direction="up">
      <ChitiCard padding="md" glass glow>
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <p className="text-xs label-caps tracking-widest text-brand-primary mb-2">Content Overview</p>
            <h2 className="text-xl font-display font-bold text-text-main">Views, subscribers, and engagement</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {[
            { label: "Total Entries", value: String(contentMetrics.totalEntries), icon: BookOpen, tone: "from-emerald-500 to-teal-500" },
            { label: "Published", value: String(contentMetrics.published), icon: Sparkles, tone: "from-sky-500 to-cyan-500" },
            { label: "Drafts", value: String(contentMetrics.draft), icon: Package, tone: "from-amber-500 to-orange-500" },
            { label: "Total Views", value: contentMetrics.totalViews.toLocaleString(), icon: TrendingUp, tone: "from-violet-500 to-purple-500" },
            { label: "Avg Views/Entry", value: String(contentMetrics.avgViewsPerEntry), icon: Users, tone: "from-blue-500 to-indigo-500" },
            { label: "Subscribers", value: String(contentMetrics.subscribers), icon: Users, tone: "from-rose-500 to-red-500" },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="rounded-xl bg-surface-2/35 border border-white/10 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${card.tone} flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <p className="text-xs text-text-muted mb-1">{card.label}</p>
                <p className="text-xl font-display font-bold text-text-main">{card.value}</p>
              </div>
            );
          })}
        </div>
      </ChitiCard>
    </FadeIn>
  );
}

export default function DashboardClient(props: DashboardClientProps) {
  const { sections = [], stats, attentionItems, expectedRevenue, monthlyData, recentOrders, projects } = props;

  return (
    <>
      {sections.includes("MARKETPLACE") && <MarketplaceSection {...props} />}
      {sections.includes("ECOMMERCE") && <EcommerceSection {...props} />}
      {sections.includes("B2B_CATALOG") && <B2BSection {...props} />}
      {sections.includes("SAAS") && <SaasSection {...props} />}
      {sections.includes("CONTENT") && <ContentSection {...props} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <FadeIn key={stat.label} direction="up" delay={i * 0.1}>
            <ChitiStatCard label={stat.label} value={stat.display} change={stat.change} icon={iconMap[stat.icon] || ShoppingCart} glow />
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
                  <ChitiPriorityCard key={i} icon={priorityIcon[item.type]} title={item.label} description={item.project} variant={priorityVariant[item.type]} href={item.href} />
                ))}
              </div>
              <button className="mt-6 w-full py-3 text-center text-xs label-caps tracking-widest text-text-muted hover:text-text-main transition-colors">VIEW ALL TASKS</button>
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
                  <p className={`text-lg font-display font-bold ${item.positive !== undefined ? (item.positive ? "text-success" : "text-error") : "text-text-main"}`}>{item.value}</p>
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
            <Link href="/analytics" className="text-xs text-brand-primary hover:text-brand-primary/80 transition-colors flex items-center gap-1">View full analytics <ArrowRight className="w-3 h-3" /></Link>
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
