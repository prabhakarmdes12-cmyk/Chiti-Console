import { prisma } from "@/lib/db/prisma";
import { getProjectId, projectFilter } from "@/lib/db/queries";
import ChitiPageHeader from "@/components/ui/ChitiPageHeader";
import ChitiCard from "@/components/ui/ChitiCard";
import ChitiStatusBadge from "@/components/ui/ChitiStatusBadge";
import Link from "next/link";

export default async function VendorsPage() {
  const projectId = await getProjectId();
  const vendors = await prisma.vendor.findMany({
    where: projectFilter(projectId),
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: { listings: { select: { id: true } }, wallet: true, payouts: { select: { amount: true, status: true } } },
  });

  return (
    <div className="space-y-6">
      <ChitiPageHeader title="Vendors" description="Hotels, cabs, restaurants, guides, and experience partners." />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {vendors.map((vendor) => {
          const pendingPayout = vendor.payouts.filter((p) => p.status === "PENDING").reduce((sum, p) => sum + Number(p.amount), 0);
          return (
            <ChitiCard key={vendor.id} padding="md" glass hover>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs label-caps tracking-widest text-brand-primary mb-1">{vendor.category.replace("_", " ")}</p>
                  <h2 className="text-lg font-display font-semibold text-text-main">{vendor.businessName}</h2>
                  <p className="text-sm text-text-muted">{vendor.ownerName} · {vendor.district}</p>
                </div>
                <ChitiStatusBadge status={vendor.status} />
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div><p className="text-text-muted text-xs">Listings</p><p className="text-text-main font-semibold">{vendor.listings.length}</p></div>
                <div><p className="text-text-muted text-xs">Wallet</p><p className="text-text-main font-semibold">₹{Number(vendor.wallet?.balance || 0).toLocaleString("en-IN")}</p></div>
                <div><p className="text-text-muted text-xs">Due</p><p className="text-warning font-semibold">₹{pendingPayout.toLocaleString("en-IN")}</p></div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10 text-xs text-text-muted">
                {vendor.phone} {vendor.email ? `· ${vendor.email}` : ""}
              </div>
              <Link href={`/vendors/${vendor.id}`} className="mt-4 inline-flex text-sm text-brand-primary hover:text-brand-primary/80 transition-colors">
                Open vendor operations
              </Link>
            </ChitiCard>
          );
        })}
      </div>
    </div>
  );
}
