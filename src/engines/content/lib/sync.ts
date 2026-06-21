import { prisma } from "@/lib/db/prisma";

export async function syncContent(projectId: string, source?: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId }, select: { integrationType: true, config: true } });
  if (!project) throw new Error("Project not found");
  return { synced: true, source };
}
