"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { getProjectId, verifyProjectAccess } from "@/lib/db/queries";

export async function createCustomer(formData: FormData) {
  const requestedProjectId = (formData.get("projectId") as string) || null;
  const projectId = requestedProjectId || await getProjectId();
  if (!projectId) throw new Error("Project not found");
  if (!await verifyProjectAccess(projectId)) throw new Error("Access denied");

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
  revalidatePath(`/projects/${projectId}/customers`);
}

async function verifyCustomerAccess(customerId: string): Promise<boolean> {
  const customer = await prisma.customer.findUnique({ where: { id: customerId }, select: { projectId: true } });
  if (!customer) return false;
  return verifyProjectAccess(customer.projectId);
}

export async function updateCustomer(customerId: string, formData: FormData) {
  if (!await verifyCustomerAccess(customerId)) throw new Error("Access denied");

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
  if (!await verifyCustomerAccess(customerId)) throw new Error("Access denied");

  try {
    await prisma.customer.delete({ where: { id: customerId } });
  } catch (e) {
    console.error("deleteCustomer failed:", e);
    throw new Error("Failed to delete customer");
  }
  revalidatePath("/customers");
}
