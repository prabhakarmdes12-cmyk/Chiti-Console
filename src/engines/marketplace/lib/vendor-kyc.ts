/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/db/prisma";

export async function updateVendorStatus(vendorId: string, status: string) {
  return prisma.vendor.update({
    where: { id: vendorId },
    data: { status: status as any },
  });
}

export async function upsertVendorBankAccount(
  vendorId: string,
  projectId: string,
  data: { accountHolder: string; bankName?: string; accountNumber?: string; ifscCode?: string; upiId?: string }
) {
  return prisma.vendorBankAccount.upsert({
    where: { vendorId },
    create: { ...data, projectId, vendorId },
    update: data,
  });
}

export async function updateVendorDocumentStatus(vendorId: string, documentIndex: number, status: string) {
  const vendor = await prisma.vendor.findUnique({ where: { id: vendorId }, select: { documents: true } });
  if (!vendor) throw new Error("Vendor not found");
  const docs = (vendor.documents as any[]) || [];
  if (documentIndex >= docs.length) throw new Error("Document not found");
  docs[documentIndex] = { ...docs[documentIndex], status };
  return prisma.vendor.update({
    where: { id: vendorId },
    data: { documents: docs },
  });
}
