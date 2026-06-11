import { prisma } from "@/lib/db/prisma";
import { getProjectId, projectFilter } from "@/lib/db/queries";
import ChitiPageHeader from "@/components/ui/ChitiPageHeader";
import ChitiCard from "@/components/ui/ChitiCard";
import MonthlyRevenueChart from "@/components/charts/MonthlyRevenueChart";
import SourcePieChart from "@/components/charts/SourcePieChart";

export default async function AnalyticsPage() {
  const projectId = await getProjectId();

  const [totalRevenue, orderCount, customerCount, orders] = await Promise.all([
    prisma.order.aggregate({ where: { ...projectFilter(projectId) }, _sum: { totalAmount: true } }),
    prisma.order.count({ where: { ...projectFilter(projectId) } }),
    prisma.customer.count({ where: { ...projectFilter(projectId) } }),
    prisma.order.findMany({
      where: { ...projectFilter(projectId) },
      orderBy: { createdAt: "asc" },
      select: { totalAmount: true, createdAt: true, source: true },
    }),
  ]);

  const revenue = Number(totalRevenue._sum.totalAmount ?? 0);
  const avgOrder = orderCount > 0 ? revenue / orderCount : 0;

  const monthlyMap: Record<string, { revenue: number; orders: number }> = {};
  for (const order of orders) {
    const key = new Date(order.createdAt).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
    if (!monthlyMap[key]) monthlyMap[key] = { revenue: 0, orders: 0 };
    monthlyMap[key].revenue += Number(order.totalAmount);
    monthlyMap[key].orders += 1;
  }
  const monthlyData = Object.entries(monthlyMap).map(([month, data]) => ({ month, ...data }));

  const sourceColors: Record<string, string> = {
    WHATSAPP: "#22c55e",
    MANUAL: "#f59e0b",
    WEB_CHECKOUT: "#6366f1",
    API: "#3b82f6",
  };
  const sourceMap: Record<string, number> = {};
  for (const order of orders) {
    sourceMap[order.source] = (sourceMap[order.source] || 0) + 1;
  }
  const sourceData = Object.entries(sourceMap).map(([name, value]) => ({
    name,
    value,
    color: sourceColors[name] || "#888",
  }));

  return (
    <div className="space-y-6">
      <ChitiPageHeader title="Analytics" description="Performance metrics." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: `₹${revenue.toLocaleString("en-IN")}`, change: "+18.2%" },
          { label: "Orders", value: orderCount.toLocaleString(), change: "+12.5%" },
          { label: "Customers", value: customerCount.toLocaleString(), change: "+8.3%" },
          { label: "Avg. Order Value", value: `₹${avgOrder.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, change: "+5.2%" },
        ].map((metric) => (
          <div key={metric.label} className="bg-surface-1 border border-white/10 rounded-xl p-4">
            <p className="text-xs text-text-muted mb-1">{metric.label}</p>
            <p className="text-xl font-display font-bold text-text-main">{metric.value}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-success">{metric.change}</span>
              <span className="text-xs text-text-muted">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChitiCard>
          <h2 className="text-sm font-medium text-text-muted mb-4">Monthly Revenue</h2>
          <MonthlyRevenueChart data={monthlyData} />
        </ChitiCard>
        <ChitiCard>
          <h2 className="text-sm font-medium text-text-muted mb-4">Order Sources</h2>
          <SourcePieChart data={sourceData} />
        </ChitiCard>
      </div>
    </div>
  );
}
