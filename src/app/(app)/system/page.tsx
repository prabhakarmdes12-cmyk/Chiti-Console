import { prisma } from "@/lib/db/prisma";
import { getProjectId } from "@/lib/db/queries";
import ChitiPageHeader from "@/components/ui/ChitiPageHeader";

export default async function SystemPage() {
  const projectId = await getProjectId();
  const project = projectId ? await prisma.project.findUnique({ where: { id: projectId } }) : null;

  const [orderCount, customerCount] = projectId ? await Promise.all([
    prisma.order.count({ where: { projectId } }),
    prisma.customer.count({ where: { projectId } }),
  ]) : [0, 0];

  const projects = project ? [{
    name: project.name,
    type: project.type,
    domain: project.domain || "—",
    status: project.isActive ? "Online" : "Offline",
    integration: project.integrationType,
    orders: orderCount,
    revenue: "—",
  }] : [];

  return (
    <div className="space-y-6">
      <ChitiPageHeader title="System" description="Project overview and system status." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {projects.map((p) => (
          <div key={p.name} className="bg-surface-1 border border-white/10 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                  <span className="text-sm text-brand-primary font-bold">{p.name.split(" ").map(n => n[0]).join("")}</span>
                </div>
                <div>
                  <h3 className="text-sm text-text-main font-medium">{p.name}</h3>
                  <p className="text-xs text-text-muted">{p.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-success" />
                <span className="text-xs text-success font-medium">{p.status}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-text-muted">Domain</p>
                <p className="text-text-main font-mono text-xs mt-0.5">{p.domain}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Integration</p>
                <p className="text-text-main mt-0.5">{p.integration}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Orders</p>
                <p className="text-text-main font-medium mt-0.5">{p.orders.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Customers</p>
                <p className="text-text-main font-medium mt-0.5">{customerCount.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
