import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import { getProjectHealth } from "@/lib/db/queries";
import HealthScore from "@/components/ui/HealthScore";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

export default async function ProjectOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) notFound();

  const health = await getProjectHealth(id);

  const [revenue, customerCount, recentOrders, recentLeads] = await Promise.all([
    prisma.order.aggregate({ where: { projectId: id }, _sum: { totalAmount: true } }),
    prisma.customer.count({ where: { projectId: id } }),
    prisma.order.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { customer: true },
    }),
    prisma.lead.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const totalRevenue = Number(revenue._sum.totalAmount ?? 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ErrorBoundary>
        <div className="bg-surface-1 border border-white/10 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-medium text-text-muted">Health Score</h3>
          <div className="flex items-center justify-center py-2">
            <HealthScore score={health.score} size="lg" />
          </div>
          <div className="space-y-1.5 text-xs text-text-muted">
            <div className="flex justify-between"><span>Orders (30d)</span><span className={health.orderCount > 0 ? "text-success" : "text-text-muted"}>{health.orderCount > 0 ? "✓" : "✗"}</span></div>
            <div className="flex justify-between"><span>Unread WhatsApp</span><span className={health.totalUnread === 0 ? "text-success" : "text-warning"}>{health.totalUnread === 0 ? "✓" : `${health.totalUnread}`}</span></div>
            <div className="flex justify-between"><span>Out of Stock</span><span className={health.oosCount === 0 ? "text-success" : "text-error"}>{health.oosCount === 0 ? "✓" : `${health.oosCount} items`}</span></div>
            <div className="flex justify-between"><span>Stale Leads</span><span className={health.staleLeads === 0 ? "text-success" : "text-warning"}>{health.staleLeads === 0 ? "✓" : `${health.staleLeads}`}</span></div>
            <div className="flex justify-between"><span>Content (30d)</span><span className={health.contentCount > 0 ? "text-success" : "text-text-muted"}>{health.contentCount > 0 ? "✓" : "✗"}</span></div>
          </div>
        </div>
        </ErrorBoundary>

        <ErrorBoundary>
        <div className="bg-surface-1 border border-white/10 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-medium text-text-muted">Key Metrics</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}` },
              { label: "Customers", value: String(customerCount) },
              { label: "Orders (30d)", value: String(health.orderCount) },
              { label: "Open Leads", value: String(health.staleLeads) },
            ].map((m) => (
              <div key={m.label}>
                <p className="text-xs text-text-muted">{m.label}</p>
                <p className="text-lg font-bold text-text-main">{m.value}</p>
              </div>
            ))}
          </div>
          <div className="pt-2 border-t border-white/10 flex items-center gap-2 text-xs">
            <span className="text-text-muted">Domain:</span>
            <span className={project.isActive ? "text-success" : "text-error"}>{project.domain || "—"}</span>
            <span className="text-text-muted ml-2">Integration:</span>
            <span className="text-text-main">{project.integrationType}</span>
          </div>
        </div>
        </ErrorBoundary>

        <ErrorBoundary>
        <div className="bg-surface-1 border border-white/10 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-medium text-text-muted">Recent Activity</h3>
          <div className="space-y-2 text-xs">
            {recentOrders.length === 0 && <p className="text-text-muted text-center py-4">No activity yet</p>}
            {recentOrders.slice(0, 3).map((o) => (
              <div key={o.id} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                <span className="text-text-main">{o.customer?.name || o.orderNumber}</span>
                <span className="text-text-muted">₹{Number(o.totalAmount).toLocaleString("en-IN")}</span>
              </div>
            ))}
            {recentLeads.length === 0 && recentOrders.length === 0 && <p className="text-text-muted text-center py-4">No activity yet</p>}
            {recentLeads.slice(0, 2).map((l) => (
              <div key={l.id} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                <span className="text-text-main">{l.name}</span>
                <span className="text-text-muted">{l.status}</span>
              </div>
            ))}
          </div>
        </div>
        </ErrorBoundary>
      </div>
    </div>
  );
}
