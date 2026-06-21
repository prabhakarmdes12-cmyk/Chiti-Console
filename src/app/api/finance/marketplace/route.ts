import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authenticate } from "@/lib/api/auth";

function money(value: unknown) {
  return Number(value ?? 0);
}

export async function GET(request: Request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  const projectId = auth.project!.id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [orders, escrows, wallets, payouts, refunds, commissions] = await Promise.all([
    prisma.order.findMany({
      where: { projectId },
      select: { id: true, orderNumber: true, status: true, paymentStatus: true, totalAmount: true, commissionAmount: true, gstAmount: true, vendor: { select: { id: true, businessName: true, category: true } }, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.escrow.findMany({ where: { projectId }, orderBy: { createdAt: "desc" }, include: { order: { select: { orderNumber: true } } } }),
    prisma.vendorWallet.findMany({ where: { projectId }, include: { vendor: { select: { businessName: true, category: true } } } }),
    prisma.payout.findMany({ where: { projectId }, orderBy: { createdAt: "desc" }, include: { vendor: { select: { businessName: true, category: true } } } }),
    prisma.refund.findMany({ where: { projectId }, orderBy: { createdAt: "desc" }, include: { order: { select: { orderNumber: true } } } }),
    prisma.commission.findMany({ where: { projectId, isActive: true }, orderBy: { category: "asc" } }),
  ]);

  const validPaidOrders = orders.filter((order) => order.paymentStatus === "PAID" && order.status !== "CANCELLED");
  const grossBookingValue = validPaidOrders.reduce((sum, order) => sum + money(order.totalAmount), 0);
  const platformEarnings = validPaidOrders.reduce((sum, order) => sum + money(order.commissionAmount), 0);
  const gstCollected = validPaidOrders.reduce((sum, order) => sum + money(order.gstAmount), 0);
  const escrowBalance = escrows.filter((e) => e.status === "HELD").reduce((sum, e) => sum + money(e.grossAmount), 0);
  const pendingSettlement = wallets.reduce((sum, w) => sum + money(w.pendingBalance), 0);
  const vendorWalletBalance = wallets.reduce((sum, w) => sum + money(w.balance), 0);
  const refundsRequested = refunds.filter((r) => r.status === "REQUESTED" || r.status === "APPROVED").reduce((sum, r) => sum + money(r.amount), 0);
  const vendorPayoutToday = payouts.filter((p) => p.scheduledFor && p.scheduledFor >= today && p.scheduledFor < new Date(today.getTime() + 24 * 60 * 60 * 1000)).reduce((sum, p) => sum + money(p.amount), 0);

  return NextResponse.json({
    data: {
      summary: {
        grossBookingValue,
        platformEarnings,
        gstCollected,
        escrowBalance,
        pendingSettlement,
        vendorWalletBalance,
        refundsRequested,
        vendorPayoutToday,
      },
      orders: orders.slice(0, 20).map((order) => ({
        ...order,
        totalAmount: money(order.totalAmount),
        commissionAmount: money(order.commissionAmount),
        gstAmount: money(order.gstAmount),
      })),
      escrows: escrows.map((escrow) => ({
        id: escrow.id,
        orderNumber: escrow.order.orderNumber,
        grossAmount: money(escrow.grossAmount),
        commissionAmount: money(escrow.commissionAmount),
        vendorAmount: money(escrow.vendorAmount),
        gstAmount: money(escrow.gstAmount),
        status: escrow.status,
        releaseDueAt: escrow.releaseDueAt,
      })),
      wallets: wallets.map((wallet) => ({
        id: wallet.id,
        vendorId: wallet.vendorId,
        vendorName: wallet.vendor.businessName,
        category: wallet.vendor.category,
        balance: money(wallet.balance),
        pendingBalance: money(wallet.pendingBalance),
        totalEarned: money(wallet.totalEarned),
        totalWithdrawn: money(wallet.totalWithdrawn),
      })),
      payouts: payouts.map((payout) => ({
        id: payout.id,
        vendorId: payout.vendorId,
        vendorName: payout.vendor.businessName,
        category: payout.vendor.category,
        amount: money(payout.amount),
        status: payout.status,
        scheduledFor: payout.scheduledFor,
        processedAt: payout.processedAt,
        utrNumber: payout.utrNumber,
      })),
      refunds: refunds.map((refund) => ({
        id: refund.id,
        orderNumber: refund.order.orderNumber,
        amount: money(refund.amount),
        status: refund.status,
        reason: refund.reason,
        requestedAt: refund.requestedAt,
      })),
      commissions: commissions.map((commission) => ({
        id: commission.id,
        category: commission.category,
        vendorId: commission.vendorId,
        rate: money(commission.rate),
        minAmount: money(commission.minAmount),
        maxAmount: commission.maxAmount ? money(commission.maxAmount) : null,
      })),
    },
  });
}
