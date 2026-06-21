import { prisma } from "@/lib/db/prisma";

export async function approveRefund(refundId: string) {
  return prisma.refund.update({ where: { id: refundId }, data: { status: "APPROVED" } });
}

export async function processRefund(refundId: string) {
  const refund = await prisma.refund.findUnique({
    where: { id: refundId },
    include: { order: { select: { vendorId: true } } },
  });
  if (!refund) throw new Error("Refund not found");

  return prisma.$transaction(async (tx) => {
    await tx.refund.update({ where: { id: refundId }, data: { status: "PROCESSED", processedAt: new Date() } });
    const vendorId = refund.order?.vendorId;
    if (vendorId) {
      const wallet = await tx.vendorWallet.findUnique({ where: { vendorId } });
      if (wallet) {
        await tx.vendorWallet.update({
          where: { vendorId },
          data: { balance: { decrement: refund.amount }, totalEarned: { decrement: refund.amount } },
        });
        await tx.walletTransaction.create({
          data: {
            projectId: refund.projectId, walletId: wallet.id, vendorId,
            type: "REFUND", amount: refund.amount,
            description: `Refund for order ${refund.orderId}`, referenceId: refund.orderId,
          },
        });
      }
    }
  });
}
