import { prisma } from "@/lib/db/prisma";

export async function getProductMetrics(projectId: string | null) {
  const where = projectId ? { projectId } : {};
  const [active, lowStock, total] = await Promise.all([
    prisma.product.count({ where: { ...where, isActive: true } }),
    prisma.product.count({ where: { ...where, isActive: true, stock: { lte: 5 } } }),
    prisma.product.count({ where }),
  ]);
  return { active, lowStock, total };
}
