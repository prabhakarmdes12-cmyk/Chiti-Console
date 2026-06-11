import { prisma } from "./prisma";

export async function getProject() {
  const project = await prisma.project.findFirst({
    where: { slug: "bighi-brothers" },
  });
  return project;
}

export async function getProjectId() {
  const project = await getProject();
  return project?.id;
}
