import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { createProject } from "@/lib/actions/projects";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ChitiPageHeader from "@/components/ui/ChitiPageHeader";

export default async function NewProjectPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="space-y-6 max-w-2xl">
      <ChitiPageHeader
        title="New Project"
        description="Add a new project to the console."
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

      <form action={createProject} className="bg-surface-1 border border-white/10 rounded-xl p-6 space-y-5">
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
          <label htmlFor="type" className="block text-sm text-text-muted mb-1">Type</label>
          <select
            id="type"
            name="type"
            className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
          >
            <option value="CUSTOM">Custom</option>
            <option value="ECOMMERCE">E-Commerce</option>
            <option value="B2B_CATALOG">B2B Catalog</option>
            <option value="MARKETPLACE">Marketplace</option>
            <option value="CONTENT">Content</option>
            <option value="SAAS">SaaS</option>
          </select>
        </div>

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
