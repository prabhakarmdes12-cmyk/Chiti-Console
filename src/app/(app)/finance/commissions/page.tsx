import { prisma } from "@/lib/db/prisma";
import { getProjectId, projectFilter } from "@/lib/db/queries";
import ChitiPageHeader from "@/components/ui/ChitiPageHeader";
import ChitiCard from "@/components/ui/ChitiCard";
import FinanceCenterNav from "@/components/finance/FinanceCenterNav";

export default async function CommissionsPage() {
  const projectId = await getProjectId();
  const commissions = await prisma.commission.findMany({ where: projectFilter(projectId), include: { vendor: { select: { businessName: true } } }, orderBy: [{ category: "asc" }, { effectiveFrom: "desc" }] });
  return <div className="space-y-6"><ChitiPageHeader title="Commission Rules" description="Platform take-rate by vendor or marketplace category." /><FinanceCenterNav /><div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{commissions.map((c) => <ChitiCard key={c.id} padding="md" glass hover><p className="text-xs label-caps tracking-widest text-brand-primary mb-2">{c.vendor?.businessName || c.category || "Default"}</p><p className="text-3xl font-display font-bold text-text-main mb-1">{Number(c.rate).toFixed(1)}%</p><p className="text-sm text-text-muted">Min ₹{Number(c.minAmount).toLocaleString("en-IN")}{c.maxAmount ? ` · Max ₹${Number(c.maxAmount).toLocaleString("en-IN")}` : ""}</p><p className="mt-4 text-xs text-text-muted">Effective {c.effectiveFrom.toLocaleDateString("en-IN")}</p></ChitiCard>)}</div></div>;
}
