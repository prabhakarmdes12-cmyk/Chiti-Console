import { prisma } from "@/lib/db/prisma";
import { getProjectId } from "@/lib/db/queries";
import { notFound } from "next/navigation";
import ConversationThread from "./ConversationThread";

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projectId = await getProjectId();
  if (!projectId) notFound();

  const conversation = await prisma.whatsAppConversation.findFirst({
    where: { id, projectId },
    include: { customer: true, messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!conversation) notFound();

  const name = conversation.customer?.name || conversation.waContactId;
  const phone = conversation.customer?.phone || conversation.waContactId;

  return <ConversationThread conversation={conversation} name={name} phone={phone} />;
}
