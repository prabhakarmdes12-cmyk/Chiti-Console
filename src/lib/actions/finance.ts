"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { getProjectId, verifyProjectAccess } from "@/lib/db/queries";

export async function createInvoice(orderId: string) {
  const projectId = await getProjectId();
  if (!projectId) throw new Error("Project not found");

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) throw new Error("Order not found");

    const invoiceNumber = `INV-${String(Date.now()).slice(-6)}`;
    const amount = Number(order.totalAmount);
    const taxAmount = 0;
    const totalAmount = amount + taxAmount;

    await prisma.invoice.create({
      data: {
        orderId: order.id,
        projectId,
        invoiceNumber,
        amount,
        taxAmount,
        totalAmount,
        status: "DRAFT",
        items: {
          create: order.items.map((item) => ({
            description: item.productName,
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice),
            total: Number(item.lineTotal),
          })),
        },
      },
    });
  } catch (e) {
    console.error("createInvoice failed:", e);
    throw new Error("Failed to create invoice");
  }

  revalidatePath("/finance");
  revalidatePath(`/orders/${orderId}`);
}

export async function createExpense(formData: FormData) {
  const projectId = await getProjectId();
  if (!projectId) throw new Error("Project not found");

  const description = formData.get("description") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const category = formData.get("category") as string;
  const dateStr = formData.get("date") as string;

  if (!description || isNaN(amount) || !category || !dateStr) {
    throw new Error("Missing required fields");
  }

  try {
    await prisma.expense.create({
      data: {
        projectId,
        description,
        amount,
        category,
        date: new Date(dateStr),
      },
    });
  } catch (e) {
    console.error("createExpense failed:", e);
    throw new Error("Failed to create expense");
  }

  revalidatePath("/finance");
}

export async function deleteExpense(expenseId: string) {
  const expense = await prisma.expense.findUnique({ where: { id: expenseId }, select: { projectId: true } });
  if (!expense || !await verifyProjectAccess(expense.projectId)) throw new Error("Access denied");

  try {
    await prisma.expense.delete({ where: { id: expenseId } });
  } catch (e) {
    console.error("deleteExpense failed:", e);
    throw new Error("Failed to delete expense");
  }

  revalidatePath("/finance");
}

export async function updateInvoiceStatus(invoiceId: string, status: string) {
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId }, select: { projectId: true } });
  if (!invoice || !await verifyProjectAccess(invoice.projectId)) throw new Error("Access denied");

  try {
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status,
        ...(status === "PAID" ? { paidAt: new Date() } : {}),
      },
    });
  } catch (e) {
    console.error("updateInvoiceStatus failed:", e);
    throw new Error("Failed to update invoice status");
  }

  revalidatePath("/finance");
}
