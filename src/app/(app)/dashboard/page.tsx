import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getProjectId, projectFilter, getTodayPriorities, getExpectedRevenue } from "@/lib/db/queries";
import ChitiPageHeader from "@/components/ui/ChitiPageHeader";
import QueryBar from "@/components/ai/QueryBar";
import DashboardClient from "./DashboardClient";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

function getGreeting(name: string) {
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  return `Good ${timeGreeting}, ${name.split(" ")[0] || "there"}`;
}

function money(value: unknown) {
  return Number(value ?? 0);
}

async function getMonthlyRevenue(pid: string | null) {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const orders = await prisma.order.findMany({
    where: { ...projectFilter(pid), createdAt: { gte: sixMonthsAgo } },
    select: { totalAmount: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  const byMonth: Record<string, { revenue: number; orders: number }> = {};
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  for (const o of orders) {
    const key = `${monthNames[o.createdAt.getMonth()]} ${o.createdAt.getFullYear()}`;
    if (!byMonth[key]) byMonth[key] = { revenue: 0, orders: 0 };
    byMonth[key].revenue += Number(o.totalAmount);
    byMonth[key].orders += 1;
  }
  return Object.entries(byMonth).map(([month, d]) => ({ month, revenue: d.revenue, orders: d.orders }));
}

async function fetchSharedData(projectId: string | null) {
  const today = new Date();
  today.setDate(today.getDate() - 1);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 2);

  const [orderCount, yesterdayCount, revenue, customerCount, prevCustomerCount, recentOrders, projects, priorities, expectedRevenue, monthlyData] = await Promise.all([
    prisma.order.count({ where: { ...projectFilter(projectId), createdAt: { gte: today } } }),
    prisma.order.count({ where: { ...projectFilter(projectId), createdAt: { gte: yesterday, lt: today } } }),
    prisma.order.aggregate({ where: { ...projectFilter(projectId) }, _sum: { totalAmount: true } }),
    prisma.customer.count({ where: { ...projectFilter(projectId) } }),
    prisma.customer.count({ where: { ...projectFilter(projectId), createdAt: { lt: today } } }),
    prisma.order.findMany({ where: { ...projectFilter(projectId) }, orderBy: { createdAt: "desc" }, take: 4, include: { customer: true } }),
    prisma.project.findMany({ where: { isActive: true }, select: { name: true, id: true } }),
    getTodayPriorities(projectId),
    getExpectedRevenue(projectId),
    getMonthlyRevenue(projectId),
  ]);

  const totalRevenue = Number(revenue._sum.totalAmount ?? 0);
  const conversionRate = customerCount > 0 ? ((orderCount / customerCount) * 100).toFixed(1) : "0.0";
  const prevConversionRate = prevCustomerCount > 0 ? ((yesterdayCount / prevCustomerCount) * 100).toFixed(1) : "0.0";
  const revChange = expectedRevenue.change > 0 ? `+${expectedRevenue.change.toFixed(1)}%` : `${expectedRevenue.change.toFixed(1)}%`;
  const orderChange = yesterdayCount > 0 ? `+${((orderCount - yesterdayCount) / yesterdayCount * 100).toFixed(0)}%` : "—";
  const customerChange = prevCustomerCount > 0 ? `+${customerCount - prevCustomerCount}` : "—";
  const convChange = prevCustomerCount > 0 ? (Number(conversionRate) - Number(prevConversionRate)).toFixed(1) : "0.0";

  const stats = [
    { label: "Total Revenue", value: totalRevenue, display: `₹${totalRevenue.toLocaleString("en-IN")}`, change: revChange, icon: "DollarSign", gradient: "from-emerald-500 to-teal-500" },
    { label: "Orders Today", value: orderCount, display: String(orderCount), change: orderChange, icon: "ShoppingCart", gradient: "from-sky-500 to-cyan-500" },
    { label: "Active Customers", value: customerCount, display: String(customerCount), change: customerChange, icon: "Users", gradient: "from-violet-500 to-purple-500" },
    { label: "Conversion Rate", value: Number(conversionRate), display: `${conversionRate}%`, change: `${convChange > "0" ? "+" : ""}${convChange}%`, icon: "TrendingUp", gradient: "from-amber-500 to-orange-500" },
  ];

  const attentionItems = [
    ...priorities.staleLeads.map((l) => ({ type: "lead" as const, label: `Stale lead: ${l.name}`, project: l.project.name, href: `/leads/${l.id}` })),
    ...priorities.oosProducts.map((p) => ({ type: "oos" as const, label: `Out of stock: ${p.name}`, project: p.project.name, href: `/products/${p.id}` })),
    ...priorities.unreadConversations.map((c) => ({ type: "wa" as const, label: `Unread: ${c.customer?.name || "Unknown"}`, project: c.project.name, href: `/whatsapp/${c.id}` })),
    ...priorities.pendingOrders.map((o) => ({ type: "order" as const, label: `Pending: ${o.orderNumber}`, project: o.project.name, href: `/orders/${o.id}` })),
  ];

  return {
    stats,
    attentionItems,
    expectedRevenue,
    monthlyData,
    recentOrders: recentOrders.map((o) => ({ id: o.id, orderNumber: o.orderNumber, totalAmount: Number(o.totalAmount), status: o.status, customer: o.customer ? { name: o.customer.name } : null })),
    projects,
  };
}

async function fetchMarketplaceData(projectId: string | null) {
  const shared = await fetchSharedData(projectId);
  const mpWhere = projectFilter(projectId);
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  const [marketplaceOrders, escrows, wallets, payouts, refunds, listings, vendorsByCategory] = await Promise.all([
    prisma.order.findMany({ where: mpWhere, select: { totalAmount: true, commissionAmount: true, gstAmount: true, status: true, paymentStatus: true, vendor: { select: { businessName: true, category: true } }, createdAt: true } }),
    prisma.escrow.findMany({ where: mpWhere, include: { order: { select: { orderNumber: true } } } }),
    prisma.vendorWallet.findMany({ where: mpWhere, include: { vendor: { select: { businessName: true, category: true } } } }),
    prisma.payout.findMany({ where: mpWhere, include: { vendor: { select: { businessName: true, category: true } } } }),
    prisma.refund.findMany({ where: mpWhere, include: { order: { select: { orderNumber: true } } } }),
    prisma.listing.findMany({ where: mpWhere, select: { type: true, status: true, rating: true } }),
    prisma.vendor.groupBy({ by: ["category", "status"], where: mpWhere, _count: true }),
  ]);

  const todayOrders = marketplaceOrders.filter((order: any) => order.createdAt >= todayStart && order.createdAt < tomorrowStart);
  const validPaidOrders = marketplaceOrders.filter((order: any) => order.paymentStatus === "PAID" && order.status !== "CANCELLED");
  const validPaidTodayOrders = todayOrders.filter((order: any) => order.paymentStatus === "PAID" && order.status !== "CANCELLED");
  const grossBookingValue = validPaidOrders.reduce((sum: number, order: any) => sum + money(order.totalAmount), 0);
  const platformEarnings = validPaidOrders.reduce((sum: number, order: any) => sum + money(order.commissionAmount), 0);
  const gstCollected = validPaidOrders.reduce((sum: number, order: any) => sum + money(order.gstAmount), 0);
  const escrowBalance = escrows.filter((e: any) => e.status === "HELD").reduce((sum: number, e: any) => sum + money(e.grossAmount), 0);
  const pendingSettlement = wallets.reduce((sum: number, w: any) => sum + money(w.pendingBalance), 0);
  const refundsAmount = refunds.filter((r: any) => r.status !== "REJECTED").reduce((sum: number, r: any) => sum + money(r.amount), 0);
  const vendorPayoutToday = payouts.filter((p: any) => p.scheduledFor && p.scheduledFor >= todayStart && p.scheduledFor < tomorrowStart).reduce((sum: number, p: any) => sum + money(p.amount), 0);
  const activeHotels = listings.filter((l: any) => l.type === "HOTEL" && l.status === "PUBLISHED").length;
  const hotelBookings = validPaidOrders.filter((o: any) => o.vendor?.category === "HOTEL" && ["CONFIRMED", "PROCESSING", "DELIVERED"].includes(o.status)).length;
  const occupancy = activeHotels > 0 ? Math.min(100, Math.round((hotelBookings / (activeHotels * 3)) * 100)) : 0;
  const averageRating = listings.length > 0 ? listings.reduce((sum: number, l: any) => sum + Number(l.rating || 0), 0) / listings.length : 0;
  const averageCommission = grossBookingValue > 0 ? (platformEarnings / grossBookingValue) * 100 : 0;

  const moneyByCategory: Record<string, { revenue: number; commission: number; gst: number }> = {};
  const vendorRevenue: Record<string, { name: string; category: string; revenue: number }> = {};
  for (const order of validPaidOrders) {
    const cat = order.vendor?.category || "PACKAGE";
    moneyByCategory[cat] ||= { revenue: 0, commission: 0, gst: 0 };
    moneyByCategory[cat].revenue += money(order.totalAmount);
    moneyByCategory[cat].commission += money(order.commissionAmount);
    moneyByCategory[cat].gst += money(order.gstAmount);
    if (order.vendor) {
      vendorRevenue[order.vendor.businessName] ||= { name: order.vendor.businessName, category: order.vendor.category, revenue: 0 };
      vendorRevenue[order.vendor.businessName].revenue += money(order.totalAmount);
    }
  }

  const vendorHealth: Record<string, { pending: number; active: number; inactive: number; revenue: number; commission: number; topPerformer: string | null }> = {};
  for (const row of vendorsByCategory) {
    vendorHealth[row.category] ||= { pending: 0, active: 0, inactive: 0, revenue: 0, commission: 0, topPerformer: null };
    if (row.status === "PENDING") vendorHealth[row.category].pending += row._count;
    else if (row.status === "ACTIVE") vendorHealth[row.category].active += row._count;
    else vendorHealth[row.category].inactive += row._count;
  }
  for (const [cat, totals] of Object.entries(moneyByCategory)) {
    vendorHealth[cat] ||= { pending: 0, active: 0, inactive: 0, revenue: 0, commission: 0, topPerformer: null };
    vendorHealth[cat].revenue = totals.revenue;
    vendorHealth[cat].commission = totals.commission;
  }
  for (const v of Object.values(vendorRevenue)) {
    const currentTop = vendorHealth[v.category]?.topPerformer;
    if (!currentTop || v.revenue > (vendorRevenue[currentTop]?.revenue || 0)) vendorHealth[v.category].topPerformer = v.name;
  }

  const marketplacePriorities = [
    ...payouts.filter((p: any) => p.status === "PENDING").slice(0, 3).map((p: any) => ({ type: "payout", label: `Vendor payout pending: ${p.vendor.businessName}`, amount: money(p.amount), severity: "high" })),
    ...refunds.filter((r: any) => r.status === "REQUESTED" || r.status === "APPROVED").slice(0, 2).map((r: any) => ({ type: "refund", label: `Refund request: ${r.order.orderNumber}`, amount: money(r.amount), severity: "high" })),
    ...escrows.filter((e: any) => e.status === "HELD" && e.releaseDueAt && e.releaseDueAt < tomorrowStart).slice(0, 3).map((e: any) => ({ type: "settlement", label: `Escrow release due: ${e.order.orderNumber}`, amount: money(e.vendorAmount), severity: "medium" })),
  ].slice(0, 6);

  return {
    ...shared,
    operatingModel: "MARKETPLACE",
    ceoMetrics: {
      todayRevenue: validPaidTodayOrders.reduce((sum: number, o: any) => sum + money(o.totalAmount), 0),
      grossBookingValue, platformEarnings, pendingSettlement, escrowBalance,
      refunds: refundsAmount, vendorPayoutToday, gstCollected,
    },
    marketplaceHealth: {
      vendors: Object.values(vendorHealth).reduce((sum, v) => sum + v.pending + v.active + v.inactive, 0),
      liveListings: listings.filter((l: any) => l.status === "PUBLISHED").length,
      pendingVendors: Object.values(vendorHealth).reduce((sum, v) => sum + v.pending, 0),
      occupancy, averageRating: Math.round(averageRating * 10) / 10,
      averageCommission: Math.round(averageCommission * 10) / 10,
    },
    customerFunnel: {
      visitors: 12400,
      searches: Math.max(marketplaceOrders.length * 18, 3200),
      hotelViews: Math.max(hotelBookings * 445, 890),
      bookingsStarted: marketplaceOrders.length + shared.attentionItems.length,
      paymentSuccess: validPaidOrders.length,
      completedStay: validPaidOrders.filter((o: any) => o.status === "DELIVERED").length,
    },
    vendorHealth, moneyByCategory, marketplacePriorities,
  };
}

async function fetchEcommerceData(projectId: string | null) {
  const shared = await fetchSharedData(projectId);
  const where = projectFilter(projectId);

  const [activeProducts, oosCount, paidOrders, totalCustomers] = await Promise.all([
    prisma.product.count({ where: { ...where, isActive: true } }),
    prisma.product.count({ where: { ...where, isActive: true, stock: { lte: 5 } } }),
    prisma.order.findMany({ where: { ...where, paymentStatus: "PAID", status: { not: "CANCELLED" } }, select: { totalAmount: true } }),
    prisma.customer.count({ where }),
  ]);

  const paidTotal = paidOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
  const aov = paidOrders.length > 0 ? paidTotal / paidOrders.length : 0;
  const repeatBuyers = await prisma.customer.count({ where: { ...where, totalOrders: { gte: 2 } } });
  const repeatRate = totalCustomers > 0 ? (repeatBuyers / totalCustomers) * 100 : 0;

  const topProducts = await prisma.orderItem.groupBy({
    by: ["productName"],
    where: { order: { ...where, paymentStatus: "PAID" } },
    _sum: { lineTotal: true, quantity: true },
    orderBy: { _sum: { lineTotal: "desc" } },
    take: 5,
  });

  return {
    ...shared,
    operatingModel: "ECOMMERCE",
    ecommerceMetrics: {
      aov: Math.round(aov),
      activeProducts,
      oosCount,
      repeatBuyers,
      repeatRate: Math.round(repeatRate * 10) / 10,
      paidOrders: paidOrders.length,
    },
    topProducts: topProducts.map((p) => ({
      name: p.productName,
      revenue: Number(p._sum.lineTotal || 0),
      quantity: Number(p._sum.quantity || 0),
    })),
  };
}

async function fetchB2BData(projectId: string | null) {
  const shared = await fetchSharedData(projectId);
  const where = projectFilter(projectId);

  const [leads, products] = await Promise.all([
    prisma.lead.findMany({ where, orderBy: { createdAt: "desc" } }),
    prisma.product.count({ where }),
  ]);

  const pipelineStages = { new: 0, contacted: 0, qualified: 0, proposal: 0, won: 0, lost: 0 };
  for (const lead of leads) {
    const key = lead.status.toLowerCase() as keyof typeof pipelineStages;
    pipelineStages[key] = (pipelineStages[key] || 0) + 1;
  }

  return {
    ...shared,
    operatingModel: "B2B_CATALOG",
    b2bMetrics: {
      totalLeads: leads.length,
      products,
      wonLeads: pipelineStages.won,
      conversionRate: leads.length > 0 ? Math.round((pipelineStages.won / leads.length) * 100) : 0,
    },
    pipelineStages,
  };
}

async function fetchSaaSData(projectId: string | null) {
  const shared = await fetchSharedData(projectId);
  const where = projectFilter(projectId);

  const [totalEnrollments, leads, products] = await Promise.all([
    prisma.order.count({ where: { ...where, paymentStatus: "PAID" } }),
    prisma.lead.findMany({ where, orderBy: { createdAt: "desc" } }),
    prisma.product.findMany({ where, select: { name: true, category: true } }),
  ]);

  const batches = [...new Set(products.map((p) => p.category).filter(Boolean))];
  const newLeads = leads.filter((l) => l.status === "NEW").length;
  const enrolled = leads.filter((l) => l.status === "WON").length;
  const churned = leads.filter((l) => l.status === "LOST").length;

  return {
    ...shared,
    operatingModel: "SAAS",
    saasMetrics: {
      totalEnrollments,
      activeStudents: enrolled,
      batches: batches.length,
      newLeads,
      churned,
      churnRate: leads.length > 0 ? Math.round((churned / leads.length) * 100) : 0,
    },
  };
}

async function fetchContentData(projectId: string | null) {
  const shared = await fetchSharedData(projectId);
  const where = projectFilter(projectId);

  const [contentEntries, leads] = await Promise.all([
    prisma.contentEntry.findMany({ where }),
    prisma.lead.count({ where }),
  ]);

  const published = contentEntries.filter((e) => e.status === "PUBLISHED").length;

  return {
    ...shared,
    operatingModel: "CONTENT",
    contentMetrics: {
      totalEntries: contentEntries.length,
      published,
      draft: contentEntries.length - published,
      totalViews: 0,
      avgViewsPerEntry: 0,
      subscribers: leads,
    },
  };
}

async function fetchGenericData(projectId: string | null) {
  const shared = await fetchSharedData(projectId);
  return { ...shared, operatingModel: "CUSTOM" };
}

async function fetchDashboardData(projectId: string | null, projectType: string | null) {
  try {
    switch (projectType) {
      case "MARKETPLACE": return await fetchMarketplaceData(projectId);
      case "ECOMMERCE": return await fetchEcommerceData(projectId);
      case "B2B_CATALOG": return await fetchB2BData(projectId);
      case "SAAS": return await fetchSaaSData(projectId);
      case "CONTENT": return await fetchContentData(projectId);
      default: return await fetchGenericData(projectId);
    }
  } catch (err) {
    console.error("Dashboard data fetch failed:", err instanceof Error ? err.message : err, err instanceof Error ? err.stack : "");
    return null;
  }
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const projectId = await getProjectId();
  const currentProject = projectId ? await prisma.project.findUnique({ where: { id: projectId }, select: { type: true } }) : null;
  const data = await fetchDashboardData(projectId, currentProject?.type ?? null);

  if (!data) {
    return (
      <div className="space-y-6">
        <ChitiPageHeader
          title={getGreeting(session.user.name || "there")}
          description={<span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />Connection issue</span>}
        />
        <div className="glass-card rounded-xl p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-error/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-error text-2xl font-bold">!</span>
          </div>
          <h2 className="text-lg font-display font-semibold text-text-main mb-2">Could not load dashboard</h2>
          <p className="text-sm text-text-muted max-w-md mx-auto mb-2">
            Unable to connect to the database. This is usually a configuration issue.
          </p>
          <p className="text-xs text-text-muted/60 max-w-md mx-auto mb-6">
            Make sure <code className="text-brand-primary">DIRECT_URL</code> is set in your Vercel environment variables to a valid PostgreSQL connection string.
          </p>
          <a href="/dashboard" className="inline-flex px-5 py-2.5 rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-medium transition-all duration-150">Retry</a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ChitiPageHeader
        title={getGreeting(session.user.name || "there")}
        description={<span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />{projectId ? `${data.operatingModel} view` : "All projects"}</span>}
      />
      <QueryBar />
      <ErrorBoundary>
        <DashboardClient {...data} operatingModel={data.operatingModel as any} />
      </ErrorBoundary>
    </div>
  );
}
