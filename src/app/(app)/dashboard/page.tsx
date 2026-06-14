import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { ShoppingCart, TrendingUp, Users, DollarSign, AlertTriangle, MessageCircle, Package, ArrowRight, Sparkles, Building2 } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { getProjectId, projectFilter, getTodayPriorities, getExpectedRevenue } from "@/lib/db/queries";
import ChitiCard from "@/components/ui/ChitiCard";
import ChitiPageHeader from "@/components/ui/ChitiPageHeader";
import ChitiStatusBadge from "@/components/ui/ChitiStatusBadge";
import MonthlyRevenueChart from "@/components/charts/MonthlyRevenueChart";
import QueryBar from "@/components/ai/QueryBar";
import Link from "next/link";

function getGreeting(name: string) {
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  return `Good ${timeGreeting}, ${name.split(" ")[0] || "there"}`;
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const projectId = await getProjectId();
  const today = new Date();
  today.setDate(today.getDate() - 1);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 2);

  const [orderCount, yesterdayCount, revenue, customerCount, prevCustomerCount, recentOrders, projects, priorities, expectedRevenue, monthlyData] = await Promise.all([
    prisma.order.count({ where: { ...projectFilter(projectId), createdAt: { gte: today } } }),
    prisma.order.count({ where: { ...projectFilter(projectId), createdAt: { gte: yesterday, lt: today } } }),
    prisma.order.aggregate({ where: { ...projectFilter(projectId) }, _sum: { totalAmount: true } }),
    prisma.customer.count({ where: { ...projectFilter(projectId) } }),
    prisma.customer.count({ where: { ...projectFilter(projectId), createdAt: { lt: today } } }),
    prisma.order.findMany({ where: { ...projectFilter(projectId) }, orderBy: { createdAt: "desc" }, take: 4, include: { customer: true } }),
    prisma.project.findMany({ where: { isActive: true }, select: { name: true, id: true } }),
    getTodayPriorities(projectId),
    getExpectedRevenue(projectId),
    getMonthlyRevenue(projectId),
  ]);

  async function getMonthlyRevenue(pid: string | null) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const orders = await prisma.order.findMany({
      where: { ...projectFilter(pid), createdAt: { gte: sixMonthsAgo } },
      select: { totalAmount: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });
    const byMonth: Record<string, { revenue: number; orders: number }> = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    for (const o of orders) {
      const key = `${monthNames[o.createdAt.getMonth()]} ${o.createdAt.getFullYear()}`;
      if (!byMonth[key]) byMonth[key] = { revenue: 0, orders: 0 };
      byMonth[key].revenue += Number(o.totalAmount);
      byMonth[key].orders += 1;
    }
    return Object.entries(byMonth).map(([month, d]) => ({ month, revenue: d.revenue, orders: d.orders }));
  }

  const totalRevenue = Number(revenue._sum.totalAmount ?? 0);
  const conversionRate = customerCount > 0 ? ((orderCount / customerCount) * 100).toFixed(1) : "0.0";
  const prevConversionRate = prevCustomerCount > 0 ? ((yesterdayCount / prevCustomerCount) * 100).toFixed(1) : "0.0";
  const revChange = expectedRevenue.change > 0 ? `+${expectedRevenue.change.toFixed(1)}%` : `${expectedRevenue.change.toFixed(1)}%`;
  const orderChange = yesterdayCount > 0 ? `+${((orderCount - yesterdayCount) / yesterdayCount * 100).toFixed(0)}%` : "—";
  const customerChange = prevCustomerCount > 0 ? `+${customerCount - prevCustomerCount}` : "—";
  const convChange = prevCustomerCount > 0 ? (Number(conversionRate) - Number(prevConversionRate)).toFixed(1) : "0.0";

  const stats = [
    { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, change: revChange, icon: DollarSign, gradient: "from-emerald-500 to-teal-500" },
    { label: "Orders Today", value: String(orderCount), change: orderChange, icon: ShoppingCart, gradient: "from-sky-500 to-cyan-500" },
    { label: "Active Customers", value: String(customerCount), change: customerChange, icon: Users, gradient: "from-violet-500 to-purple-500" },
    { label: "Conversion Rate", value: `${conversionRate}%`, change: `${convChange > "0" ? "+" : ""}${convChange}%`, icon: TrendingUp, gradient: "from-amber-500 to-orange-500" },
  ];

  const attentionItems = [
    ...priorities.staleLeads.map((l) => ({ type: "lead" as const, label: `Stale lead: ${l.name}`, project: l.project.name, href: `/leads/${l.id}` })),
    ...priorities.oosProducts.map((p) => ({ type: "oos" as const, label: `Out of stock: ${p.name}`, project: p.project.name, href: `/products/${p.id}` })),
    ...priorities.unreadConversations.map((c) => ({ type: "wa" as const, label: `Unread: ${c.customer?.name || "Unknown"}`, project: c.project.name, href: `/whatsapp/${c.id}` })),
    ...priorities.pendingOrders.map((o) => ({ type: "order" as const, label: `Pending: ${o.orderNumber}`, project: o.project.name, href: `/orders/${o.id}` })),
  ];

  return (
    <div className="space-y-6">
      <ChitiPageHeader
        title={getGreeting(session.user.name || "there")}
        description={<span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />{projectId ? "Single project view" : "All projects"}</span>}
      />

      <QueryBar />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="group relative bg-surface-1 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-black/20"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs text-text-muted font-medium tracking-wide uppercase">{stat.label}</p>
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg opacity-80 group-hover:opacity-100 transition-opacity`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-2xl font-display font-bold text-text-main mb-1">{stat.value}</p>
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-medium ${stat.change.startsWith("+") ? "text-success" : "text-error"}`}>
                {stat.change}
              </span>
              <span className="text-xs text-text-muted">vs yesterday</span>
            </div>
          </div>
        ))}
      </div>

      {/* Attention + Revenue Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {attentionItems.length > 0 && (
          <ChitiCard padding="md">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <AlertTriangle className="w-3.5 h-3.5 text-white" />
              </div>
              <h2 className="text-sm font-medium text-text-main">Needs Attention</h2>
              <span className="text-xs text-text-muted bg-surface-2 px-2 py-0.5 rounded-full">{attentionItems.length}</span>
            </div>
            <div className="space-y-1">
              {attentionItems.slice(0, 6).map((item, i) => (
                <Link key={i} href={item.href} className="flex items-center gap-3 py-2.5 px-3 -mx-3 rounded-lg hover:bg-surface-2/60 transition-colors group">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    item.type === "lead" ? "bg-dataviz-sapphire/20 text-dataviz-sapphire" :
                    item.type === "oos" ? "bg-error/20 text-error" :
                    item.type === "wa" ? "bg-brand-secondary/20 text-brand-secondary" :
                    "bg-warning/20 text-warning"
                  }`}>
                    {item.type === "lead" && <Users className="w-3.5 h-3.5" />}
                    {item.type === "oos" && <Package className="w-3.5 h-3.5" />}
                    {item.type === "wa" && <MessageCircle className="w-3.5 h-3.5" />}
                    {item.type === "order" && <ShoppingCart className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-main truncate">{item.label}</p>
                    <p className="text-xs text-text-muted">{item.project}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                </Link>
              ))}
            </div>
          </ChitiCard>
        )}

        <ChitiCard padding="md">
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
              { label: "Change", value: `${expectedRevenue.change >= 0 ? "+" : ""}${expectedRevenue.change.toFixed(1)}%`, change: "", positive: expectedRevenue.change >= 0 },
            ].map((item) => (
              <div key={item.label} className="bg-surface-2/50 rounded-lg p-3 text-center">
                <p className="text-xs text-text-muted mb-1">{item.label}</p>
                <p className={`text-lg font-display font-bold ${item.positive !== undefined ? (item.positive ? "text-success" : "text-error") : "text-text-main"}`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </ChitiCard>
      </div>

      {/* Revenue Chart */}
      <ChitiCard padding="md">
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

      {/* Recent Orders + Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChitiCard padding="md">
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
              <Link key={order.id} href={`/orders/${order.id}`} className="flex items-center justify-between py-2.5 px-3 -mx-3 rounded-lg hover:bg-surface-2/60 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-surface-2 flex items-center justify-center">
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

        <ChitiCard padding="md">
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
              <Link key={project.id} href={`/projects/${project.id}`} className="flex items-center justify-between py-2.5 px-3 -mx-3 rounded-lg hover:bg-surface-2/60 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-surface-2 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-success" />
                  </div>
                  <span className="text-sm text-text-main group-hover:text-brand-primary transition-colors">{project.name}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
              </Link>
            ))}
          </div>
        </ChitiCard>
      </div>
    </div>
  );
}
