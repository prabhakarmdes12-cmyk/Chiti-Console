"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";

interface Project {
  id: string;
  name: string;
  slug: string;
}

interface ProjectSelectorProps {
  projects: Project[];
  currentId: string | null;
}

export default function ProjectSelector({ projects, currentId }: ProjectSelectorProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const selected = currentId ? projects.find((p) => p.id === currentId) : null;

  const select = (id: string | null) => {
    document.cookie = `chiti_project=${id || "all"}; path=/; max-age=86400`;
    setOpen(false);
    router.refresh();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-2 border border-white/10 text-sm text-text-main hover:bg-surface-3 transition-colors"
      >
        <span>{selected?.name || "All Projects"}</span>
        <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 w-48 bg-surface-1 border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden">
            <button
              onClick={() => select(null)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-surface-2 transition-colors ${
                !currentId ? "text-brand-primary" : "text-text-main"
              }`}
            >
              {!currentId && <Check className="w-3.5 h-3.5" />}
              <span className={!currentId ? "" : "ml-5"}>All Projects</span>
            </button>
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => select(p.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-surface-2 transition-colors ${
                  currentId === p.id ? "text-brand-primary" : "text-text-main"
                }`}
              >
                {currentId === p.id && <Check className="w-3.5 h-3.5" />}
                <span className={currentId === p.id ? "" : "ml-5"}>{p.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
