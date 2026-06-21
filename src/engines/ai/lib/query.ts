import { prisma } from "@/lib/db/prisma";
import { projectFilter } from "@/lib/db/queries";

export async function performQuery(question: string, projectId: string | null) {
  const q = question.toLowerCase();
  const where = projectFilter(projectId);

  if (q.includes("revenue") || q.includes("earn")) {
    const data = await prisma.order.aggregate({ where: { ...where, paymentStatus: "PAID" }, _sum: { totalAmount: true } });
    return { intent: "revenue", data: { totalRevenue: Number(data._sum.totalAmount || 0) } };
  }
  if (q.includes("order") || q.includes("sale")) {
    const total = await prisma.order.count({ where });
    const pending = await prisma.order.count({ where: { ...where, status: "PENDING" } });
    return { intent: "orders", data: { total, pending } };
  }
  if (q.includes("customer") || q.includes("client")) {
    const total = await prisma.customer.count({ where });
    return { intent: "customers", data: { total } };
  }
  if (q.includes("pending") || q.includes("overdue")) {
    const [pendingOrders, pendingPayouts] = await Promise.all([
      prisma.order.count({ where: { ...where, status: "PENDING" } }),
      prisma.payout.count({ where: { ...where, status: "PENDING" } }),
    ]);
    return { intent: "pending", data: { pendingOrders, pendingPayouts } };
  }

  return { intent: "unknown", data: { message: "I can answer about revenue, orders, customers, and pending items." } };
}
