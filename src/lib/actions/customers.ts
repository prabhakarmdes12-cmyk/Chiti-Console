"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { getProjectId } from "@/lib/db/queries";

export async function createCustomer(formData: FormData) {
  const projectId = await getProjectId();
  if (!projectId) throw new Error("Project not found");

  await prisma.customer.create({
    data: {
      projectId,
      name: formData.get("name") as string,
      phone: formData.get("phone") as string || undefined,
      email: formData.get("email") as string || undefined,
    },
  });

  revalidatePath("/customers");
}

export async function updateCustomer(customerId: string, formData: FormData) {
  const data: any = {};
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;

  if (name) data.name = name;
  if (phone) data.phone = phone;
  if (email) data.email = email;

  await prisma.customer.update({ where: { id: customerId }, data });

  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);
}

export async function deleteCustomer(customerId: string) {
  await prisma.customer.delete({ where: { id: customerId } });
  revalidatePath("/customers");
}
