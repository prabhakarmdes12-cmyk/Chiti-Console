import { prisma } from "@/lib/db/prisma";
import { projectFilter } from "@/lib/db/queries";

export async function getDashboardMetrics(projectId: string | null) {
  const where = projectFilter(projectId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

  const [ordersToday, ordersYesterday, revenue, customers] = await Promise.all([
    prisma.order.count({ where: { ...where, createdAt: { gte: today } } }),
    prisma.order.count({ where: { ...where, createdAt: { gte: yesterday, lt: today } } }),
    prisma.order.aggregate({ where, _sum: { totalAmount: true } }),
    prisma.customer.count({ where }),
  ]);

  return {
    ordersToday,
    ordersYesterday,
    totalRevenue: Number(revenue._sum.totalAmount || 0),
    totalCustomers: customers,
  };
}
