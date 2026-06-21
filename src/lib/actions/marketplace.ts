"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { verifyProjectAccess } from "@/lib/db/queries";

function toNumber(value: FormDataEntryValue | null) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export async function convertEnquiryToBooking(enquiryId: string, formData: FormData) {
  const enquiry = await prisma.enquiry.findUnique({
    where: { id: enquiryId },
    include: { vendor: true, project: { select: { id: true, slug: true } } },
  });
  if (!enquiry || !(await verifyProjectAccess(enquiry.projectId))) throw new Error("Access denied");

  const existingOrder = await prisma.order.findFirst({
    where: { projectId: enquiry.projectId, notes: { contains: `enquiry:${enquiry.id}` } },
    select: { id: true },
  });
  if (existingOrder) {
    revalidatePath("/enquiries");
    revalidatePath("/orders");
    return;
  }

  const amount = toNumber(formData.get("amount"));
  if (amount <= 0) throw new Error("Booking amount is required");
  const isPaid = formData.get("isPaid") === "on";
  const details = (enquiry.details || {}) as Record<string, unknown>;

  const commission = enquiry.vendor
    ? await prisma.commission.findFirst({ where: { projectId: enquiry.projectId, isActive: true, OR: [{ vendorId: enquiry.vendor.id }, { category: enquiry.vendor.category }] }, orderBy: [{ vendorId: "desc" }, { effectiveFrom: "desc" }] })
    : null;
  const rate = Number(commission?.rate || 12);
  const commissionAmount = Math.round(amount * rate) / 100;
  const gstAmount = Math.round(commissionAmount * 18) / 100;
  const vendorAmount = amount - commissionAmount;

  const customer = await prisma.customer.upsert({
    where: { projectId_phone: { projectId: enquiry.projectId, phone: enquiry.customerPhone } },
    create: {
      projectId: enquiry.projectId,
      name: enquiry.customerName,
      phone: enquiry.customerPhone,
      email: enquiry.customerEmail || undefined,
      tags: [enquiry.type.toLowerCase()],
      totalOrders: 1,
      totalSpent: isPaid ? amount : 0,
      lastOrderAt: new Date(),
    },
    update: {
      name: enquiry.customerName,
      email: enquiry.customerEmail || undefined,
      totalOrders: { increment: 1 },
      totalSpent: isPaid ? { increment: amount } : undefined,
      lastOrderAt: new Date(),
    },
  });

  const order = await prisma.order.create({
    data: {
      orderNumber: `BJ-${String(Date.now()).slice(-6)}`,
      projectId: enquiry.projectId,
      vendorId: enquiry.vendorId || undefined,
      customerId: customer.id,
      source: "MANUAL",
      status: "CONFIRMED",
      paymentStatus: isPaid ? "PAID" : "UNPAID",
      paymentMethod: isPaid ? "UPI" : undefined,
      totalAmount: amount,
      commissionAmount,
      platformFee: commissionAmount,
      gstAmount,
      checkIn: typeof details.checkIn === "string" ? new Date(details.checkIn) : undefined,
      checkOut: typeof details.checkOut === "string" ? new Date(details.checkOut) : undefined,
      guests: Number(details.guests || details.passengers || details.adults) || undefined,
      roomType: typeof details.roomType === "string" ? details.roomType : undefined,
      pickupLocation: typeof details.pickup === "string" ? details.pickup : undefined,
      dropoffLocation: typeof details.dropoff === "string" ? details.dropoff : undefined,
      notes: `Converted from enquiry:${enquiry.id}`,
      items: { create: [{ productName: enquiry.listingName || `${enquiry.type} booking`, quantity: 1, unitPrice: amount, lineTotal: amount }] },
      timeline: { create: { status: "CONFIRMED", note: "Converted from enquiry" } },
    },
  });

  await prisma.enquiry.update({ where: { id: enquiry.id }, data: { status: "CONFIRMED", notes: [...((enquiry.notes as any[]) || []), { text: `Converted to booking ${order.orderNumber}`, time: new Date().toISOString() }] as any } });

  if (isPaid && enquiry.vendorId) {
    await prisma.escrow.create({
      data: {
        projectId: enquiry.projectId,
        orderId: order.id,
        grossAmount: amount,
        commissionAmount,
        vendorAmount,
        gstAmount,
        status: "HELD",
        releaseDueAt: addDays(order.checkOut || new Date(), 1),
        notes: "Held after enquiry conversion",
      },
    });

    const wallet = await prisma.vendorWallet.upsert({
      where: { vendorId: enquiry.vendorId },
      create: { projectId: enquiry.projectId, vendorId: enquiry.vendorId, pendingBalance: vendorAmount, totalEarned: vendorAmount },
      update: { pendingBalance: { increment: vendorAmount }, totalEarned: { increment: vendorAmount } },
    });

    await prisma.walletTransaction.create({
      data: { projectId: enquiry.projectId, walletId: wallet.id, vendorId: enquiry.vendorId, type: "HOLD", amount: vendorAmount, referenceId: order.id, description: `Escrow held for ${order.orderNumber}` },
    });

    await prisma.payout.create({
      data: { projectId: enquiry.projectId, vendorId: enquiry.vendorId, amount: vendorAmount, status: "PENDING", scheduledFor: addDays(order.checkOut || new Date(), 1), notes: `Auto-scheduled from ${order.orderNumber}` },
    });
  }

  revalidatePath("/enquiries");
  revalidatePath("/orders");
  revalidatePath("/finance");
}
