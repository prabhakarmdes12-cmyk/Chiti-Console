"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";

interface Project {
  id: string;
  name: string;
  slug: string;
  capabilities?: string[];
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
    document.cookie = `chiti_project=${id || "all"}; path=/; max-age=86400; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
    setOpen(false);
    router.refresh();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-surface-2 border border-white/10 text-sm text-text-main hover:bg-surface-3 transition-colors"
      >
        <div className="text-left min-w-0">
          <span className="block truncate max-w-36">{selected?.name || "All Projects"}</span>
          {selected && <span className="block text-[10px] text-text-muted truncate max-w-36">{selected.slug}</span>}
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-text-muted shrink-0" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 w-72 bg-surface-1 border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden">
            <button
              onClick={() => select(null)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-surface-2 transition-colors border-b border-white/5 ${
                !currentId ? "text-brand-primary" : "text-text-main"
              }`}
            >
              {!currentId && <Check className="w-3.5 h-3.5 shrink-0" />}
              <span className={!currentId ? "" : "ml-5"}>All Projects</span>
            </button>
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => select(p.id)}
                className={`w-full flex items-start gap-2 px-3 py-2.5 text-sm text-left hover:bg-surface-2 transition-colors ${
                  currentId === p.id ? "text-brand-primary" : "text-text-main"
                }`}
              >
                <div className="flex items-start gap-2 min-w-0 flex-1">
                  {currentId === p.id && <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
                  <div className={currentId === p.id ? "" : "ml-5 min-w-0"}>
                    <span className="block truncate">{p.name}</span>
                    <span className="block text-[10px] text-text-muted truncate">{p.slug}</span>
                    {(p.capabilities?.length ?? 0) > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {p.capabilities!.slice(0, 4).map((cap) => (
                          <span key={cap} className="text-[9px] px-1.5 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary font-medium uppercase tracking-wider">{cap.slice(0, 4)}</span>
                        ))}
                        {(p.capabilities!.length) > 4 && (
                          <span className="text-[9px] text-text-muted">+{p.capabilities!.length - 4}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
