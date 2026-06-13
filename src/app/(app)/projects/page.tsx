import { prisma } from "@/lib/db/prisma";
import ChitiPageHeader from "@/components/ui/ChitiPageHeader";
import HealthScore from "@/components/ui/HealthScore";
import { getProjectHealth } from "@/lib/db/queries";
import Link from "next/link";
import { Plus } from "lucide-react";

type HealthCache = Record<string, Awaited<ReturnType<typeof getProjectHealth>>>;

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({ orderBy: { name: "asc" } });

  const projectIds = projects.map((p) => p.id);

  const [revenueByProject, leadCounts, healthResults] = await Promise.all([
    prisma.order.groupBy({
      by: ["projectId"],
      _sum: { totalAmount: true },
      where: { projectId: { in: projectIds } },
    }),
    prisma.lead.groupBy({
      by: ["projectId"],
      _count: { id: true },
      where: { projectId: { in: projectIds } },
    }),
    Promise.all(projects.map((p) => getProjectHealth(p.id))),
  ]);

  const revenueMap = Object.fromEntries(revenueByProject.map((r) => [r.projectId, Number(r._sum.totalAmount ?? 0)]));
  const leadMap = Object.fromEntries(leadCounts.map((l) => [l.projectId, l._count.id]));
  const healthMap = Object.fromEntries(projectIds.map((id, i) => [id, healthResults[i]])) as HealthCache;

  const projectData = projects.map((p) => ({
    ...p,
    health: healthMap[p.id],
    revenue: revenueMap[p.id] ?? 0,
    leadCount: leadMap[p.id] ?? 0,
  }));

  return (
    <div className="space-y-6">
      <ChitiPageHeader
        title="Projects"
        description="Project overview and system status."
        actions={
          <Link
            href="/projects/new"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-medium transition-all"
          >
            <Plus className="w-4 h-4" />
            New Project
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projectData.map((p) => {
          const initials = p.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
          return (
            <a key={p.id} href={`/projects/${p.id}`} className="bg-surface-1 border border-white/10 rounded-xl p-5 space-y-4 hover:border-white/20 transition-colors group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                    <span className="text-sm text-brand-primary font-bold">{initials}</span>
                  </div>
                  <div>
                    <h3 className="text-sm text-text-main font-medium group-hover:text-brand-primary transition-colors">{p.name}</h3>
                    <p className="text-xs text-text-muted">{p.type}</p>
                  </div>
                </div>
                <HealthScore score={p.health.score} size="sm" />
              </div>

              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-xs text-text-muted">Revenue</p>
                  <p className="text-text-main font-medium mt-0.5">₹{p.revenue.toLocaleString("en-IN")}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Leads</p>
                  <p className="text-text-main font-medium mt-0.5">{p.leadCount}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Orders</p>
                  <p className="text-text-main font-medium mt-0.5">{p.health.orderCount}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-text-muted">
                <span className={p.isActive ? "text-success" : "text-error"}>● {p.isActive ? "Active" : "Inactive"}</span>
                {p.domain && <span>{p.domain}</span>}
                {p.health.oosCount > 0 && <span className="text-error">{p.health.oosCount} OOS</span>}
                {p.health.totalUnread > 0 && <span className="text-warning">{p.health.totalUnread} unread</span>}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
