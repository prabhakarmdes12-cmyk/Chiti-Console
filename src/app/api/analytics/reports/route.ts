import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authenticate } from "@/lib/api/auth";

export async function GET(request: Request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [totalVendors, newVendors, totalEnquiries, newEnquiries, totalOrders, revenue] = await Promise.all([
    prisma.vendor.count({ where: { projectId: auth.project!.id } }),
    prisma.vendor.count({ where: { projectId: auth.project!.id, createdAt: { gte: thirtyDaysAgo } } }),
    prisma.enquiry.count({ where: { projectId: auth.project!.id } }),
    prisma.enquiry.count({ where: { projectId: auth.project!.id, createdAt: { gte: thirtyDaysAgo } } }),
    prisma.order.count({ where: { projectId: auth.project!.id, createdAt: { gte: thirtyDaysAgo } } }),
    prisma.order.aggregate({
      where: { projectId: auth.project!.id, status: "DELIVERED" as any, createdAt: { gte: thirtyDaysAgo } },
      _sum: { totalAmount: true },
    }),
  ]);

  return NextResponse.json({
    data: {
      totalVendors,
      newVendors,
      totalEnquiries,
      newEnquiries,
      totalOrders,
      revenue: revenue._sum.totalAmount || 0,
      period: { start: thirtyDaysAgo.toISOString(), end: now.toISOString() },
    },
  });
}
