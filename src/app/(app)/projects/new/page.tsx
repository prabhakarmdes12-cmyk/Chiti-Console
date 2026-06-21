"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Info } from "lucide-react";
import Link from "next/link";
import ChitiPageHeader from "@/components/ui/ChitiPageHeader";

interface CapDef { id: string; label: string; description: string; dependsOn?: string[] }
const ALL_CAPABILITIES: CapDef[] = [
  { id: "COMMERCE", label: "Commerce", description: "Orders, products, inventory" },
  { id: "MARKETPLACE", label: "Marketplace", description: "Vendors, listings, bookings", dependsOn: ["COMMERCE"] },
  { id: "CRM", label: "CRM", description: "Customers, leads, WhatsApp" },
  { id: "FINANCE", label: "Finance", description: "Escrow, payouts, refunds", dependsOn: ["MARKETPLACE"] },
  { id: "CONTENT", label: "Content", description: "CMS, blog, pages" },
  { id: "ANALYTICS", label: "Analytics", description: "Reports, dashboards" },
  { id: "AI", label: "AI", description: "Business assistant, automation" },
];

const PRESETS = [
  { label: "Marketplace", caps: ["COMMERCE", "MARKETPLACE", "CRM", "FINANCE", "ANALYTICS", "AI"] },
  { label: "E-Commerce", caps: ["COMMERCE", "CRM", "ANALYTICS", "AI"] },
  { label: "B2B Catalog", caps: ["COMMERCE", "CRM", "ANALYTICS"] },
  { label: "SaaS / Education", caps: ["CRM", "ANALYTICS"] },
  { label: "Content", caps: ["CONTENT", "ANALYTICS"] },
  { label: "Custom", caps: ["COMMERCE", "CRM", "ANALYTICS"] },
];

export default function NewProjectPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set(["COMMERCE", "CRM", "ANALYTICS"]));
  const [error, setError] = useState<string | null>(null);

  function toggleCap(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        const dependent = ALL_CAPABILITIES.filter((c) => c.dependsOn?.includes(id));
        for (const d of dependent) next.delete(d.id);
      } else {
        const def = ALL_CAPABILITIES.find((c) => c.id === id);
        if (def?.dependsOn) for (const dep of def.dependsOn) next.add(dep);
        next.add(id);
      }
      return next;
    });
    setError(null);
  }

  function applyPreset(caps: string[]) {
    setSelected(new Set(caps));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (selected.size === 0) { setError("Select at least one capability"); return; }

    const formData = new FormData(e.currentTarget);
    for (const cap of selected) formData.append("capabilities", cap);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          domain: formData.get("domain"),
          integrationType: formData.get("integrationType"),
          logoUrl: formData.get("logoUrl"),
          capabilities: [...selected],
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Failed to create project");
        return;
      }
      const project = await res.json();
      router.push(`/projects/${project.id}`);
    } catch {
      setError("Failed to create project");
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <ChitiPageHeader
        title="New Project"
        description="Configure capabilities for your project."
        actions={
          <Link
            href="/projects"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-2 hover:bg-surface-3 border border-white/10 text-text-main text-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        }
      />

      <form onSubmit={handleSubmit} className="bg-surface-1 border border-white/10 rounded-xl p-6 space-y-5 overflow-hidden">
        <div>
          <label htmlFor="name" className="block text-sm text-text-muted mb-1">Project Name *</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
            placeholder="My Project"
          />
        </div>

        <div>
          <label className="block text-sm text-text-muted mb-3">Capabilities</label>
          <div className="flex flex-wrap gap-2 mb-4">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset.caps)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selected.size === preset.caps.length && [...selected].every((c) => preset.caps.includes(c))
                    ? "bg-brand-primary/20 text-brand-primary border border-brand-primary/30"
                    : "bg-surface-2 text-text-muted border border-white/10 hover:border-white/20"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 min-w-0">
            {ALL_CAPABILITIES.map((cap) => {
              const enabled = selected.has(cap.id);
              const blocked = cap.dependsOn && !cap.dependsOn.every((d) => selected.has(d));
              return (
                <button
                  key={cap.id}
                  type="button"
                  onClick={() => !blocked && toggleCap(cap.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all min-w-0 ${
                    enabled
                      ? "bg-brand-primary/10 border-brand-primary/30 text-text-main"
                      : blocked
                        ? "bg-surface-2/50 border-white/5 text-text-muted/40 cursor-not-allowed"
                        : "bg-surface-2 border-white/10 text-text-muted hover:border-white/20"
                  }`}
                >
                  <div className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                    enabled ? "bg-brand-primary border-brand-primary" : blocked ? "border-white/10" : "border-white/20"
                  }`}>
                    {enabled && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{cap.label}</p>
                    <p className="text-xs text-text-muted truncate">{cap.description}</p>
                    {blocked && <p className="text-[10px] text-text-muted/60 mt-0.5 truncate">Requires {cap.dependsOn?.join(" + ")}</p>}
                  </div>
                </button>
              );
            })}
          </div>
          {error && <p className="text-xs text-error mt-2 flex items-center gap-1"><Info className="w-3 h-3" />{error}</p>}
        </div>

        <input name="type" type="hidden" value="CUSTOM" />

        <div>
          <label htmlFor="domain" className="block text-sm text-text-muted mb-1">Domain</label>
          <input
            id="domain"
            name="domain"
            type="text"
            className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
            placeholder="example.com"
          />
        </div>

        <div>
          <label htmlFor="integrationType" className="block text-sm text-text-muted mb-1">Integration Type</label>
          <select
            id="integrationType"
            name="integrationType"
            className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
          >
            <option value="MANUAL">Manual</option>
            <option value="API">API</option>
            <option value="WEBHOOK">Webhook</option>
            <option value="CMS">CMS</option>
          </select>
        </div>

        <div>
          <label htmlFor="logoUrl" className="block text-sm text-text-muted mb-1">Logo URL</label>
          <input
            id="logoUrl"
            name="logoUrl"
            type="url"
            className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
            placeholder="https://example.com/logo.png"
          />
        </div>

        <button
          type="submit"
          className="w-full px-4 py-3 rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-medium transition-all duration-150"
        >
          Create Project
        </button>
      </form>
    </div>
  );
}
