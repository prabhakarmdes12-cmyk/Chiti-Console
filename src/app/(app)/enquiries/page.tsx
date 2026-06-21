import { prisma } from "@/lib/db/prisma";
import { getProjectId, projectFilter } from "@/lib/db/queries";
import ChitiPageHeader from "@/components/ui/ChitiPageHeader";
import ChitiCard from "@/components/ui/ChitiCard";
import ChitiStatusBadge from "@/components/ui/ChitiStatusBadge";
import { convertEnquiryToBooking } from "@/lib/actions/marketplace";

export default async function EnquiriesPage() {
  const projectId = await getProjectId();
  const enquiries = await prisma.enquiry.findMany({
    where: projectFilter(projectId),
    orderBy: { updatedAt: "desc" },
    include: { vendor: { select: { businessName: true, category: true } } },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <ChitiPageHeader title="Enquiries" description="Booking requests, vendor discussions, and customer pipeline." />
      <div className="space-y-3">
        {enquiries.map((enquiry) => (
          <ChitiCard key={enquiry.id} padding="sm" glass hover>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs label-caps tracking-widest text-brand-primary">{enquiry.type}</span>
                  <ChitiStatusBadge status={enquiry.status} />
                </div>
                <h2 className="text-base font-semibold text-text-main">{enquiry.customerName}</h2>
                <p className="text-sm text-text-muted">{enquiry.listingName || "General enquiry"} · {enquiry.vendor?.businessName || "Unassigned"}</p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm shrink-0">
                <div><p className="text-text-muted text-xs">Priority</p><p className="text-text-main font-medium">{enquiry.priority}</p></div>
                <div><p className="text-text-muted text-xs">Assigned</p><p className="text-text-main font-medium">{enquiry.assignedTo || "-"}</p></div>
                <div><p className="text-text-muted text-xs">Phone</p><p className="text-text-main font-medium">{enquiry.customerPhone}</p></div>
                <div><p className="text-text-muted text-xs">Updated</p><p className="text-text-main font-medium">{enquiry.updatedAt.toLocaleDateString("en-IN")}</p></div>
              </div>
            </div>
            {enquiry.status !== "COMPLETED" && enquiry.status !== "CANCELLED" && (
              <form action={convertEnquiryToBooking.bind(null, enquiry.id)} className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center gap-3">
                <input
                  name="amount"
                  type="number"
                  min="1"
                  placeholder="Booking amount"
                  className="w-full sm:w-44 px-3 py-2 rounded-lg bg-surface-2/60 border border-white/10 text-sm text-text-main outline-none focus:border-brand-primary/50"
                  required
                />
                <label className="flex items-center gap-2 text-sm text-text-muted">
                  <input name="isPaid" type="checkbox" className="accent-brand-primary" />
                  Payment received
                </label>
                <button type="submit" className="sm:ml-auto px-4 py-2 rounded-lg bg-brand-primary text-white text-sm font-medium hover:bg-brand-primary/90 transition-colors">
                  Convert to Booking
                </button>
              </form>
            )}
          </ChitiCard>
        ))}
      </div>
    </div>
  );
}
