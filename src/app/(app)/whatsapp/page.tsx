import { prisma } from "@/lib/db/prisma";
import { getProjectId } from "@/lib/db/queries";
import Link from "next/link";
import ChitiPageHeader from "@/components/ui/ChitiPageHeader";

export default async function WhatsappPage() {
  const projectId = await getProjectId();
  const conversations = await prisma.whatsAppConversation.findMany({
    where: { projectId },
    orderBy: { lastMessageAt: "desc" },
    include: { customer: true, messages: { take: 1, orderBy: { createdAt: "desc" } } },
  });

  return (
    <div className="space-y-6">
      <ChitiPageHeader title="WhatsApp" description="Customer conversations." />

      <div className="bg-surface-1 border border-white/10 rounded-xl overflow-hidden">
        {conversations.length === 0 && (
          <div className="p-12 text-center text-text-muted text-sm">No conversations yet</div>
        )}
        <div className="divide-y divide-white/5">
          {conversations.map((conv) => {
            const name = conv.customer?.name || conv.waContactId;
            const lastMsg = conv.messages[0]?.content || "No messages";
            const initials = (conv.customer?.name || conv.waContactId).split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
            return (
              <Link key={conv.id} href={`/whatsapp/${conv.id}`} className="flex items-center gap-4 p-4 hover:bg-surface-2 transition-colors">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-brand-primary/20 flex items-center justify-center">
                    <span className="text-sm text-brand-primary font-bold">{initials}</span>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-error text-white text-[10px] flex items-center justify-center font-bold">
                      {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-text-main font-medium">{name}</p>
                    <span className="text-xs text-text-muted">
                      {conv.lastMessageAt ? conv.lastMessageAt.toLocaleDateString("en-IN") : ""}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted truncate mt-0.5">{lastMsg}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
