import { prisma } from "@/lib/db/prisma";
import { lookupCommissionRate } from "./commission";

interface EnquiryDetails {
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  roomType?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
}

export async function convertEnquiryToBooking(enquiryId: string, projectId: string) {
  const enquiry = await prisma.enquiry.findUnique({
    where: { id: enquiryId },
    include: { vendor: true },
  });
  if (!enquiry) throw new Error("Enquiry not found");
  if (enquiry.status === "CONFIRMED") throw new Error("Enquiry already converted");

  const customer = await findOrCreateCustomer(projectId, enquiry);
  const vendorId = enquiry.vendorId;
  let commissionRate = 12;
  if (vendorId) {
    commissionRate = await lookupCommissionRate(projectId, vendorId);
  }

  const details = (enquiry.details || {}) as EnquiryDetails;
  const listPrice = enquiry.listingName ? 1000 : 0;
  const commissionAmount = Math.round((listPrice * commissionRate) / 100);
  const gstAmount = Math.round(commissionAmount * 0.18);
  const platformFee = 50;

  const order = await prisma.order.create({
    data: {
      projectId,
      vendorId,
      customerId: customer.id,
      orderNumber: await generateOrderNumber(projectId),
      source: "MANUAL",
      status: "CONFIRMED",
      paymentStatus: "UNPAID",
      totalAmount: listPrice,
      discount: 0,
      commissionAmount,
      platformFee,
      gstAmount,
      checkIn: details.checkIn ? new Date(details.checkIn) : null,
      checkOut: details.checkOut ? new Date(details.checkOut) : null,
      guests: details.guests || null,
      roomType: details.roomType || null,
      pickupLocation: details.pickupLocation || null,
      dropoffLocation: details.dropoffLocation || null,
      notes: `enquiry:${enquiryId}`,
    },
  });

  await prisma.enquiry.update({
    where: { id: enquiryId },
    data: { status: "CONFIRMED" },
  });

  if (vendorId) {
    const netToVendor = listPrice - commissionAmount - platformFee - gstAmount;
    await prisma.escrow.create({
      data: {
        projectId,
        orderId: order.id,
        grossAmount: listPrice,
        commissionAmount,
        vendorAmount: netToVendor,
        gstAmount,
        status: "HELD",
        releaseDueAt: details.checkOut ? new Date(new Date(details.checkOut).getTime() + 2 * 24 * 60 * 60 * 1000) : null,
      },
    });

    const wallet = await prisma.vendorWallet.upsert({
      where: { vendorId },
      create: { projectId, vendorId, pendingBalance: netToVendor },
      update: { pendingBalance: { increment: netToVendor } },
    });

    await prisma.walletTransaction.create({
      data: {
        projectId,
        walletId: wallet.id,
        vendorId,
        type: "CREDIT",
        amount: netToVendor,
        description: `Booking ${order.orderNumber}`,
        referenceId: order.id,
      },
    });

    await prisma.payout.create({
      data: {
        projectId,
        vendorId,
        amount: netToVendor,
        notes: `Booking ${order.orderNumber}`,
        status: "PENDING",
      },
    });
  }

  return order;
}

async function findOrCreateCustomer(projectId: string, enquiry: { customerName: string; customerPhone: string; customerEmail?: string | null }) {
  let customer = null;
  if (enquiry.customerPhone) {
    customer = await prisma.customer.findFirst({
      where: { projectId, phone: enquiry.customerPhone },
    });
  }
  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        projectId,
        name: enquiry.customerName,
        phone: enquiry.customerPhone,
        email: enquiry.customerEmail || null,
      },
    });
  }
  return customer;
}

async function generateOrderNumber(projectId: string): Promise<string> {
  const count = await prisma.order.count({ where: { projectId } });
  const project = await prisma.project.findUnique({ where: { id: projectId }, select: { slug: true } });
  const prefix = (project?.slug || "PRJ").split("-").map((s) => s[0]).join("").toUpperCase().slice(0, 3);
  return `${prefix}-${String(count + 1).padStart(4, "0")}`;
}
