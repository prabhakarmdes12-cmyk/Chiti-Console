import { prisma } from "@/lib/db/prisma";
import { getProjectId } from "@/lib/db/queries";
import { notFound } from "next/navigation";
import ChitiPageHeader from "@/components/ui/ChitiPageHeader";
import ChitiButton from "@/components/ui/ChitiButton";
import { updateContent, updateContentStatus, deleteContent } from "@/lib/actions/content";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";

export default async function ContentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projectId = await getProjectId();
  const entry = await prisma.contentEntry.findFirst({ where: { id, projectId } });
  if (!entry) notFound();

  return (
    <div className="space-y-6 max-w-4xl">
      <ChitiPageHeader
        title={entry.title}
        description={`${entry.type} · ${entry.status}`}
        actions={
          <Link href="/content">
            <ChitiButton variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>Back</ChitiButton>
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <form action={updateContent.bind(null, entry.id)} className="bg-surface-1 border border-white/10 rounded-xl p-6 space-y-4">
            <div className="space-y-1">
              <label className="block text-xs text-text-muted">Title</label>
              <input name="title" defaultValue={entry.title} className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs text-text-muted">Type</label>
                <select name="type" defaultValue={entry.type} className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm">
                  <option value="Page">Page</option>
                  <option value="Collection">Collection</option>
                  <option value="Banner">Banner</option>
                  <option value="Blog">Blog</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-xs text-text-muted">Status</label>
                <select name="status" defaultValue={entry.status} className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm">
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-xs text-text-muted">Body / Content</label>
              <textarea name="body" defaultValue={entry.body || ""} rows={16} className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm font-mono resize-y" placeholder="Write your content here..." />
            </div>
            <div className="flex justify-end gap-2">
              <ChitiButton type="submit">Save Changes</ChitiButton>
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <div className="bg-surface-1 border border-white/10 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-medium text-text-muted">Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Created</span>
                <span className="text-text-main">{entry.createdAt.toLocaleDateString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Slug</span>
                <span className="text-text-muted font-mono text-xs">{entry.slug || "—"}</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-1 border border-white/10 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-medium text-text-muted">Quick Actions</h3>
            <div className="space-y-2">
              <form action={updateContentStatus.bind(null, entry.id, entry.status === "Published" ? "Draft" : "Published")}>
                <ChitiButton type="submit" variant="secondary" size="sm" className="w-full">
                  {entry.status === "Published" ? "Unpublish" : "Publish"}
                </ChitiButton>
              </form>
              <form action={deleteContent.bind(null, entry.id)}>
                <ChitiButton type="submit" variant="ghost" size="sm" className="w-full text-error" icon={<Trash2 className="w-4 h-4" />}>Delete</ChitiButton>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
