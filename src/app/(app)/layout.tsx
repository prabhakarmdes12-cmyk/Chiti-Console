import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUserRole, getAccessibleProjects } from "@/lib/db/queries";
import AppShell from "@/components/layout/AppShell";
import ProjectSelector from "@/components/ui/ProjectSelector";
import { ToastProvider } from "@/components/ui/ChitiToast";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const currentId = cookieStore.get("chiti_project")?.value || null;
  const role = await getCurrentUserRole();

  const allProjects = await getAccessibleProjects();

  return (
    <ToastProvider>
      <AppShell
        projects={allProjects}
        currentProjectId={currentId && currentId !== "all" ? currentId : null}
        sidebarChildren={<ProjectSelector projects={allProjects} currentId={currentId && currentId !== "all" ? currentId : null} />}
        userRole={role}
      >
        {children}
      </AppShell>
    </ToastProvider>
  );
}
