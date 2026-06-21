import { prisma } from "@/lib/db/prisma";
import { getProjectId, projectFilter } from "@/lib/db/queries";
import ChitiPageHeader from "@/components/ui/ChitiPageHeader";
import ChitiCard from "@/components/ui/ChitiCard";
import ChitiStatusBadge from "@/components/ui/ChitiStatusBadge";
import FinanceCenterNav from "@/components/finance/FinanceCenterNav";

export default async function PayoutsPage() {
  const projectId = await getProjectId();
  const payouts = await prisma.payout.findMany({ where: projectFilter(projectId), include: { vendor: { select: { businessName: true, category: true } } }, orderBy: [{ status: "asc" }, { scheduledFor: "asc" }] });
  return <div className="space-y-6"><ChitiPageHeader title="Payouts" description="Vendor payout queue and settlement tracking." /><FinanceCenterNav /><ChitiCard padding="md" glass><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-white/10"><th className="p-3 text-left text-text-muted">Vendor</th><th className="p-3 text-left text-text-muted">Category</th><th className="p-3 text-left text-text-muted">Amount</th><th className="p-3 text-left text-text-muted">Scheduled</th><th className="p-3 text-left text-text-muted">UTR</th><th className="p-3 text-left text-text-muted">Status</th></tr></thead><tbody>{payouts.map((p) => <tr key={p.id} className="border-b border-white/5"><td className="p-3 text-text-main">{p.vendor.businessName}</td><td className="p-3 text-text-muted">{p.vendor.category}</td><td className="p-3 text-text-main">₹{Number(p.amount).toLocaleString("en-IN")}</td><td className="p-3 text-text-muted">{p.scheduledFor?.toLocaleDateString("en-IN") || "-"}</td><td className="p-3 text-text-muted">{p.utrNumber || "-"}</td><td className="p-3"><ChitiStatusBadge status={p.status} /></td></tr>)}</tbody></table></div></ChitiCard></div>;
}
