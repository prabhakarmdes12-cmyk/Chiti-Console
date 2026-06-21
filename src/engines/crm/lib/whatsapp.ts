import { prisma } from "@/lib/db/prisma";

export async function getWhatsAppMetrics(projectId: string | null) {
  const where = projectId ? { projectId } : {};
  const [active, unread] = await Promise.all([
    prisma.whatsAppConversation.count({ where: { ...where, status: "ACTIVE" } }),
    prisma.whatsAppConversation.count({ where: { ...where, status: "ACTIVE", unreadCount: { gt: 0 } } }),
  ]);
  return { activeConversations: active, unread: unread };
}
