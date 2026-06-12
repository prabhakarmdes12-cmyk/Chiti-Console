import { cookies } from "next/headers";
import { prisma } from "./prisma";

export async function getProject() {
  const cookieStore = await cookies();
  const projectId = cookieStore.get("chiti_project")?.value;
  if (!projectId || projectId === "all") return null;
  return prisma.project.findUnique({ where: { id: projectId } });
}

export async function getProjectId() {
  const project = await getProject();
  return project?.id ?? null;
}

export function projectFilter(projectId: string | null) {
  return projectId ? { projectId } : {};
}

export async function getProjectHealth(projectId: string) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [orderCount, unreadWA, oosCount, staleLeads, contentCount] = await Promise.all([
    prisma.order.count({ where: { projectId, createdAt: { gte: thirtyDaysAgo } } }),
    prisma.whatsAppConversation.findMany({ where: { projectId }, select: { unreadCount: true } }),
    prisma.product.count({ where: { projectId, stock: 0, isActive: true } }),
    prisma.lead.count({ where: { projectId, status: { in: ["NEW", "CONTACTED"] }, createdAt: { lt: thirtyDaysAgo } } }),
    prisma.contentEntry.count({ where: { projectId, createdAt: { gte: thirtyDaysAgo } } }),
  ]);

  const totalUnread = unreadWA.reduce((sum, c) => sum + c.unreadCount, 0);

  let score = 100;
  if (orderCount === 0) score -= 20;
  score -= Math.min(totalUnread * 5, 20);
  score -= Math.min(oosCount * 10, 20);
  score -= Math.min(staleLeads * 5, 20);
  if (contentCount === 0) score -= 20;

  return { score: Math.max(0, score), orderCount, totalUnread, oosCount, staleLeads, contentCount };
}

export async function getTodayPriorities(projectId: string | null) {
  const where = projectFilter(projectId);

  const [staleLeads, oosProducts, unreadConversations, pendingOrders] = await Promise.all([
    prisma.lead.findMany({
      where: { ...where, status: { in: ["NEW", "CONTACTED"] } },
      orderBy: { createdAt: "asc" },
      take: 5,
      include: { project: { select: { name: true } } },
    }),
    prisma.product.findMany({
      where: { ...where, stock: 0, isActive: true },
      take: 5,
      include: { project: { select: { name: true } } },
    }),
    prisma.whatsAppConversation.findMany({
      where: { ...where, unreadCount: { gt: 0 } },
      orderBy: { unreadCount: "desc" },
      take: 5,
      include: { project: { select: { name: true } }, customer: { select: { name: true } } },
    }),
    prisma.order.findMany({
      where: { ...where, status: "PENDING", createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      orderBy: { createdAt: "asc" },
      take: 5,
      include: { project: { select: { name: true } }, customer: { select: { name: true } } },
    }),
  ]);

  return { staleLeads, oosProducts, unreadConversations, pendingOrders };
}

export async function getExpectedRevenue(projectId: string | null) {
  const where = projectFilter(projectId);
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [thisMonth, lastMonth] = await Promise.all([
    prisma.order.aggregate({ where: { ...where, createdAt: { gte: startOfMonth } }, _sum: { totalAmount: true } }),
    prisma.order.aggregate({ where: { ...where, createdAt: { gte: startOfLastMonth, lt: startOfMonth } }, _sum: { totalAmount: true } }),
  ]);

  const current = Number(thisMonth._sum.totalAmount ?? 0);
  const previous = Number(lastMonth._sum.totalAmount ?? 0);
  const change = previous > 0 ? ((current - previous) / previous) * 100 : 0;

  return { current, previous, change };
}
