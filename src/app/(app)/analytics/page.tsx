import { prisma } from "@/lib/db/prisma";
import { getProjectId, projectFilter, getProject } from "@/lib/db/queries";
import ChitiPageHeader from "@/components/ui/ChitiPageHeader";
import { fetchGAPageViews } from "@/lib/integrations/analytics";
import AnalyticsClient from "./AnalyticsClient";

function aggregateOrders(orders: { createdAt: Date; totalAmount: number; source: string }[]) {
  const revenue = orders.reduce((s, o) => s + Number(o.totalAmount), 0);
  const orderCount = orders.length;
  const avgOrder = orderCount > 0 ? revenue / orderCount : 0;

  const sourceColors: Record<string, string> = {
    WHATSAPP: "#22c55e", MANUAL: "#f59e0b", WEB_CHECKOUT: "#6366f1", API: "#3b82f6",
  };
  const sourceMap: Record<string, number> = {};
  for (const order of orders) sourceMap[order.source] = (sourceMap[order.source] || 0) + 1;
  const sourceData = Object.entries(sourceMap).map(([name, value]) => ({ name, value, color: sourceColors[name] || "#888" }));

  const monthlyMap: Record<string, { month: string; revenue: number; orders: number }> = {};
  for (const order of orders) {
    const key = new Date(order.createdAt).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
    if (!monthlyMap[key]) monthlyMap[key] = { month: key, revenue: 0, orders: 0 };
    monthlyMap[key].revenue += Number(order.totalAmount);
    monthlyMap[key].orders += 1;
  }

  return {
    totalRevenue: revenue,
    orderCount,
    customerCount: 0,
    avgOrderValue: avgOrder,
    monthlyData: Object.values(monthlyMap),
    sourceData,
    orders: orders.map((o) => ({ createdAt: o.createdAt.toISOString(), totalAmount: Number(o.totalAmount), source: o.source })),
  };
}

export default async function AnalyticsPage() {
  const projectId = await getProjectId();

  const [totalRevenue, orderCount, customerCount, orders, project] = await Promise.all([
    prisma.order.aggregate({ where: { ...projectFilter(projectId) }, _sum: { totalAmount: true } }),
    prisma.order.count({ where: { ...projectFilter(projectId) } }),
    prisma.customer.count({ where: { ...projectFilter(projectId) } }),
    prisma.order.findMany({
      where: { ...projectFilter(projectId) },
      orderBy: { createdAt: "asc" },
      select: { totalAmount: true, createdAt: true, source: true },
    }),
    getProject(),
  ]);

  const stats = aggregateOrders(orders as unknown as { createdAt: Date; totalAmount: number; source: string }[]);
  stats.customerCount = customerCount;

  const revenue = Number(totalRevenue._sum.totalAmount ?? 0);
  const avgOrder = orderCount > 0 ? revenue / orderCount : 0;

  const hasGA4 = !!process.env.GA4_CLIENT_EMAIL;
  const gaData = hasGA4 && project?.domain
    ? await fetchGAPageViews(project.domain, "30daysAgo", "today").catch(() => null)
    : null;

  return (
    <div className="space-y-6">
      <ChitiPageHeader title="Analytics" description="Performance metrics with custom date ranges and exports." />
      <AnalyticsClient
        monthlyData={stats.monthlyData}
        sourceData={stats.sourceData}
        revenue={revenue}
        orderCount={orderCount}
        customerCount={customerCount}
        avgOrder={avgOrder}
        gaSources={gaData?.sources || []}
        orders={stats.orders}
      />
    </div>
  );
}
