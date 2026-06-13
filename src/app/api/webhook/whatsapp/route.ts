import { prisma } from "@/lib/db/prisma";
import { verifyWebhook, extractIncomingMessage } from "@/lib/integrations/whatsapp";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const result = verifyWebhook(mode, token, challenge);
  if (!result.verified) {
    return new Response("Verification failed", { status: 403 });
  }
  return new Response(String(result.challenge), { status: 200 });
}

export async function POST(request: Request) {
  const payload = await request.json();
  const msg = extractIncomingMessage(payload);

  if (!msg) {
    return new Response("OK", { status: 200 });
  }

  const projectId = msg.phoneNumberId
    ? await findProjectByPhoneNumberId(msg.phoneNumberId)
    : null;

  let conversation = await prisma.whatsAppConversation.findFirst({
    where: { waContactId: msg.from, ...(projectId ? { projectId } : {}) },
  });

  if (!conversation) {
    const existingCustomer = projectId
      ? await prisma.customer.findFirst({ where: { projectId, phone: { contains: msg.from.slice(-10) } } })
      : null;

    const targetProjectId = projectId || existingCustomer?.projectId || null;

    conversation = await prisma.whatsAppConversation.create({
      data: {
        projectId: targetProjectId || "unknown",
        waContactId: msg.from,
        customerId: existingCustomer?.id || null,
        status: "ACTIVE",
        lastMessageAt: new Date(Number(msg.timestamp) * 1000),
      },
    });
  } else {
    conversation = await prisma.whatsAppConversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: new Date(Number(msg.timestamp) * 1000),
        unreadCount: { increment: 1 },
        status: "ACTIVE" as const,
      },
    });
  }

  await prisma.whatsAppMessage.create({
    data: {
      conversationId: conversation.id,
      direction: "INBOUND",
      content: msg.content,
      messageType: msg.type,
      waMessageId: msg.waMessageId,
    },
  });

  return new Response("OK", { status: 200 });
}

async function findProjectByPhoneNumberId(phoneNumberId: string): Promise<string | null> {
  const projects = await prisma.project.findMany({
    where: { isActive: true },
    select: { id: true, config: true },
  });

  for (const project of projects) {
    const config = project.config as Record<string, unknown> | null;
    if (config?.whatsappPhoneNumberId === phoneNumberId) {
      return project.id;
    }
  }
  return null;
}
