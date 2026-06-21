import { cookies } from "next/headers";
import { getCurrentUserRole, getAccessibleProjects } from "@/lib/db/queries";
import { getProjectCapabilities } from "@/engines/identity/lib/capabilities";
import AppShell from "@/components/layout/AppShell";
import ProjectSelector from "@/components/ui/ProjectSelector";
import { ToastProvider } from "@/components/ui/ChitiToast";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const currentId = cookieStore.get("chiti_project")?.value || null;
  const role = await getCurrentUserRole();
  const projectId = currentId && currentId !== "all" ? currentId : null;

  const allProjects = await getAccessibleProjects();
  const capabilities = await getProjectCapabilities(projectId);

  return (
    <ToastProvider>
      <AppShell
        projects={allProjects}
        currentProjectId={projectId}
        sidebarChildren={<ProjectSelector projects={allProjects} currentId={projectId} />}
        userRole={role}
        capabilities={capabilities}
      >
        {children}
      </AppShell>
    </ToastProvider>
  );
}
