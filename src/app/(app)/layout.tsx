import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import Sidebar from "@/components/ui/Sidebar";
import TopNav from "@/components/ui/TopNav";
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
      <div className="flex min-h-screen">
        <Sidebar projects={projects} />
        <div className="flex-1 flex flex-col">
          <TopNav>
            <ProjectSelector projects={projects} currentId={currentId && currentId !== "all" ? currentId : null} />
          </TopNav>
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
