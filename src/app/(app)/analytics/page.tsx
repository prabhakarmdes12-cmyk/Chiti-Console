import { prisma } from "@/lib/db/prisma";
import { getProjectId } from "@/lib/db/queries";
import ChitiPageHeader from "@/components/ui/ChitiPageHeader";

export default async function AnalyticsPage() {
  const projectId = await getProjectId();

  const [totalRevenue, orderCount, customerCount, orders] = projectId ? await Promise.all([
    prisma.order.aggregate({ where: { projectId }, _sum: { totalAmount: true } }),
    prisma.order.count({ where: { projectId } }),
    prisma.customer.count({ where: { projectId } }),
    prisma.order.findMany({ where: { projectId }, orderBy: { createdAt: "asc" }, select: { totalAmount: true, createdAt: true, source: true } }),
  ]) : [{ _sum: { totalAmount: 0 } }, 0, 0, []];

  const revenue = Number(totalRevenue._sum.totalAmount ?? 0);
  const avgOrder = orderCount > 0 ? revenue / orderCount : 0;

  const metrics = [
    { label: "Total Revenue", value: `₹${revenue.toLocaleString("en-IN")}`, change: "+18.2%", period: "vs last month" },
    { label: "Orders", value: orderCount.toLocaleString(), change: "+12.5%", period: "vs last month" },
    { label: "Customers", value: customerCount.toLocaleString(), change: "+8.3%", period: "vs last month" },
    { label: "Avg. Order Value", value: `₹${avgOrder.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, change: "+5.2%", period: "vs last month" },
  ];

  return (
    <div className="space-y-6">
      <ChitiPageHeader title="Analytics" description="Performance metrics." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="bg-surface-1 border border-white/10 rounded-xl p-4">
            <p className="text-xs text-text-muted mb-1">{metric.label}</p>
            <p className="text-xl font-display font-bold text-text-main">{metric.value}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-success">{metric.change}</span>
              <span className="text-xs text-text-muted">{metric.period}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-surface-1 border border-white/10 rounded-xl p-5">
          <h2 className="text-sm font-medium text-text-muted mb-4">Monthly Orders</h2>
          {orders.length === 0 ? (
            <p className="text-text-muted text-sm text-center py-8">No data yet</p>
          ) : (
            <div className="space-y-2">
              {orders.slice(0, 6).map((order, i) => {
                const maxAmount = Math.max(...orders.slice(0, 6).map(o => Number(o.totalAmount)));
                const width = (Number(order.totalAmount) / (maxAmount || 1)) * 100;
                const date = new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
                return (
                  <div key={order.createdAt.toString()} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-muted">{i === 0 ? "Latest" : date}</span>
                      <span className="text-text-main">₹{Number(order.totalAmount).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-secondary rounded-full transition-all" style={{ width: `${width}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-surface-1 border border-white/10 rounded-xl p-5">
          <h2 className="text-sm font-medium text-text-muted mb-4">Order Sources</h2>
          <div className="space-y-3">
            {(["WHATSAPP", "MANUAL", "WEB_CHECKOUT", "API"] as const).map((source) => {
              const count = orders.filter((o: { source?: string }) => o.source === source).length;
              const total = orders.length || 1;
              const pct = (count / total) * 100;
              const colors: Record<string, string> = {
                WHATSAPP: "bg-success",
                MANUAL: "bg-dataviz-amber",
                WEB_CHECKOUT: "bg-dataviz-sapphire",
                API: "bg-brand-primary",
              };
              return (
                <div key={source} className="flex items-center gap-3">
                  <span className="text-xs text-text-muted w-28">{source.replace(/_/g, " ")}</span>
                  <div className="flex-1 h-2 bg-surface-3 rounded-full overflow-hidden">
                    <div className={`h-full ${colors[source] || "bg-surface-3"} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-text-main w-12 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
