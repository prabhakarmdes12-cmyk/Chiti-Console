"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { getProjectId } from "@/lib/db/queries";

export async function createOrder(formData: FormData) {
  const projectId = await getProjectId();
  if (!projectId) throw new Error("Project not found");

  const customerId = formData.get("customerId") as string;
  const source = formData.get("source") as string;
  const totalAmount = parseFloat(formData.get("totalAmount") as string);

  await prisma.order.create({
    data: {
      orderNumber: `BB-${String(Date.now()).slice(-4)}`,
      projectId,
      customerId: customerId || undefined,
      source: (source || "MANUAL") as any,
      status: "PENDING",
      paymentStatus: "UNPAID",
      totalAmount,
      timeline: { create: { status: "PENDING", note: "Order created via Console" } },
    },
  });

  revalidatePath("/orders");
}

export async function updateOrderStatus(orderId: string, status: string) {
  await prisma.order.update({
    where: { id: orderId },
    data: { status: status as any, timeline: { create: { status: status as any } } },
  });

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
}

export async function deleteOrder(orderId: string) {
  await prisma.order.delete({ where: { id: orderId } });
  revalidatePath("/orders");
}
