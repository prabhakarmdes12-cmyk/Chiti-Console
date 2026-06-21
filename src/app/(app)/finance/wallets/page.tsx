import { prisma } from "@/lib/db/prisma";
import { getProjectId, projectFilter } from "@/lib/db/queries";
import ChitiPageHeader from "@/components/ui/ChitiPageHeader";
import ChitiCard from "@/components/ui/ChitiCard";
import EmptyState from "@/components/ui/EmptyState";
import { Wallet } from "lucide-react";
import FinanceCenterNav from "@/components/finance/FinanceCenterNav";

export default async function WalletsPage() {
  const projectId = await getProjectId();
  const wallets = await prisma.vendorWallet.findMany({ where: projectFilter(projectId), include: { vendor: { select: { businessName: true, category: true, district: true } }, transactions: { orderBy: { createdAt: "desc" }, take: 3 } }, orderBy: { updatedAt: "desc" } });
  return <div className="space-y-6"><ChitiPageHeader title="Vendor Wallets" description="Vendor earnings, pending escrow releases, and payout balances." /><FinanceCenterNav />
    {wallets.length === 0
      ? <EmptyState icon={Wallet} title="No wallets yet" description="Vendor wallets will be created automatically when vendors receive earnings." />
      : <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">{wallets.map((w) => <ChitiCard key={w.id} padding="md" glass hover><p className="text-xs label-caps tracking-widest text-brand-primary mb-1">{w.vendor.category.replace("_", " ")}</p><h2 className="text-lg font-display font-semibold text-text-main">{w.vendor.businessName}</h2><p className="text-sm text-text-muted mb-4">{w.vendor.district}</p><div className="grid grid-cols-2 gap-3 text-sm"><div><p className="text-text-muted text-xs">Available</p><p className="text-text-main font-bold">₹{Number(w.balance).toLocaleString("en-IN")}</p></div><div><p className="text-text-muted text-xs">Pending</p><p className="text-warning font-bold">₹{Number(w.pendingBalance).toLocaleString("en-IN")}</p></div><div><p className="text-text-muted text-xs">Earned</p><p className="text-success font-bold">₹{Number(w.totalEarned).toLocaleString("en-IN")}</p></div><div><p className="text-text-muted text-xs">Withdrawn</p><p className="text-text-main font-bold">₹{Number(w.totalWithdrawn).toLocaleString("en-IN")}</p></div></div></ChitiCard>)}</div>}
  </div>;
}
