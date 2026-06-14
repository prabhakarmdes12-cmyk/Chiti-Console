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
import DashboardClient from "./DashboardClient";
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
    { label: "Total Revenue", value: totalRevenue, display: `₹${totalRevenue.toLocaleString("en-IN")}`, change: revChange, icon: DollarSign, gradient: "from-emerald-500 to-teal-500" },
    { label: "Orders Today", value: orderCount, display: String(orderCount), change: orderChange, icon: ShoppingCart, gradient: "from-sky-500 to-cyan-500" },
    { label: "Active Customers", value: customerCount, display: String(customerCount), change: customerChange, icon: Users, gradient: "from-violet-500 to-purple-500" },
    { label: "Conversion Rate", value: Number(conversionRate), display: `${conversionRate}%`, change: `${convChange > "0" ? "+" : ""}${convChange}%`, icon: TrendingUp, gradient: "from-amber-500 to-orange-500" },
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

      <DashboardClient stats={stats} attentionItems={attentionItems} expectedRevenue={expectedRevenue} monthlyData={monthlyData} recentOrders={recentOrders.map((o) => ({ id: o.id, orderNumber: o.orderNumber, totalAmount: Number(o.totalAmount), status: o.status, customer: o.customer ? { name: o.customer.name } : null }))} projects={projects} />
    </div>
  );
}
