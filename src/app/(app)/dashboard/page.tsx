import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { ShoppingCart, TrendingUp, Users, DollarSign, AlertTriangle, MessageCircle, Package, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { getProjectId, projectFilter, getTodayPriorities, getExpectedRevenue } from "@/lib/db/queries";
import ChitiStatCard from "@/components/ui/ChitiStatCard";
import ChitiCard from "@/components/ui/ChitiCard";
import ChitiPageHeader from "@/components/ui/ChitiPageHeader";
import ChitiStatusBadge from "@/components/ui/ChitiStatusBadge";
import MonthlyRevenueChart from "@/components/charts/MonthlyRevenueChart";
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
    { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, change: revChange, icon: DollarSign, color: "text-success" },
    { label: "Orders Today", value: String(orderCount), change: orderChange, icon: ShoppingCart, color: "text-brand-secondary" },
    { label: "Active Customers", value: String(customerCount), change: customerChange, icon: Users, color: "text-dataviz-sapphire" },
    { label: "Conversion Rate", value: `${conversionRate}%`, change: `${convChange > "0" ? "+" : ""}${convChange}%`, icon: TrendingUp, color: "text-dataviz-amber" },
  ];

  const attentionItems = [
    ...priorities.staleLeads.map((l) => ({ type: "lead" as const, label: `Stale lead: ${l.name}`, project: l.project.name, href: `/leads/${l.id}` })),
    ...priorities.oosProducts.map((p) => ({ type: "oos" as const, label: `OOS: ${p.name}`, project: p.project.name, href: `/products/${p.id}` })),
    ...priorities.unreadConversations.map((c) => ({ type: "wa" as const, label: `Unread: ${c.customer?.name || "Unknown"}`, project: c.project.name, href: `/whatsapp/${c.id}` })),
    ...priorities.pendingOrders.map((o) => ({ type: "order" as const, label: `Pending: ${o.orderNumber}`, project: o.project.name, href: `/orders/${o.id}` })),
  ];

  return (
    <div className="space-y-6">
      <ChitiPageHeader
        title={getGreeting(session.user.name || "there")}
        description="Here is your operations overview."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <ChitiStatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {attentionItems.length > 0 && (
          <ChitiCard>
            <h2 className="text-sm font-medium text-text-muted mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" /> Needs Attention
            </h2>
            <div className="space-y-2">
              {attentionItems.slice(0, 6).map((item, i) => (
                <Link key={i} href={item.href} className="flex items-center gap-2 py-1.5 border-b border-white/5 last:border-0 text-xs hover:bg-surface-2/50 rounded-lg px-2 -mx-2 transition-colors group">
                  {item.type === "lead" && <Users className="w-3 h-3 text-dataviz-sapphire" />}
                  {item.type === "oos" && <Package className="w-3 h-3 text-error" />}
                  {item.type === "wa" && <MessageCircle className="w-3 h-3 text-brand-secondary" />}
                  {item.type === "order" && <ShoppingCart className="w-3 h-3 text-warning" />}
                  <span className="text-text-main flex-1">{item.label}</span>
                  <span className="text-text-muted">{item.project}</span>
                  <ArrowRight className="w-3 h-3 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </ChitiCard>
        )}

        <ChitiCard>
          <h2 className="text-sm font-medium text-text-muted mb-4">Revenue Forecast</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-text-muted">This Month</p>
              <p className="text-lg font-bold text-text-main">₹{expectedRevenue.current.toLocaleString("en-IN")}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Last Month</p>
              <p className="text-lg font-bold text-text-main">₹{expectedRevenue.previous.toLocaleString("en-IN")}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Change</p>
              <p className={`text-lg font-bold ${expectedRevenue.change >= 0 ? "text-success" : "text-error"}`}>
                {expectedRevenue.change >= 0 ? "+" : ""}{expectedRevenue.change.toFixed(1)}%
              </p>
            </div>
          </div>
        </ChitiCard>
      </div>

      <ChitiCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-text-muted">Revenue Trend (6 months)</h2>
          <Link href="/analytics" className="text-xs text-brand-primary hover:text-brand-primary/80 transition-colors">View full analytics →</Link>
        </div>
        <MonthlyRevenueChart data={monthlyData} />
      </ChitiCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChitiCard>
          <h2 className="text-sm font-medium text-text-muted mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {recentOrders.length === 0 && (
              <p className="text-sm text-text-muted py-4 text-center">No orders yet</p>
            )}
            {recentOrders.map((order) => (
              <Link key={order.id} href={`/orders/${order.id}`} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 hover:bg-surface-2/50 rounded-lg px-2 -mx-2 transition-colors group">
                <div>
                  <p className="text-sm text-text-main font-medium">{order.customer?.name || "Unknown"}</p>
                  <p className="text-xs text-text-muted">{order.orderNumber}</p>
                </div>
                <div className="text-right flex items-center gap-2">
                  <p className="text-sm text-text-main">₹{Number(order.totalAmount).toLocaleString("en-IN")}</p>
                  <ChitiStatusBadge status={order.status} type="order" />
                  <ArrowRight className="w-3.5 h-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>
        </ChitiCard>

        <ChitiCard>
          <h2 className="text-sm font-medium text-text-muted mb-4">Active Projects</h2>
          <div className="space-y-3">
            {projects.length === 0 && <p className="text-sm text-text-muted py-4 text-center">No active projects</p>}
            {projects.map((project) => (
              <div key={project.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <Link href={`/projects/${project.id}`} className="flex items-center gap-3 text-sm text-text-main hover:text-brand-primary transition-colors">
                  <span className="h-2 w-2 rounded-full bg-success" />
                  {project.name}
                </Link>
              </div>
            ))}
          </div>
        </ChitiCard>
      </div>
    </div>
  );
}
