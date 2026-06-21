import { prisma } from "@/lib/db/prisma";

export async function getLeadPipeline(projectId: string | null) {
  const where = projectId ? { projectId } : {};
  const leads = await prisma.lead.groupBy({ by: ["status"], where, _count: true });
  const stages: Record<string, number> = {};
  for (const l of leads) stages[l.status.toLowerCase()] = l._count;
  return { stages, total: leads.reduce((s, l) => s + l._count, 0) };
}
