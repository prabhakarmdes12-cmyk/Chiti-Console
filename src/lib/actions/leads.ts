"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { getProjectId } from "@/lib/db/queries";

export async function createLead(formData: FormData) {
  const projectId = await getProjectId();
  if (!projectId) throw new Error("Project not found");

  await prisma.lead.create({
    data: {
      projectId,
      name: formData.get("name") as string,
      email: formData.get("email") as string || undefined,
      phone: formData.get("phone") as string || undefined,
      company: formData.get("company") as string || undefined,
      source: (formData.get("source") as string || "MANUAL") as any,
      message: formData.get("message") as string || undefined,
    },
  });

  revalidatePath("/leads");
}

export async function updateLeadStatus(leadId: string, status: string) {
  await prisma.lead.update({ where: { id: leadId }, data: { status: status as any } });

  revalidatePath("/leads");
  revalidatePath(`/leads/${leadId}`);
}

export async function deleteLead(leadId: string) {
  await prisma.lead.delete({ where: { id: leadId } });
  revalidatePath("/leads");
}
