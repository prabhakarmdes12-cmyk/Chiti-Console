import { prisma } from "@/lib/db/prisma";

export async function getContentMetrics(projectId: string | null) {
  const where = projectId ? { projectId } : {};
  const entries = await prisma.contentEntry.findMany({ where, select: { status: true } });
  return {
    total: entries.length,
    published: entries.filter((e) => e.status === "PUBLISHED").length,
    draft: entries.filter((e) => e.status === "draft" || e.status === "DRAFT").length,
  };
}
