"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";

export async function createProject(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Not authenticated");

  let user;
  try {
    user = await prisma.user.findUnique({ where: { email: session.user.email } });
  } catch (e) {
    console.error("createProject find user failed:", e);
    throw new Error("Failed to find user");
  }
  if (!user) throw new Error("User not found");

  const name = formData.get("name") as string;
  if (!name?.trim()) throw new Error("Project name is required");

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const type = formData.get("type") as string || "CUSTOM";
  const domain = formData.get("domain") as string || undefined;
  const integrationType = formData.get("integrationType") as string || "MANUAL";
  const logoUrl = formData.get("logoUrl") as string || undefined;

  let project;
  try {
    project = await prisma.project.create({
      data: { name, slug, type: type as any, domain, integrationType: integrationType as any, logoUrl },
    });
  } catch (e) {
    console.error("createProject create failed:", e);
    throw new Error("Failed to create project");
  }

  try {
    await prisma.userProject.create({
      data: { userId: user.id, projectId: project.id, role: "ADMIN" },
    });
  } catch (e) {
    console.error("createProject userProject failed:", e);
    throw new Error("Failed to assign user to project");
  }

  revalidatePath("/projects");
  redirect(`/projects/${project.id}`);
}
