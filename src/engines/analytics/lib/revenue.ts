import { prisma } from "@/lib/db/prisma";
import { projectFilter } from "@/lib/db/queries";

export async function getRevenueMetrics(projectId: string | null) {
  const where = projectFilter(projectId);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const orders = await prisma.order.findMany({
    where: { ...where, createdAt: { gte: sixMonthsAgo } },
    select: { totalAmount: true, createdAt: true, paymentStatus: true },
    orderBy: { createdAt: "asc" },
  });

  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const byMonth: Record<string, { revenue: number; orders: number }> = {};
  for (const o of orders) {
    if (o.paymentStatus !== "PAID") continue;
    const key = `${monthNames[o.createdAt.getMonth()]} ${o.createdAt.getFullYear()}`;
    if (!byMonth[key]) byMonth[key] = { revenue: 0, orders: 0 };
    byMonth[key].revenue += Number(o.totalAmount);
    byMonth[key].orders += 1;
  }

  const totalRevenue = orders.filter((o) => o.paymentStatus === "PAID").reduce((s, o) => s + Number(o.totalAmount), 0);
  const thisMonth = new Date().getMonth();
  const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
  const thisMonthName = monthNames[thisMonth];
  const lastMonthName = monthNames[lastMonth];
  const current = Object.entries(byMonth).filter(([k]) => k.startsWith(thisMonthName)).reduce((s, [, v]) => s + v.revenue, 0);
  const previous = Object.entries(byMonth).filter(([k]) => k.startsWith(lastMonthName)).reduce((s, [, v]) => s + v.revenue, 0);
  const change = previous > 0 ? ((current - previous) / previous) * 100 : 0;

  return {
    totalRevenue,
    monthlyData: Object.entries(byMonth).map(([month, d]) => ({ month, revenue: d.revenue, orders: d.orders })),
    current, previous, change,
  };
}
