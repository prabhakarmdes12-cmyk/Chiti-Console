import { prisma } from "@/lib/db/prisma";
import { getProjectId } from "@/lib/db/queries";
import ChitiPageHeader from "@/components/ui/ChitiPageHeader";

export default async function SystemPage() {
  const projectId = await getProjectId();

  const projectList = projectId
    ? await prisma.project.findMany({ where: { id: projectId } })
    : await prisma.project.findMany({ orderBy: { name: "asc" } });

  const projectData = await Promise.all(
    projectList.map(async (p) => {
      const [orderCount, customerCount] = await Promise.all([
        prisma.order.count({ where: { projectId: p.id } }),
        prisma.customer.count({ where: { projectId: p.id } }),
      ]);
      return {
        name: p.name,
        type: p.type,
        domain: p.domain || "—",
        status: p.isActive ? "Online" : "Offline",
        integration: p.integrationType,
        orders: orderCount,
        customers: customerCount,
      };
    }),
  );

  return (
    <div className="space-y-6">
      <ChitiPageHeader title="System" description="Project overview and system status." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {projectData.length === 0 && (
          <div className="col-span-full p-12 text-center text-text-muted text-sm">No projects found</div>
        )}
        {projectData.map((p) => (
          <div key={p.name} className="bg-surface-1 border border-white/10 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                  <span className="text-sm text-brand-primary font-bold">{(p.name || "?").split(" ").map(n => n[0]).join("")}</span>
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
                <p className="text-text-main font-medium mt-0.5">{p.customers.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
