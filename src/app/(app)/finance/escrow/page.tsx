import { prisma } from "@/lib/db/prisma";
import { getProjectId, projectFilter } from "@/lib/db/queries";
import ChitiPageHeader from "@/components/ui/ChitiPageHeader";
import ChitiCard from "@/components/ui/ChitiCard";
import ChitiStatusBadge from "@/components/ui/ChitiStatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import { ShieldCheck } from "lucide-react";
import FinanceCenterNav from "@/components/finance/FinanceCenterNav";

export default async function EscrowPage() {
  const projectId = await getProjectId();
  const escrows = await prisma.escrow.findMany({ where: projectFilter(projectId), include: { order: { select: { orderNumber: true, vendor: { select: { businessName: true } } } } }, orderBy: { createdAt: "desc" } });
  const held = escrows.filter((e) => e.status === "HELD").reduce((s, e) => s + Number(e.grossAmount), 0);
  return <div className="space-y-6"><ChitiPageHeader title="Escrow" description="Held customer money awaiting service completion and settlement." /><FinanceCenterNav />
    {escrows.length === 0
      ? <EmptyState icon={ShieldCheck} title="No escrow records" description="Escrow transactions will appear here once bookings are processed." />
      : <ChitiCard padding="md" glass><div className="mb-4 text-sm text-text-muted">Held balance <span className="text-text-main font-bold">₹{held.toLocaleString("en-IN")}</span></div><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-white/10"><th className="p-3 text-left text-text-muted">Order</th><th className="p-3 text-left text-text-muted">Vendor</th><th className="p-3 text-left text-text-muted">Gross</th><th className="p-3 text-left text-text-muted">Vendor</th><th className="p-3 text-left text-text-muted">Commission</th><th className="p-3 text-left text-text-muted">Release Due</th><th className="p-3 text-left text-text-muted">Status</th></tr></thead><tbody>{escrows.map((e) => <tr key={e.id} className="border-b border-white/5"><td className="p-3 text-text-main">{e.order.orderNumber}</td><td className="p-3 text-text-muted">{e.order.vendor?.businessName || "-"}</td><td className="p-3 text-text-main">₹{Number(e.grossAmount).toLocaleString("en-IN")}</td><td className="p-3 text-text-main">₹{Number(e.vendorAmount).toLocaleString("en-IN")}</td><td className="p-3 text-success">₹{Number(e.commissionAmount).toLocaleString("en-IN")}</td><td className="p-3 text-text-muted">{e.releaseDueAt?.toLocaleDateString("en-IN") || "-"}</td><td className="p-3"><ChitiStatusBadge status={e.status} /></td></tr>)}</tbody></table></div></ChitiCard>}
  </div>;
}
