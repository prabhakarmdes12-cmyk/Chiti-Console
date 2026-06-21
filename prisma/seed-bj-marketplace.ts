import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const raw = process.env.DIRECT_URL || process.env.DATABASE_URL || "";
const connectionString = raw.startsWith("postgres") ? raw : "postgres://postgres:postgres@localhost:51214/postgres";
const adapter = new PrismaPg(connectionString);
const prisma = new PrismaClient({ adapter });

async function ensureOrder(orderNumber: string, data: Parameters<typeof prisma.order.create>[0]["data"]) {
  const existing = await prisma.order.findFirst({ where: { orderNumber } });
  if (existing) return existing;
  return prisma.order.create({ data });
}

async function main() {
  const project = await prisma.project.findUnique({ where: { slug: "booking-jharkhand" } });
  if (!project) throw new Error("Booking Jharkhand project not found");

  const vendors = await prisma.vendor.findMany({ where: { projectId: project.id } });
  const byId = Object.fromEntries(vendors.map((vendor) => [vendor.id, vendor]));
  const v1 = byId["bj-v001"];
  const v2 = byId["bj-v002"];
  const v5 = byId["bj-v005"];
  if (!v1 || !v2 || !v5) throw new Error("Expected BJ seed vendors bj-v001, bj-v002, bj-v005");

  if ((await prisma.commission.count({ where: { projectId: project.id } })) === 0) {
    await prisma.commission.createMany({
      data: [
        { projectId: project.id, category: "HOTEL", rate: 14 },
        { projectId: project.id, category: "CAB", rate: 12 },
        { projectId: project.id, category: "RESTAURANT", rate: 10 },
        { projectId: project.id, category: "TOUR_GUIDE", rate: 15 },
        { projectId: project.id, category: "EXPERIENCE", rate: 15 },
      ],
    });
  }

  for (const account of [
    { vendorId: v1.id, accountHolder: "Anjali Mahato", bankName: "State Bank of India", accountNumber: "XXXX1023", ifscCode: "SBIN0000123", upiId: "anjali@upi" },
    { vendorId: v2.id, accountHolder: "Rajesh Kumar", bankName: "HDFC Bank", accountNumber: "XXXX8821", ifscCode: "HDFC0000342", upiId: "rajcabs@upi" },
    { vendorId: v5.id, accountHolder: "Suman Tigga", bankName: "Axis Bank", accountNumber: "XXXX4410", ifscCode: "UTIB0000981", upiId: "betlalodge@upi" },
  ]) {
    await prisma.vendorBankAccount.upsert({
      where: { vendorId: account.vendorId },
      create: { projectId: project.id, isVerified: true, ...account },
      update: { isVerified: true, ...account },
    });
  }

  const rahul = await prisma.customer.upsert({
    where: { projectId_email: { projectId: project.id, email: "rahul@email.com" } },
    create: { projectId: project.id, name: "Rahul Sharma", phone: "+91-9876543210", email: "rahul@email.com", tags: ["family", "hotel"], totalOrders: 1, totalSpent: 8500, lastOrderAt: new Date() },
    update: { totalOrders: 1, totalSpent: 8500, lastOrderAt: new Date() },
  });
  const priya = await prisma.customer.upsert({
    where: { projectId_email: { projectId: project.id, email: "priya@email.com" } },
    create: { projectId: project.id, name: "Priya Mukherjee", phone: "+91-8765432109", email: "priya@email.com", tags: ["cab"], totalOrders: 1, totalSpent: 3500, lastOrderAt: new Date() },
    update: { totalOrders: 1, totalSpent: 3500, lastOrderAt: new Date() },
  });
  const neha = await prisma.customer.upsert({
    where: { projectId_email: { projectId: project.id, email: "neha@email.com" } },
    create: { projectId: project.id, name: "Neha Gupta", phone: "+91-5432109876", email: "neha@email.com", tags: ["wildlife", "hotel"], totalOrders: 1, totalSpent: 4400, lastOrderAt: new Date() },
    update: { totalOrders: 1, totalSpent: 4400, lastOrderAt: new Date() },
  });

  const order1 = await ensureOrder("BJ-MKT-0001", {
    orderNumber: "BJ-MKT-0001", projectId: project.id, vendorId: v1.id, customerId: rahul.id, source: "MANUAL", status: "DELIVERED", paymentStatus: "PAID", paymentMethod: "UPI", totalAmount: 8500, commissionAmount: 1190, platformFee: 1190, gstAmount: 214.2, checkIn: new Date("2026-06-25"), checkOut: new Date("2026-06-27"), guests: 3, roomType: "Deluxe Room",
    items: { create: [{ productName: "Netarhat Forest Retreat - Deluxe Room (2 nights)", quantity: 1, unitPrice: 8500, lineTotal: 8500 }] },
    timeline: { create: { status: "DELIVERED", note: "Stay completed and payment released to wallet" } },
  });
  const order2 = await ensureOrder("BJ-MKT-0002", {
    orderNumber: "BJ-MKT-0002", projectId: project.id, vendorId: v2.id, customerId: priya.id, source: "WEB_CHECKOUT", status: "CONFIRMED", paymentStatus: "PAID", paymentMethod: "RAZORPAY", totalAmount: 3500, commissionAmount: 420, platformFee: 420, gstAmount: 75.6, pickupLocation: "Ranchi Airport", dropoffLocation: "Deoghar", guests: 2,
    items: { create: [{ productName: "Ranchi Airport to Deoghar - Sedan", quantity: 1, unitPrice: 3500, lineTotal: 3500 }] },
    timeline: { create: { status: "CONFIRMED", note: "Cab booking confirmed; escrow held" } },
  });
  const order3 = await ensureOrder("BJ-MKT-0003", {
    orderNumber: "BJ-MKT-0003", projectId: project.id, vendorId: v5.id, customerId: neha.id, source: "WHATSAPP", status: "PROCESSING", paymentStatus: "PAID", paymentMethod: "UPI", totalAmount: 4400, commissionAmount: 616, platformFee: 616, gstAmount: 110.88, checkIn: new Date("2026-07-05"), checkOut: new Date("2026-07-07"), guests: 2, roomType: "Standard Room",
    items: { create: [{ productName: "Betla Jungle Lodge - Standard Room (2 nights)", quantity: 1, unitPrice: 4400, lineTotal: 4400 }] },
    timeline: { create: { status: "PROCESSING", note: "Awaiting check-in" } },
  });

  for (const escrow of [
    { orderId: order1.id, grossAmount: 8500, commissionAmount: 1190, vendorAmount: 7310, gstAmount: 214.2, status: "RELEASED" as const, releasedAt: new Date(), notes: "Released after completed stay" },
    { orderId: order2.id, grossAmount: 3500, commissionAmount: 420, vendorAmount: 3080, gstAmount: 75.6, status: "HELD" as const, releaseDueAt: new Date("2026-06-29"), notes: "Release after ride completion" },
    { orderId: order3.id, grossAmount: 4400, commissionAmount: 616, vendorAmount: 3784, gstAmount: 110.88, status: "HELD" as const, releaseDueAt: new Date("2026-07-08"), notes: "Release after checkout" },
  ]) {
    await prisma.escrow.upsert({
      where: { orderId: escrow.orderId },
      create: { projectId: project.id, ...escrow },
      update: escrow,
    });
  }

  const wallet1 = await prisma.vendorWallet.upsert({ where: { vendorId: v1.id }, create: { projectId: project.id, vendorId: v1.id, balance: 7310, totalEarned: 7310 }, update: { balance: 7310, totalEarned: 7310 } });
  await prisma.vendorWallet.upsert({ where: { vendorId: v2.id }, create: { projectId: project.id, vendorId: v2.id, pendingBalance: 3080, totalEarned: 3080 }, update: { pendingBalance: 3080, totalEarned: 3080 } });
  await prisma.vendorWallet.upsert({ where: { vendorId: v5.id }, create: { projectId: project.id, vendorId: v5.id, pendingBalance: 3784, totalEarned: 3784 }, update: { pendingBalance: 3784, totalEarned: 3784 } });

  if ((await prisma.walletTransaction.count({ where: { walletId: wallet1.id } })) === 0) {
    await prisma.walletTransaction.create({ data: { projectId: project.id, walletId: wallet1.id, vendorId: v1.id, type: "CREDIT", amount: 7310, referenceId: order1.id, description: "Released escrow for BJ-MKT-0001" } });
  }

  for (const payout of [
    { vendorId: v1.id, amount: 7310, status: "PENDING" as const, scheduledFor: new Date(), notes: "Today's hotel payout" },
    { vendorId: v2.id, amount: 3080, status: "PENDING" as const, scheduledFor: new Date("2026-06-29"), notes: "Cab payout after ride completion" },
  ]) {
    const existing = await prisma.payout.findFirst({ where: { projectId: project.id, vendorId: payout.vendorId, amount: payout.amount } });
    if (!existing) await prisma.payout.create({ data: { projectId: project.id, ...payout } });
  }

  console.log("Booking Jharkhand marketplace finance seed complete");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
