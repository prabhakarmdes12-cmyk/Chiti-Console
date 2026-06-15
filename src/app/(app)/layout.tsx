import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import AppShell from "@/components/layout/AppShell";
import ProjectSelector from "@/components/ui/ProjectSelector";
import { ToastProvider } from "@/components/ui/ChitiToast";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const currentId = cookieStore.get("chiti_project")?.value || null;

  const projects = await prisma.project.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });

  return (
    <ToastProvider>
      <AppShell
        projects={projects}
        currentProjectId={currentId && currentId !== "all" ? currentId : null}
        sidebarChildren={<ProjectSelector projects={projects} currentId={currentId && currentId !== "all" ? currentId : null} />}
      >
        {children}
      </AppShell>
    </ToastProvider>
  );
}
