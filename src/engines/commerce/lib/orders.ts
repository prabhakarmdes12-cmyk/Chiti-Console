/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/db/prisma";

export async function createOrder(data: {
  projectId: string; customerId?: string; vendorId?: string;
  totalAmount: number; discount?: number; items: { productName: string; quantity: number; unitPrice: number }[];
  checkIn?: Date; checkOut?: Date; guests?: number; roomType?: string;
  pickupLocation?: string; dropoffLocation?: string; notes?: string;
}) {
  return prisma.order.create({
    data: {
      projectId: data.projectId,
      customerId: data.customerId,
      vendorId: data.vendorId,
      orderNumber: await generateOrderNumber(data.projectId),
      source: "MANUAL",
      status: "PENDING",
      totalAmount: data.totalAmount,
      discount: data.discount || 0,
      checkIn: data.checkIn, checkOut: data.checkOut,
      guests: data.guests, roomType: data.roomType,
      pickupLocation: data.pickupLocation, dropoffLocation: data.dropoffLocation,
      notes: data.notes,
      items: { create: data.items.map((i) => ({ productName: i.productName, quantity: i.quantity, unitPrice: i.unitPrice, lineTotal: i.quantity * i.unitPrice })) },
    },
    include: { items: true, customer: true },
  });
}

export async function updateOrderStatus(orderId: string, status: string, userId?: string) {
  const order = await prisma.order.update({ where: { id: orderId }, data: { status: status as any } });
  await prisma.orderTimeline.create({
    data: { orderId, status: status as any, userId, note: `Status changed to ${status}` },
  });
  return order;
}

async function generateOrderNumber(projectId: string): Promise<string> {
  const count = await prisma.order.count({ where: { projectId } });
  const project = await prisma.project.findUnique({ where: { id: projectId }, select: { slug: true } });
  const prefix = (project?.slug || "PRJ").split("-").map((s) => s[0]).join("").toUpperCase().slice(0, 3);
  return `${prefix}-${String(count + 1).padStart(4, "0")}`;
}
