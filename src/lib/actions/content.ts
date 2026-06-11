"use server";

import { prisma } from "@/lib/db/prisma";
import { getProjectId } from "@/lib/db/queries";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1),
  type: z.string().optional(),
  status: z.string().optional(),
});

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  type: z.string().optional(),
  status: z.string().optional(),
});

export async function createContent(formData: FormData) {
  const projectId = await getProjectId();
  if (!projectId) throw new Error("No project found");

  const parsed = createSchema.parse(Object.fromEntries(formData));
  await prisma.contentEntry.create({
    data: {
      projectId,
      title: parsed.title,
      type: parsed.type || "page",
      status: parsed.status || "draft",
    },
  });
  revalidatePath("/content");
}

export async function updateContent(id: string, formData: FormData) {
  const projectId = await getProjectId();
  if (!projectId) throw new Error("No project found");

  const parsed = updateSchema.parse(Object.fromEntries(formData));
  await prisma.contentEntry.updateMany({
    where: { id, projectId },
    data: parsed,
  });
  revalidatePath("/content");
}

export async function updateContentStatus(id: string, status: string) {
  const projectId = await getProjectId();
  if (!projectId) throw new Error("No project found");

  await prisma.contentEntry.updateMany({
    where: { id, projectId },
    data: { status },
  });
  revalidatePath("/content");
}

export async function deleteContent(id: string) {
  const projectId = await getProjectId();
  if (!projectId) throw new Error("No project found");

  await prisma.contentEntry.deleteMany({ where: { id, projectId } });
  revalidatePath("/content");
}
