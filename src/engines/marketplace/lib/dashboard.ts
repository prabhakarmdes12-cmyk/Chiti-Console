import { prisma } from "@/lib/db/prisma";
import { projectFilter } from "@/lib/db/queries";

export async function getMarketplaceDashboard(projectId: string | null) {
  const where = projectFilter(projectId);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  const [orders, escrows, wallets, payouts, refunds, listings, vendorGroups] = await Promise.all([
    prisma.order.findMany({
      where,
      select: { totalAmount: true, commissionAmount: true, gstAmount: true, status: true, paymentStatus: true, createdAt: true, vendor: { select: { businessName: true, category: true } } },
    }),
    prisma.escrow.findMany({ where, include: { order: { select: { orderNumber: true } } } }),
    prisma.vendorWallet.findMany({ where, include: { vendor: { select: { businessName: true, category: true } } } }),
    prisma.payout.findMany({ where, include: { vendor: { select: { businessName: true, category: true } } } }),
    prisma.refund.findMany({ where, include: { order: { select: { orderNumber: true } } } }),
    prisma.listing.findMany({ where, select: { type: true, status: true, rating: true } }),
    prisma.vendor.groupBy({ by: ["category", "status"], where, _count: true }),
  ]);

  const validPaid = orders.filter((o) => o.paymentStatus === "PAID" && o.status !== "CANCELLED");
  const gbv = validPaid.reduce((s, o) => s + Number(o.totalAmount), 0);
  const earnings = validPaid.reduce((s, o) => s + Number(o.commissionAmount), 0);
  const gst = validPaid.reduce((s, o) => s + Number(o.gstAmount), 0);
  const escrowHeld = escrows.filter((e) => e.status === "HELD").reduce((s, e) => s + Number(e.grossAmount), 0);
  const pendingBalance = wallets.reduce((s, w) => s + Number(w.pendingBalance), 0);
  const refundTotal = refunds.filter((r) => r.status !== "REJECTED").reduce((s, r) => s + Number(r.amount), 0);

  return { gbv, earnings, gst, escrowHeld, pendingBalance, refundTotal, orders: orders.length, activeVendors: vendorGroups.filter((v) => v.status === "ACTIVE").reduce((s, v) => s + v._count, 0), pendingVendors: vendorGroups.filter((v) => v.status === "PENDING").reduce((s, v) => s + v._count, 0), liveListings: listings.filter((l) => l.status === "PUBLISHED").length, avgRating: listings.length > 0 ? listings.reduce((s, l) => s + Number(l.rating || 0), 0) / listings.length : 0 };
}
