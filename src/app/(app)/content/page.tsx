import { prisma } from "@/lib/db/prisma";
import { getProjectId } from "@/lib/db/queries";
import ChitiPageHeader from "@/components/ui/ChitiPageHeader";
import ChitiButton from "@/components/ui/ChitiButton";
import ChitiBadge from "@/components/ui/ChitiBadge";
import { createContent, updateContentStatus, deleteContent } from "@/lib/actions/content";
import { Plus, Trash2 } from "lucide-react";

export default async function ContentPage() {
  const projectId = await getProjectId();
  const entries = await prisma.contentEntry.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <ChitiPageHeader
        title="Content"
        description="Manage content across your project."
        actions={
          <details className="relative">
            <summary className="list-none">
              <ChitiButton size="sm" icon={<Plus className="w-4 h-4" />}>New Entry</ChitiButton>
            </summary>
            <div className="absolute right-0 top-10 w-72 bg-surface-1 border border-white/10 rounded-xl p-4 shadow-2xl z-10">
              <form action={createContent} className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs text-text-muted">Title</label>
                  <input name="title" required className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-xs text-text-muted">Type</label>
                    <select name="type" className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm">
                      <option value="Page">Page</option>
                      <option value="Collection">Collection</option>
                      <option value="Banner">Banner</option>
                      <option value="Blog">Blog</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs text-text-muted">Status</label>
                    <select name="status" className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm">
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>
                </div>
                <ChitiButton type="submit" className="w-full">Create Entry</ChitiButton>
              </form>
            </div>
          </details>
        }
      />

      <div className="bg-surface-1 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-text-muted">
              <th className="text-left p-4 font-medium">Title</th>
              <th className="text-left p-4 font-medium">Type</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-left p-4 font-medium">Created</th>
              <th className="text-right p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-text-muted text-sm">No content entries</td></tr>
            )}
            {entries.map((entry) => (
              <tr key={entry.id} className="border-b border-white/5 last:border-0 hover:bg-surface-2 transition-colors">
                <td className="p-4">
                  <form action={updateContentStatus.bind(null, entry.id, entry.status === "Published" ? "Archived" : "Published")}>
                    <button type="submit" className="font-medium text-text-main hover:text-brand-primary transition-colors text-left">{entry.title}</button>
                  </form>
                </td>
                <td className="p-4">
                  <span className="text-xs text-text-muted bg-surface-2 px-2 py-0.5 rounded-full">{entry.type}</span>
                </td>
                <td className="p-4">
                  <form action={updateContentStatus.bind(null, entry.id, entry.status === "Published" ? "Draft" : entry.status === "Draft" ? "Published" : "Draft")}>
                    <button type="submit">
                      <ChitiBadge variant={entry.status === "Published" ? "success" : entry.status === "Draft" ? "warning" : "info"}>
                        {entry.status}
                      </ChitiBadge>
                    </button>
                  </form>
                </td>
                <td className="p-4 text-text-muted">{entry.createdAt.toLocaleDateString("en-IN")}</td>
                <td className="p-4 text-right">
                  <form action={deleteContent.bind(null, entry.id)}>
                    <button type="submit" className="text-text-muted hover:text-error transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
