import { prisma } from "@/lib/db/prisma";

export async function createPayout(data: {
  projectId: string; vendorId: string;
  amount: number; mode?: string; notes?: string;
}) {
  return prisma.payout.create({ data: { ...data, status: "PENDING" } as any });
}

export async function processPayout(payoutId: string, status: string, reference?: string) {
  const payout = await prisma.payout.findUnique({ where: { id: payoutId } });
  if (!payout) throw new Error("Payout not found");

  const updateData: any = { status };
  if (reference) updateData.utrNumber = reference;
  if (status === "COMPLETED") updateData.processedAt = new Date();
  if (status === "COMPLETED" || status === "PROCESSING") {
    updateData.processedAt = new Date();
  }
  return prisma.payout.update({ where: { id: payoutId }, data: updateData });
}
