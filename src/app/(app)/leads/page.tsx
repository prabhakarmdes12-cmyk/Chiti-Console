import { prisma } from "@/lib/db/prisma";
import { getProjectId, projectFilter } from "@/lib/db/queries";
import ChitiPageHeader from "@/components/ui/ChitiPageHeader";
import ChitiButton from "@/components/ui/ChitiButton";
import SearchBar from "@/components/ui/SearchBar";
import FilterSelect from "@/components/ui/FilterSelect";
import { createLead, updateLeadStatus, deleteLead } from "@/lib/actions/leads";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";

const leadStatusConfig: Record<string, { color: string; bg: string }> = {
  NEW: { color: "text-dataviz-sapphire", bg: "bg-dataviz-sapphire/10" },
  CONTACTED: { color: "text-dataviz-teal", bg: "bg-dataviz-teal/10" },
  QUALIFIED: { color: "text-dataviz-amber", bg: "bg-dataviz-amber/10" },
  PROPOSAL: { color: "text-brand-primary", bg: "bg-brand-primary/10" },
  WON: { color: "text-success", bg: "bg-success/10" },
  LOST: { color: "text-error", bg: "bg-error/10" },
};

const displayOrder = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "WON", "LOST"];

const sourceOptions = [
  { value: "WEBSITE_FORM", label: "Website Form" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "CALENDLY", label: "Calendly" },
  { value: "MANUAL", label: "Manual" },
];

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; source?: string }>;
}) {
  const projectId = await getProjectId();
  const { q, source } = await searchParams;

  const where: Record<string, unknown> = { ...projectFilter(projectId) };

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { company: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }
  if (source) where.source = source;

  const allLeads = await prisma.lead.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const columns = displayOrder.map((status) => ({
    title: status,
    leads: allLeads.filter((l) => l.status === status),
    ...(leadStatusConfig[status] || { color: "text-text-muted", bg: "bg-surface-2" }),
  }));

  return (
    <div className="space-y-6">
      <ChitiPageHeader
        title="Leads"
        description="Track and manage sales leads through the pipeline."
        actions={
          <details className="relative">
            <summary className="list-none">
              <ChitiButton size="sm" icon={<Plus className="w-4 h-4" />}>New Lead</ChitiButton>
            </summary>
            <div className="absolute right-0 top-10 w-72 bg-surface-1 border border-white/10 rounded-xl p-4 shadow-2xl z-10">
              <form action={createLead} className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs text-text-muted">Name</label>
                  <input name="name" required className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-xs text-text-muted">Email</label>
                    <input name="email" type="email" className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs text-text-muted">Phone</label>
                    <input name="phone" className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs text-text-muted">Company</label>
                  <input name="company" className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs text-text-muted">Source</label>
                  <select name="source" className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm">
                    <option value="WEBSITE_FORM">Website Form</option>
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="CALENDLY">Calendly</option>
                    <option value="MANUAL">Manual</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs text-text-muted">Message</label>
                  <textarea name="message" rows={2} className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm resize-none" />
                </div>
                <ChitiButton type="submit" className="w-full">Create Lead</ChitiButton>
              </form>
            </div>
          </details>
        }
      />

      <div className="flex items-center gap-3">
        <div className="flex-1 max-w-sm">
          <SearchBar placeholder="Search by name, company, or email..." />
        </div>
        <FilterSelect param="source" options={sourceOptions} placeholder="All Sources" />
        {allLeads.length > 0 && (
          <span className="text-xs text-text-muted">{allLeads.length} leads</span>
        )}
      </div>

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
                <div key={lead.id} className="group bg-surface-2 rounded-lg p-3 space-y-1.5 border border-white/5 relative">
                  <Link href={`/leads/${lead.id}`} className="absolute inset-0 z-0 rounded-lg" />
                  <div className="relative z-10">
                    <p className="text-sm text-text-main font-medium group-hover:text-brand-primary transition-colors">{lead.name}</p>
                    {lead.company && <p className="text-xs text-text-muted">{lead.company}</p>}
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="text-text-muted">{lead.source}</span>
                      <span className="flex items-center gap-1.5">
                        {lead.score != null && (
                          <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                            lead.score >= 70 ? "bg-success/10 text-success"
                            : lead.score >= 40 ? "bg-warning/10 text-warning"
                            : "bg-error/10 text-error"
                          }`}>{lead.score}</span>
                        )}
                        <span className="text-text-muted">{new Date(lead.createdAt).toLocaleDateString("en-IN")}</span>
                      </span>
                    </div>
                    {lead.products.length > 0 && (
                      <p className="text-xs text-brand-primary truncate mt-1">{lead.products.join(", ")}</p>
                    )}
                  </div>
                  <div className="relative z-10 flex items-center justify-between pt-1 border-t border-white/5 mt-1.5">
                    <div className="flex gap-1">
                      {displayOrder.filter(s => s !== lead.status).slice(0, 3).map((s) => (
                        <form key={s} action={updateLeadStatus.bind(null, lead.id, s)}>
                          <button type="submit" className="text-xs text-text-muted hover:text-text-main transition-colors px-1">
                            {s[0]}
                          </button>
                        </form>
                      ))}
                    </div>
                    <form action={deleteLead.bind(null, lead.id)}>
                      <button type="submit" className="text-text-muted hover:text-error transition-colors p-0.5">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
