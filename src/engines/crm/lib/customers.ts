import { prisma } from "@/lib/db/prisma";

export async function getCustomerInsights(projectId: string | null) {
  const where = projectId ? { projectId } : {};
  const [total, newThisMonth] = await Promise.all([
    prisma.customer.count({ where }),
    prisma.customer.count({
      where: { ...where, createdAt: { gte: new Date(new Date().setDate(1)) } },
    }),
  ]);
  return { total, newThisMonth };
}
