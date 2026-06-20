import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authenticate } from "@/lib/api/auth";

export async function GET(request: Request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  const projectId = auth.project!.id;
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalEnquiries,
    pendingVendorsCount,
    activeVendorsCount,
    totalListings,
    enquiriesByStatus,
    enquiriesByType,
    monthlyRevenue,
    enquiriesThisWeek,
    conversionData,
    vendorGrowthData,
    listingGrowthData,
    userGrowthData,
    vendorsWithResponse,
  ] = await Promise.all([
    prisma.enquiry.count({ where: { projectId } }),
    prisma.vendor.count({ where: { projectId, status: "PENDING" } }),
    prisma.vendor.count({ where: { projectId, status: "ACTIVE" } }),
    prisma.listing.count({ where: { projectId } }),
    prisma.enquiry.groupBy({ by: ["status"], where: { projectId }, _count: true }),
    prisma.enquiry.groupBy({ by: ["type"], where: { projectId }, _count: true }),
    prisma.order.aggregate({
      where: { projectId, createdAt: { gte: firstOfMonth }, status: "DELIVERED" as any },
      _sum: { totalAmount: true },
    }),
    Promise.all(
      Array.from({ length: 7 }, (_, i) => {
        const dayStart = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
        return prisma.enquiry.count({
          where: { projectId, createdAt: { gte: dayStart, lt: dayEnd } },
        });
      })
    ),
    prisma.enquiry.groupBy({ by: ["status"], where: { projectId, createdAt: { gte: thirtyDaysAgo } }, _count: true }),
    prisma.vendor.count({ where: { projectId, createdAt: { gte: thirtyDaysAgo } } }),
    prisma.listing.count({ where: { projectId, createdAt: { gte: thirtyDaysAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.vendor.findMany({
      where: { projectId, avgResponseTime: { not: null } },
      select: { avgResponseTime: true },
    }),
  ]);

  const pendingVendors = await prisma.vendor.findMany({
    where: { projectId, status: "PENDING" },
    select: { id: true, businessName: true, ownerName: true, category: true, district: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  const statusMap: Record<string, number> = {};
  for (const s of enquiriesByStatus) statusMap[s.status] = s._count;

  const typeMap: Record<string, number> = {};
  for (const t of enquiriesByType) typeMap[t.type] = t._count;

  const statusRecent: Record<string, number> = {};
  for (const s of conversionData) statusRecent[s.status] = s._count;
  const totalRecent = Object.values(statusRecent).reduce((a, b) => a + b, 0);
  const conversionRate = totalRecent > 0 ? ((statusRecent["COMPLETED"] || 0) / totalRecent) * 100 : 0;

  const avgTimeStr = vendorsWithResponse.length > 0
    ? vendorsWithResponse.reduce((acc, v) => {
        const t = v.avgResponseTime!;
        return acc + (t.endsWith("h") ? parseFloat(t) : 0);
      }, 0) / vendorsWithResponse.length + "h"
    : "0h";

  const destinations = await prisma.listing.findMany({
    where: { projectId },
    select: { location: true },
  });
  const districtCounts: Record<string, number> = {};
  for (const d of destinations) {
    const loc = d.location as any;
    const district = loc?.district || "Unknown";
    districtCounts[district] = (districtCounts[district] || 0) + 1;
  }
  const topDestinations = Object.entries(districtCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name);

  return NextResponse.json({
    data: {
      totalEnquiries,
      pendingVendors: { count: pendingVendorsCount, items: pendingVendors },
      activeListings: activeVendorsCount,
      openTickets: 0,
      monthlyRevenue: monthlyRevenue._sum.totalAmount ? Number(monthlyRevenue._sum.totalAmount) : 0,
      enquiriesThisWeek,
      enquiriesByCategory: typeMap,
      topDestinations,
      vendorGrowth: {
        vendorsThisMonth: vendorGrowthData,
        listingsThisMonth: listingGrowthData,
        usersThisMonth: userGrowthData,
      },
      avgResponseTime: avgTimeStr,
      conversionRate: Math.round(conversionRate * 10) / 10,
    },
  });
}
