import { prisma } from "@/lib/db/prisma";
import { getProjectId } from "@/lib/db/queries";
import ChitiPageHeader from "@/components/ui/ChitiPageHeader";

const leadStatusConfig: Record<string, { color: string; bg: string }> = {
  NEW: { color: "text-dataviz-sapphire", bg: "bg-dataviz-sapphire/10" },
  CONTACTED: { color: "text-dataviz-teal", bg: "bg-dataviz-teal/10" },
  QUALIFIED: { color: "text-dataviz-amber", bg: "bg-dataviz-amber/10" },
  PROPOSAL: { color: "text-brand-primary", bg: "bg-brand-primary/10" },
  WON: { color: "text-success", bg: "bg-success/10" },
  LOST: { color: "text-error", bg: "bg-error/10" },
};

const displayOrder = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "WON", "LOST"];

export default async function LeadsPage() {
  const projectId = await getProjectId();
  const allLeads = await prisma.lead.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });

  const columns = displayOrder.map((status) => ({
    title: status,
    leads: allLeads.filter((l) => l.status === status),
    ...(leadStatusConfig[status] || { color: "text-text-muted", bg: "bg-surface-2" }),
  }));

  return (
    <div className="space-y-6">
      <ChitiPageHeader title="Leads" description="Track and manage sales leads through the pipeline." />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {columns.map((col) => (
          <div key={col.title} className="bg-surface-1 border border-white/10 rounded-xl p-3">
            <div className="flex items-center justify-between mb-3 px-2">
              <span className={`text-xs font-semibold uppercase tracking-wider ${col.color}`}>{col.title}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${col.bg} ${col.color}`}>{col.leads.length}</span>
            </div>
            <div className="space-y-2">
              {col.leads.length === 0 && (
                <p className="text-xs text-text-muted text-center py-4">No leads</p>
              )}
              {col.leads.map((lead) => (
                <div key={lead.id} className="bg-surface-2 rounded-lg p-3 space-y-1.5 border border-white/5">
                  <p className="text-sm text-text-main font-medium">{lead.name}</p>
                  {lead.company && <p className="text-xs text-text-muted">{lead.company}</p>}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-muted">{lead.source}</span>
                    <span className="text-text-muted">{new Date(lead.createdAt).toLocaleDateString("en-IN")}</span>
                  </div>
                  {lead.products.length > 0 && (
                    <p className="text-xs text-brand-primary truncate">{lead.products.join(", ")}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
