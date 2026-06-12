import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import ProjectTabs from "@/components/ui/ProjectTabs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) notFound();

  return (
    <div>
      <Link href="/projects" className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-main mb-3 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> All Projects
      </Link>
      <div className="mb-1">
        <h1 className="text-2xl font-display font-bold text-text-main">{project.name}</h1>
        <p className="text-text-muted text-sm">{project.domain || project.type}</p>
      </div>
      <ProjectTabs projectId={id} />
      {children}
    </div>
  );
}
