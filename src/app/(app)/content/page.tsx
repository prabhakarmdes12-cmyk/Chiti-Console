import { prisma } from "@/lib/db/prisma";
import { getProjectId } from "@/lib/db/queries";
import ChitiPageHeader from "@/components/ui/ChitiPageHeader";
import ChitiBadge from "@/components/ui/ChitiBadge";

export default async function ContentPage() {
  const projectId = await getProjectId();
  const entries = await prisma.contentEntry.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <ChitiPageHeader title="Content" description="Manage content across your project." />

      <div className="bg-surface-1 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-text-muted">
              <th className="text-left p-4 font-medium">Title</th>
              <th className="text-left p-4 font-medium">Type</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-left p-4 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-text-muted text-sm">No content entries</td></tr>
            )}
            {entries.map((entry) => (
              <tr key={entry.id} className="border-b border-white/5 last:border-0 hover:bg-surface-2 transition-colors">
                <td className="p-4 font-medium text-text-main">{entry.title}</td>
                <td className="p-4">
                  <span className="text-xs text-text-muted bg-surface-2 px-2 py-0.5 rounded-full">{entry.type}</span>
                </td>
                <td className="p-4">
                  <ChitiBadge variant={entry.status === "Published" ? "success" : entry.status === "Draft" ? "warning" : "info"}>
                    {entry.status}
                  </ChitiBadge>
                </td>
                <td className="p-4 text-text-muted">{entry.createdAt.toLocaleDateString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
