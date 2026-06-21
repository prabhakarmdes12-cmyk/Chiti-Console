import { prisma } from "@/lib/db/prisma";
import { projectFilter } from "@/lib/db/queries";

export async function getBusinessInsights(projectId: string | null) {
  const where = projectFilter(projectId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [ordersToday, pendingOrders, lowStock, unreadWA] = await Promise.all([
    prisma.order.count({ where: { ...where, createdAt: { gte: today } } }),
    prisma.order.count({ where: { ...where, status: "PENDING" } }),
    prisma.product.count({ where: { ...(projectId ? { projectId } : {}), isActive: true, stock: { lte: 5 } } }),
    prisma.whatsAppConversation.count({ where: { ...(projectId ? { projectId } : {}), unreadCount: { gt: 0 } } }),
  ]);

  const insights: { type: string; message: string; severity: "info" | "warning" | "error" }[] = [];
  if (ordersToday === 0) insights.push({ type: "alert", message: "No orders yet today", severity: "warning" });
  if (pendingOrders > 5) insights.push({ type: "attention", message: `${pendingOrders} orders pending processing`, severity: "warning" });
  if (lowStock > 0) insights.push({ type: "inventory", message: `${lowStock} products low on stock`, severity: "info" });
  if (unreadWA > 0) insights.push({ type: "whatsapp", message: `${unreadWA} unread WhatsApp messages`, severity: "info" });

  return insights;
}
