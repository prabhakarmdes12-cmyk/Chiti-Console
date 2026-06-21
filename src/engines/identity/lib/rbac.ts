import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

const ROLE_HIERARCHY: Record<string, number> = {
  CLIENT_VIEWER: 0,
  VENDOR_USER: 1,
  CONTENT_EDITOR: 2,
  SUPPORT_AGENT: 3,
  FINANCE_MANAGER: 4,
  PROJECT_ADMIN: 5,
  SUPER_ADMIN: 6,
};

export function roleAtLeast(userRole: string | undefined, minimum: string): boolean {
  if (!userRole) return false;
  return (ROLE_HIERARCHY[userRole] ?? -1) >= (ROLE_HIERARCHY[minimum] ?? -1);
}

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) throw new Error("User not found");
  return user;
}

export async function getCurrentUserRole(): Promise<string> {
  const user = await getCurrentUser();
  return user.role;
}

export async function getAccessibleProjects() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return [];

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!user) return [];
  if (user.role === "SUPER_ADMIN") {
    return prisma.project.findMany({ select: { id: true, name: true, slug: true, capabilities: true }, orderBy: { name: "asc" } });
  }

  const memberships = await prisma.userProject.findMany({
    where: { userId },
    select: { project: { select: { id: true, name: true, slug: true, capabilities: true } } },
  });
  return memberships.map((m) => m.project);
}
