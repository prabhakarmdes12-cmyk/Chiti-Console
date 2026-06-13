"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { getProjectId } from "@/lib/db/queries";
import { redirect } from "next/navigation";

export async function createOrderFromConversation(conversationId: string) {
  const projectId = await getProjectId();
  if (!projectId) throw new Error("Project not found");

  const conversation = await prisma.whatsAppConversation.findFirst({
    where: { id: conversationId, projectId },
    include: { customer: true },
  });

  if (!conversation) throw new Error("Conversation not found");

  const order = await prisma.order.create({
    data: {
      orderNumber: `WA-${String(Date.now()).slice(-4)}`,
      projectId,
      customerId: conversation.customer?.id || null,
      source: "WHATSAPP",
      status: "PENDING",
      paymentStatus: "UNPAID",
      totalAmount: 0,
      timeline: { create: { status: "PENDING", note: "Order created from WhatsApp conversation" } },
    },
  });

  await prisma.whatsAppConversation.update({
    where: { id: conversationId },
    data: { unreadCount: 0 },
  });

  revalidatePath("/whatsapp");
  redirect(`/orders/${order.id}`);
}

export async function markConversationRead(conversationId: string) {
  const projectId = await getProjectId();
  if (!projectId) return;

  await prisma.whatsAppConversation.update({
    where: { id: conversationId, projectId },
    data: { unreadCount: 0 },
  });

  revalidatePath("/whatsapp");
}
