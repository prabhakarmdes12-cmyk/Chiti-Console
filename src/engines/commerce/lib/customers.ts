import { prisma } from "@/lib/db/prisma";

export async function getCustomerMetrics(projectId: string | null) {
  const where = projectId ? { projectId } : {};
  const [total, withOrders, repeatBuyers] = await Promise.all([
    prisma.customer.count({ where }),
    prisma.customer.count({ where: { ...where, totalOrders: { gte: 1 } } }),
    prisma.customer.count({ where: { ...where, totalOrders: { gte: 2 } } }),
  ]);
  return { total, withOrders, repeatBuyers, conversionRate: total > 0 ? Math.round((withOrders / total) * 100) : 0 };
}
