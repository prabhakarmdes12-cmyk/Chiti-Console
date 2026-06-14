"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { getProjectId, verifyProjectAccess } from "@/lib/db/queries";

export async function createOrder(formData: FormData) {
  const projectId = await getProjectId();
  if (!projectId) throw new Error("Project not found");

  const customerId = formData.get("customerId") as string;
  const source = formData.get("source") as string;
  const totalAmount = parseFloat(formData.get("totalAmount") as string);

  if (isNaN(totalAmount)) throw new Error("Invalid amount");

  try {
    await prisma.order.create({
      data: {
        orderNumber: `BB-${String(Date.now()).slice(-4)}`,
        projectId,
        customerId: customerId || undefined,
        source: (source || "MANUAL") as "API" | "MANUAL" | "WHATSAPP" | "WEB_CHECKOUT",
        status: "PENDING",
        paymentStatus: "UNPAID",
        totalAmount,
        timeline: { create: { status: "PENDING", note: "Order created via Console" } },
      },
    });
  } catch (e) {
    console.error("createOrder failed:", e);
    throw new Error("Failed to create order");
  }

  revalidatePath("/orders");
}

async function verifyOrderAccess(orderId: string): Promise<boolean> {
  const order = await prisma.order.findUnique({ where: { id: orderId }, select: { projectId: true } });
  if (!order) return false;
  return verifyProjectAccess(order.projectId);
}

export async function updateOrderStatus(orderId: string, status: string) {
  if (!await verifyOrderAccess(orderId)) throw new Error("Access denied");

  try {
    await prisma.order.update({
    where: { id: orderId },
    data: {
      status: status as "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED",
      timeline: { create: { status: status as "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" } },
    },
  });

  } catch (e) {
    console.error("updateOrderStatus failed:", e);
    throw new Error("Failed to update order status");
  }

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
}

export async function markOrderPaid(
  orderId: string,
  paymentMethod: string,
  paymentProvider: string,
  paymentProviderId: string
) {
  if (!await verifyOrderAccess(orderId)) throw new Error("Access denied");

  try {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "PAID",
        paymentMethod: paymentMethod as any,
        paymentProvider,
        paymentProviderId,
        timeline: { create: { status: "CONFIRMED", note: `Payment received via ${paymentProvider} (${paymentProviderId})` } },
      },
    });
  } catch (e) {
    console.error("markOrderPaid failed:", e);
    throw new Error("Failed to update payment status");
  }

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
}

export async function deleteOrder(orderId: string) {
  if (!await verifyOrderAccess(orderId)) throw new Error("Access denied");

  try {
    await prisma.order.delete({ where: { id: orderId } });
  } catch (e) {
    console.error("deleteOrder failed:", e);
    throw new Error("Failed to delete order");
  }
  revalidatePath("/orders");
}
