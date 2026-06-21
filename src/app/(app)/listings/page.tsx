import { prisma } from "@/lib/db/prisma";
import { getProjectId, projectFilter } from "@/lib/db/queries";
import ChitiPageHeader from "@/components/ui/ChitiPageHeader";
import ChitiCard from "@/components/ui/ChitiCard";
import ChitiStatusBadge from "@/components/ui/ChitiStatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import { ClipboardList } from "lucide-react";

export default async function ListingsPage() {
  const projectId = await getProjectId();
  const listings = await prisma.listing.findMany({
    where: projectFilter(projectId),
    orderBy: { updatedAt: "desc" },
    include: { vendor: { select: { businessName: true, category: true, district: true } } },
  });

  return (
    <div className="space-y-6">
      <ChitiPageHeader title="Listings" description="Bookable hotels, cabs, restaurants, guides, packages, and experiences." />
      {listings.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No listings yet" description="Listings will appear here once vendors publish them." />
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {listings.map((listing) => {
          const location = listing.location as { district?: string; address?: string } | null;
          return (
            <ChitiCard key={listing.id} padding="md" glass hover>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs label-caps tracking-widest text-brand-primary mb-1">{listing.type.replace("_", " ")}</p>
                  <h2 className="text-lg font-display font-semibold text-text-main">{listing.name}</h2>
                  <p className="text-sm text-text-muted">{listing.vendor?.businessName || "Unassigned vendor"}</p>
                </div>
                <ChitiStatusBadge status={listing.status} />
              </div>
              <p className="text-sm text-text-muted line-clamp-2 mb-4">{listing.description || "No description added."}</p>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div><p className="text-text-muted text-xs">District</p><p className="text-text-main font-semibold">{location?.district || listing.vendor?.district || "-"}</p></div>
                <div><p className="text-text-muted text-xs">Rating</p><p className="text-text-main font-semibold">{Number(listing.rating || 0).toFixed(1)}★</p></div>
                <div><p className="text-text-muted text-xs">Reviews</p><p className="text-text-main font-semibold">{listing.reviewCount || 0}</p></div>
              </div>
            </ChitiCard>
          );
        })}
      </div>
      )}
    </div>
  );
}
