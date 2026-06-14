"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { getProjectId } from "@/lib/db/queries";
import { redirect } from "next/navigation";
import { extractOrderFromMessages } from "@/lib/ai/extract-order";

export async function createOrderFromConversation(conversationId: string) {
  const projectId = await getProjectId();
  if (!projectId) throw new Error("Project not found");

  let conversation;
  try {
    conversation = await prisma.whatsAppConversation.findFirst({
      where: { id: conversationId, projectId },
      include: { customer: true },
    });
  } catch (e) {
    console.error("createOrderFromConversation find failed:", e);
    throw new Error("Failed to find conversation");
  }

  if (!conversation) throw new Error("Conversation not found");

  let order;
  try {
    order = await prisma.order.create({
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
  } catch (e) {
    console.error("createOrderFromConversation create failed:", e);
    throw new Error("Failed to create order");
  }

  try {
    await prisma.whatsAppConversation.update({
      where: { id: conversationId },
      data: { unreadCount: 0 },
    });
  } catch (e) {
    console.error("createOrderFromConversation update conversation failed:", e);
  }

  revalidatePath("/whatsapp");
  redirect(`/orders/${order.id}`);
}

export async function markConversationRead(conversationId: string) {
  const projectId = await getProjectId();
  if (!projectId) return;

  try {
    await prisma.whatsAppConversation.update({
      where: { id: conversationId, projectId },
      data: { unreadCount: 0 },
    });
  } catch (e) {
    console.error("markConversationRead failed:", e);
  }

  revalidatePath("/whatsapp");
}

export async function extractOrderFromConversation(conversationId: string) {
  const projectId = await getProjectId();
  if (!projectId) throw new Error("Project not found");

  let conversation;
  try {
    conversation = await prisma.whatsAppConversation.findFirst({
      where: { id: conversationId, projectId },
      include: { messages: { orderBy: { createdAt: "asc" } }, customer: true },
    });
  } catch (e) {
    console.error("extractOrder find conversation failed:", e);
    throw new Error("Failed to find conversation");
  }

  if (!conversation) throw new Error("Conversation not found");

  let result;
  try {
    result = await extractOrderFromMessages(
      conversation.messages.map((m) => ({
        content: m.content,
        isFromCustomer: m.direction === "INBOUND",
      }))
    );
  } catch (e) {
    console.error("extractOrder AI failed:", e);
    throw new Error("AI extraction failed. Try again or create order manually.");
  }

  return {
    items: result.items,
    totalAmount: result.totalAmount,
    confidence: result.confidence,
    missingInfo: result.missingInfo,
    customerName: result.customerName || conversation.customer?.name || null,
    phone: result.phone || conversation.customer?.phone || null,
  };
}

export async function createOrderFromExtraction(
  conversationId: string,
  data: {
    items: Array<{ productName: string; quantity: number; unitPrice?: number }>;
    totalAmount: number;
    customerId?: string | null;
  }
) {
  const projectId = await getProjectId();
  if (!projectId) throw new Error("Project not found");

  let order;
  try {
    order = await prisma.order.create({
      data: {
        orderNumber: `WA-${String(Date.now()).slice(-4)}`,
        projectId,
        customerId: data.customerId || null,
        source: "WHATSAPP",
        status: "PENDING",
        paymentStatus: "UNPAID",
        totalAmount: data.totalAmount,
        items: {
          create: data.items.map((item) => ({
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice || 0,
            lineTotal: (item.unitPrice || 0) * item.quantity,
          })),
        },
        timeline: { create: { status: "PENDING", note: "Order created via AI extraction from WhatsApp" } },
      },
    });
  } catch (e) {
    console.error("createOrderFromExtraction failed:", e);
    throw new Error("Failed to create order");
  }

  try {
    await prisma.whatsAppConversation.update({
      where: { id: conversationId },
      data: { unreadCount: 0 },
    });
  } catch (e) {
    console.error("createOrderFromExtraction update conversation failed:", e);
  }

  revalidatePath("/whatsapp");
  redirect(`/orders/${order.id}`);
}
