"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/ui/Sidebar";
import TopNav from "@/components/ui/TopNav";

interface AppShellProps {
  children: React.ReactNode;
  projects: { id: string; name: string; slug: string }[];
  currentProjectId: string | null;
  sidebarChildren?: React.ReactNode;
  userRole?: string | null;
}

export default function AppShell({ children, projects, currentProjectId, sidebarChildren, userRole }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar projects={projects} userRole={userRole} />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-60 transform transition-transform duration-300 ease-in-out lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar projects={projects} onClose={() => setSidebarOpen(false)} userRole={userRole} />
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav onMenuToggle={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarChildren}
        </TopNav>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
