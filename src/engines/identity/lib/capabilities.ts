import { prisma } from "@/lib/db/prisma";
import type { Capability } from "../../registry";
import { projectTypeToCapabilities } from "../../capabilities";

export async function getProjectCapabilities(projectId: string | null): Promise<Capability[]> {
  if (!projectId) return projectTypeToCapabilities("CUSTOM");
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { capabilities: true, type: true },
  });
  if (!project) return projectTypeToCapabilities("CUSTOM");
  if (project.capabilities && project.capabilities.length > 0) {
    return project.capabilities as Capability[];
  }
  return projectTypeToCapabilities(project.type);
}

export function checkCapability(enabled: Capability[], capability: Capability): boolean {
  return enabled.includes(capability);
}

export function getEnabledCapabilities(enabled: Capability[]): Capability[] {
  return enabled;
}
