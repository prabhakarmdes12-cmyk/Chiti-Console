"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { getProjectId } from "@/lib/db/queries";
import { scoreLead } from "@/lib/ai/score-lead";

export async function createLead(formData: FormData) {
  const projectId = await getProjectId();
  if (!projectId) throw new Error("Project not found");

  let lead;
  try {
    lead = await prisma.lead.create({
      data: {
        projectId,
        name: formData.get("name") as string,
        email: (formData.get("email") as string) || undefined,
        phone: (formData.get("phone") as string) || undefined,
        company: (formData.get("company") as string) || undefined,
        source: (formData.get("source") as string || "MANUAL") as "MANUAL" | "WEBSITE_FORM" | "WHATSAPP" | "CALENDLY",
        message: (formData.get("message") as string) || undefined,
      },
    });
  } catch (e) {
    console.error("createLead failed:", e);
    throw new Error("Failed to create lead");
  }

  try {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    const result = await scoreLead({
      name: lead.name,
      source: lead.source,
      message: lead.message || undefined,
      company: lead.company || undefined,
      projectType: project?.type || "CUSTOM",
    });
    await prisma.lead.update({
      where: { id: lead.id },
      data: { score: result.score, scoreReason: result.reason },
    });
  } catch (e) {
    console.error("lead scoring failed (non-blocking):", e);
  }

  revalidatePath("/leads");
}

export async function updateLeadStatus(leadId: string, status: string) {
  try {
    await prisma.lead.update({
      where: { id: leadId },
      data: { status: status as "NEW" | "CONTACTED" | "QUALIFIED" | "PROPOSAL" | "WON" | "LOST" },
    });
  } catch (e) {
    console.error("updateLeadStatus failed:", e);
    throw new Error("Failed to update lead status");
  }

  revalidatePath("/leads");
  revalidatePath(`/leads/${leadId}`);
}

export async function generateFollowUp(leadId: string) {
  try {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new Error("Lead not found");

    const { draftFollowUp } = await import("@/lib/ai/draft-followup");
    return await draftFollowUp({
      name: lead.name,
      message: lead.message || undefined,
      status: lead.status,
      source: lead.source,
      company: lead.company || undefined,
    });
  } catch (e) {
    console.error("generateFollowUp failed:", e);
    throw new Error("Failed to generate follow-up");
  }
}

export async function deleteLead(leadId: string) {
  try {
    await prisma.lead.delete({ where: { id: leadId } });
  } catch (e) {
    console.error("deleteLead failed:", e);
    throw new Error("Failed to delete lead");
  }
  revalidatePath("/leads");
}
