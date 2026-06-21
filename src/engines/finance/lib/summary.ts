import { prisma } from "@/lib/db/prisma";
import { projectFilter } from "@/lib/db/queries";

export async function getFinanceSummary(projectId: string | null) {
  const where = projectFilter(projectId);
  const [paidOrders, escrows, wallets, payouts, refunds] = await Promise.all([
    prisma.order.findMany({ where: { ...where, paymentStatus: "PAID", status: { not: "CANCELLED" } }, select: { totalAmount: true, commissionAmount: true, platformFee: true, gstAmount: true } }),
    prisma.escrow.aggregate({ where: { ...where, status: "HELD" }, _sum: { grossAmount: true, vendorAmount: true } }),
    prisma.vendorWallet.aggregate({ where, _sum: { balance: true, pendingBalance: true } }),
    prisma.payout.aggregate({ where: { ...where, status: "PENDING" }, _sum: { amount: true } }),
    prisma.refund.aggregate({ where: { ...where, status: { not: "REJECTED" } }, _sum: { amount: true } }),
  ]);

  return {
    totalRevenue: paidOrders.reduce((s, o) => s + Number(o.totalAmount), 0),
    totalCommissions: paidOrders.reduce((s, o) => s + Number(o.commissionAmount), 0),
    totalPlatformFees: paidOrders.reduce((s, o) => s + Number(o.platformFee), 0),
    totalGst: paidOrders.reduce((s, o) => s + Number(o.gstAmount), 0),
    escrowHeld: Number(escrows._sum.grossAmount || 0),
    vendorAmountHeld: Number(escrows._sum.vendorAmount || 0),
    walletBalance: Number(wallets._sum.balance || 0),
    pendingBalance: Number(wallets._sum.pendingBalance || 0),
    pendingPayouts: Number(payouts._sum.amount || 0),
    totalRefunds: Number(refunds._sum.amount || 0),
  };
}
