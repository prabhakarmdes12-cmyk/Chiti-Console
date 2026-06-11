import { cookies } from "next/headers";
import { prisma } from "./prisma";

export async function getProject() {
  const cookieStore = await cookies();
  const projectId = cookieStore.get("chiti_project")?.value;

  if (!projectId || projectId === "all") return null;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  return project;
}

export async function getProjectId() {
  const project = await getProject();
  return project?.id ?? null;
}

export function projectFilter(projectId: string | null) {
  return projectId ? { projectId } : {};
}
