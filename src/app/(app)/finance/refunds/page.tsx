import { prisma } from "@/lib/db/prisma";
import { getProjectId, projectFilter } from "@/lib/db/queries";
import ChitiPageHeader from "@/components/ui/ChitiPageHeader";
import ChitiCard from "@/components/ui/ChitiCard";
import ChitiStatusBadge from "@/components/ui/ChitiStatusBadge";
import FinanceCenterNav from "@/components/finance/FinanceCenterNav";

export default async function RefundsPage() {
  const projectId = await getProjectId();
  const refunds = await prisma.refund.findMany({ where: projectFilter(projectId), include: { order: { select: { orderNumber: true, customer: { select: { name: true } } } } }, orderBy: { requestedAt: "desc" } });
  return <div className="space-y-6"><ChitiPageHeader title="Refunds" description="Refund requests, approvals, and processed refunds." /><FinanceCenterNav /><ChitiCard padding="md" glass>{refunds.length === 0 ? <p className="py-12 text-center text-sm text-text-muted">No refunds yet</p> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-white/10"><th className="p-3 text-left text-text-muted">Order</th><th className="p-3 text-left text-text-muted">Customer</th><th className="p-3 text-left text-text-muted">Amount</th><th className="p-3 text-left text-text-muted">Reason</th><th className="p-3 text-left text-text-muted">Status</th></tr></thead><tbody>{refunds.map((r) => <tr key={r.id} className="border-b border-white/5"><td className="p-3 text-text-main">{r.order.orderNumber}</td><td className="p-3 text-text-muted">{r.order.customer?.name || "-"}</td><td className="p-3 text-text-main">₹{Number(r.amount).toLocaleString("en-IN")}</td><td className="p-3 text-text-muted">{r.reason || "-"}</td><td className="p-3"><ChitiStatusBadge status={r.status} /></td></tr>)}</tbody></table></div>}</ChitiCard></div>;
}
