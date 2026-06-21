import { prisma } from "@/lib/db/prisma";

export async function releaseEscrow(escrowId: string) {
  const escrow = await prisma.escrow.findUnique({
    where: { id: escrowId },
    include: { order: { select: { vendorId: true } } },
  });
  if (!escrow || escrow.status !== "HELD") throw new Error("Escrow not held");
  if (!escrow.order.vendorId) throw new Error("Escrow order has no vendor");

  await prisma.$transaction([
    prisma.escrow.update({ where: { id: escrowId }, data: { status: "RELEASED", releasedAt: new Date() } }),
    prisma.vendorWallet.update({
      where: { vendorId: escrow.order.vendorId },
      data: { balance: { increment: escrow.vendorAmount }, pendingBalance: { decrement: escrow.vendorAmount } },
    }),
  ]);
}

export async function cancelEscrow(escrowId: string) {
  const escrow = await prisma.escrow.findUnique({
    where: { id: escrowId },
    include: { order: { select: { vendorId: true } } },
  });
  if (!escrow || escrow.status !== "HELD") throw new Error("Escrow not held");
  if (!escrow.order.vendorId) throw new Error("Escrow order has no vendor");

  await prisma.$transaction([
    prisma.escrow.update({ where: { id: escrowId }, data: { status: "REFUNDED", refundedAt: new Date() } }),
    prisma.vendorWallet.update({
      where: { vendorId: escrow.order.vendorId },
      data: { pendingBalance: { decrement: escrow.vendorAmount } },
    }),
  ]);
}
