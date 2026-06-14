"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { getProjectId } from "@/lib/db/queries";

export async function createCustomer(formData: FormData) {
  const projectId = await getProjectId();
  if (!projectId) throw new Error("Project not found");

  try {
    await prisma.customer.create({
      data: {
        projectId,
        name: formData.get("name") as string,
        phone: (formData.get("phone") as string) || undefined,
        email: (formData.get("email") as string) || undefined,
      },
    });
  } catch (e) {
    console.error("createCustomer failed:", e);
    throw new Error("Failed to create customer");
  }

  revalidatePath("/customers");
}

export async function updateCustomer(customerId: string, formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;

  try {
    await prisma.customer.update({
      where: { id: customerId },
      data: { ...(name ? { name } : {}), ...(phone ? { phone } : {}), ...(email ? { email } : {}) },
    });
  } catch (e) {
    console.error("updateCustomer failed:", e);
    throw new Error("Failed to update customer");
  }

  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);
}

export async function deleteCustomer(customerId: string) {
  try {
    await prisma.customer.delete({ where: { id: customerId } });
  } catch (e) {
    console.error("deleteCustomer failed:", e);
    throw new Error("Failed to delete customer");
  }
  revalidatePath("/customers");
}
