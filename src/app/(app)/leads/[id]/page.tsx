import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getProjectId, projectFilter } from "@/lib/db/queries";
import ChitiCard from "@/components/ui/ChitiCard";
import ChitiPageHeader from "@/components/ui/ChitiPageHeader";
import ChitiButton from "@/components/ui/ChitiButton";
import LeadFollowUp from "@/components/ui/LeadFollowUp";
import { updateLeadStatus, deleteLead } from "@/lib/actions/leads";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";

const statusOptions = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "WON", "LOST"];

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projectId = await getProjectId();
  const lead = await prisma.lead.findFirst({ where: { id, ...projectFilter(projectId) } });

  if (!lead) notFound();

  return (
    <div className="space-y-6">
      <ChitiPageHeader
        title={lead.name}
        description={`${lead.company || ""} ${lead.email ? `· ${lead.email}` : ""}`}
        actions={
          <Link href="/leads">
            <ChitiButton variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>Back</ChitiButton>
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4">
          <ChitiCard>
            <h3 className="text-sm font-medium text-text-muted mb-3">Lead Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Status</span>
                <span className="font-medium">{lead.status}</span>
              </div>
              {lead.score != null && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Score</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    lead.score >= 70 ? "bg-success/10 text-success"
                    : lead.score >= 40 ? "bg-warning/10 text-warning"
                    : "bg-error/10 text-error"
                  }`}>{lead.score} — {lead.score >= 70 ? "HOT" : lead.score >= 40 ? "WARM" : "COLD"}</span>
                </div>
              )}
              {lead.scoreReason && (
                <div className="pt-1">
                  <p className="text-xs text-text-muted italic">{lead.scoreReason}</p>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-text-muted">Source</span>
                <span className="text-text-main">{lead.source}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Created</span>
                <span className="text-text-main">{new Date(lead.createdAt).toLocaleDateString("en-IN")}</span>
              </div>
              {lead.products.length > 0 && (
                <div className="pt-2 border-t border-white/10">
                  <p className="text-text-muted text-xs mb-1">Products interested in:</p>
                  <p className="text-text-main">{lead.products.join(", ")}</p>
                </div>
              )}
              {lead.quantity && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Quantity</span>
                  <span className="text-text-main">{lead.quantity}</span>
                </div>
              )}
            </div>
          </ChitiCard>

          {(lead.phone || lead.email) && (
            <ChitiCard>
              <h3 className="text-sm font-medium text-text-muted mb-3">Contact</h3>
              <div className="space-y-1 text-sm">
                {lead.phone && <p className="text-text-main">{lead.phone}</p>}
                {lead.email && <p className="text-text-muted">{lead.email}</p>}
              </div>
            </ChitiCard>
          )}

          {lead.message && (
            <ChitiCard>
              <h3 className="text-sm font-medium text-text-muted mb-3">Message</h3>
              <p className="text-sm text-text-main">{lead.message}</p>
            </ChitiCard>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <ChitiCard>
            <h3 className="text-sm font-medium text-text-muted mb-3">Update Status</h3>
            <form action={async (formData: FormData) => {
              "use server";
              await updateLeadStatus(lead.id, formData.get("status") as string);
            }} className="flex items-end gap-3">
              <div className="flex-1 space-y-1">
                <label className="block text-xs text-text-muted">Move to</label>
                <select name="status" className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm">
                  {statusOptions.filter((s) => s !== lead.status).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <ChitiButton type="submit" size="sm">Update</ChitiButton>
            </form>
          </ChitiCard>

          <ChitiCard>
            <h3 className="text-sm font-medium text-text-muted mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.filter((s) => s !== lead.status).map((s) => (
                <form key={s} action={updateLeadStatus.bind(null, lead.id, s)}>
                  <ChitiButton type="submit" variant="secondary" size="sm" className="w-full">{s}</ChitiButton>
                </form>
              ))}
            </div>
          </ChitiCard>

          <ChitiCard>
            <h3 className="text-sm font-medium text-text-muted mb-3">AI Assistant</h3>
            <LeadFollowUp leadId={lead.id} />
          </ChitiCard>

          <div className="pt-2">
            <form action={deleteLead.bind(null, lead.id)}>
              <ChitiButton type="submit" variant="ghost" icon={<Trash2 className="w-4 h-4" />}>Delete Lead</ChitiButton>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
