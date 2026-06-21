"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/ui/Sidebar";
import TopNav from "@/components/ui/TopNav";

interface AppShellProps {
  children: React.ReactNode;
  projects: { id: string; name: string; slug: string; capabilities?: string[] }[];
  currentProjectId: string | null;
  sidebarChildren?: React.ReactNode;
  userRole?: string | null;
  capabilities?: string[];
}

export default function AppShell({ children, projects, currentProjectId, sidebarChildren, userRole, capabilities }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentProject = projects.find((p) => p.id === currentProjectId);
  const projectCaps = currentProject?.capabilities || capabilities || ["COMMERCE", "CRM", "ANALYTICS"];
  const isSuperAdmin = userRole === "SUPER_ADMIN" || userRole === "PROJECT_ADMIN";

  useEffect(() => {
    const closeOnResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    window.addEventListener("resize", closeOnResize);
    return () => window.removeEventListener("resize", closeOnResize);
  }, []);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  return (
    <div className="flex min-h-screen aurora-bg">
      <div className="hidden lg:block">
        <Sidebar projects={projects} userRole={userRole} capabilities={projectCaps} showNewProject={isSuperAdmin} />
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-60 transform transition-transform duration-300 ease-in-out lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar projects={projects} onClose={() => setSidebarOpen(false)} userRole={userRole} capabilities={projectCaps} showNewProject={isSuperAdmin} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <TopNav onMenuToggle={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarChildren}
        </TopNav>
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
