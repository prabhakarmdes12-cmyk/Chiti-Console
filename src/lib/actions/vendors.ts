"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { verifyProjectAccess } from "@/lib/db/queries";

async function getAccessibleVendor(vendorId: string) {
  const vendor = await prisma.vendor.findUnique({ where: { id: vendorId }, select: { id: true, projectId: true, documents: true } });
  if (!vendor || !(await verifyProjectAccess(vendor.projectId))) throw new Error("Access denied");
  return vendor;
}

export async function updateVendorStatus(vendorId: string, status: "ACTIVE" | "PENDING" | "SUSPENDED" | "REJECTED", formData?: FormData) {
  const vendor = await getAccessibleVendor(vendorId);
  const reason = (formData?.get("reason") as string) || undefined;
  await prisma.vendor.update({
    where: { id: vendor.id },
    data: {
      status,
      rejectionReason: status === "REJECTED" ? reason || "Rejected during review" : null,
      suspensionReason: status === "SUSPENDED" ? reason || "Suspended during review" : null,
    },
  });
  revalidatePath("/vendors");
  revalidatePath(`/vendors/${vendorId}`);
}

export async function upsertVendorBankAccount(vendorId: string, formData: FormData) {
  const vendor = await getAccessibleVendor(vendorId);
  const accountHolder = formData.get("accountHolder") as string;
  if (!accountHolder) throw new Error("Account holder is required");
  await prisma.vendorBankAccount.upsert({
    where: { vendorId: vendor.id },
    create: {
      projectId: vendor.projectId,
      vendorId: vendor.id,
      accountHolder,
      bankName: (formData.get("bankName") as string) || undefined,
      accountNumber: (formData.get("accountNumber") as string) || undefined,
      ifscCode: (formData.get("ifscCode") as string) || undefined,
      upiId: (formData.get("upiId") as string) || undefined,
      isVerified: formData.get("isVerified") === "on",
    },
    update: {
      accountHolder,
      bankName: (formData.get("bankName") as string) || null,
      accountNumber: (formData.get("accountNumber") as string) || null,
      ifscCode: (formData.get("ifscCode") as string) || null,
      upiId: (formData.get("upiId") as string) || null,
      isVerified: formData.get("isVerified") === "on",
    },
  });
  revalidatePath(`/vendors/${vendorId}`);
  revalidatePath("/finance/wallets");
}

export async function updateVendorDocumentStatus(vendorId: string, formData: FormData) {
  const vendor = await getAccessibleVendor(vendorId);
  const index = Number(formData.get("index"));
  const status = formData.get("status") as string;
  if (!Number.isInteger(index) || !["verified", "pending", "rejected", "not_uploaded"].includes(status)) throw new Error("Invalid document update");
  const docs = Array.isArray(vendor.documents) ? [...(vendor.documents as any[])] : [];
  if (!docs[index]) throw new Error("Document not found");
  docs[index] = { ...docs[index], status, reviewedAt: new Date().toISOString() };
  await prisma.vendor.update({ where: { id: vendor.id }, data: { documents: docs as any } });
  revalidatePath(`/vendors/${vendorId}`);
}
