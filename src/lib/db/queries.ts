import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";

const ADMIN_ROLES = ["SUPER_ADMIN", "PROJECT_ADMIN"] as const;
const FINANCE_ROLES = ["SUPER_ADMIN", "PROJECT_ADMIN", "FINANCE_MANAGER"] as const;
const ALL_ROLES = ["SUPER_ADMIN", "PROJECT_ADMIN", "FINANCE_MANAGER", "SUPPORT_AGENT", "VENDOR_USER", "CLIENT_VIEWER", "CONTENT_EDITOR"] as const;

export type UserRoleType = (typeof ALL_ROLES)[number];

function getJWTSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is required");
  return new TextEncoder().encode(secret);
}

async function getSessionFromCookie() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("chiti_session")?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, getJWTSecret());
    if (!payload.sub) return null;
    return payload as { sub: string; email?: string; role?: string };
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const session = await auth();
  let userId = session?.user?.id;
  let email = session?.user?.email;

  if (!userId) {
    const cookieSession = await getSessionFromCookie();
    if (cookieSession) {
      userId = cookieSession.sub;
      email = cookieSession.email;
    }
  }

  if (!userId && !email) return null;

  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true },
    });
    if (user) return user;
  }

  if (email) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, role: true },
    });
    if (user) return user;
  }

  return null;
}

export async function getCurrentUserRole(): Promise<UserRoleType | null> {
  const user = await getCurrentUser();
  return user?.role ?? null;
}

export function roleAtLeast(role: UserRoleType, minimum: UserRoleType): boolean {
  const hierarchy: UserRoleType[] = ["SUPER_ADMIN", "PROJECT_ADMIN", "FINANCE_MANAGER", "SUPPORT_AGENT", "VENDOR_USER", "CONTENT_EDITOR", "CLIENT_VIEWER"];
  return hierarchy.indexOf(role) <= hierarchy.indexOf(minimum);
}

export function requireRole(roles: UserRoleType[], currentRole: UserRoleType | null): boolean {
  if (!currentRole) return false;
  return roles.includes(currentRole);
}

export async function getProject() {
  const cookieStore = await cookies();
  const projectId = cookieStore.get("chiti_project")?.value;
  if (!projectId || projectId === "all") return null;
  const hasAccess = await verifyProjectAccess(projectId);
  if (!hasAccess) return null;
  return prisma.project.findUnique({ where: { id: projectId } });
}

export async function getProjectId() {
  const project = await getProject();
  return project?.id ?? null;
}

export function projectFilter(projectId: string | null) {
  return projectId ? { projectId } : {};
}

export async function verifyProjectAccess(projectId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  if (user.role === "SUPER_ADMIN") return true;

  const membership = await prisma.userProject.findUnique({
    where: { userId_projectId: { userId: user.id, projectId } },
  });
  return membership !== null;
}

export async function getAccessibleProjects() {
  const user = await getCurrentUser();
  if (!user) return [];
  if (user.role === "SUPER_ADMIN") {
    return prisma.project.findMany({ select: { id: true, name: true, slug: true, capabilities: true }, orderBy: { name: "asc" } });
  }

  const memberships = await prisma.userProject.findMany({
    where: { userId: user.id },
    select: { project: { select: { id: true, name: true, slug: true, capabilities: true } } },
    orderBy: { project: { name: "asc" } },
  });
  return memberships.map((m) => m.project);
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
