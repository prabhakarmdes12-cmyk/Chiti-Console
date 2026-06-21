import { prisma } from "@/lib/db/prisma";

export async function lookupCommissionRate(projectId: string, vendorId: string): Promise<number> {
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    select: { category: true },
  });
  if (!vendor) return 12;

  const vendorCommission = await prisma.commission.findFirst({
    where: { projectId, vendorId, isActive: true },
    orderBy: { effectiveFrom: "desc" },
  });
  if (vendorCommission) return Number(vendorCommission.rate);

  const categoryCommission = await prisma.commission.findFirst({
    where: { projectId, vendorId: null, category: vendor.category, isActive: true },
    orderBy: { effectiveFrom: "desc" },
  });
  if (categoryCommission) return Number(categoryCommission.rate);

  return 12;
}
