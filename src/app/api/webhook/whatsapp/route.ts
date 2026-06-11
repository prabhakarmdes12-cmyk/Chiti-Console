import { prisma } from "@/lib/db/prisma";
import { verifyWebhook, extractIncomingMessage, sendTextMessage } from "@/lib/integrations/whatsapp";
import { getProjectId } from "@/lib/db/queries";

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

  const projectId = await getProjectId();
  if (!projectId) {
    return new Response("No project found", { status: 500 });
  }

  let conversation = await prisma.whatsAppConversation.findFirst({
    where: { projectId, waContactId: msg.from },
  });

  if (!conversation) {
    const existingCustomer = await prisma.customer.findFirst({
      where: { projectId, phone: msg.from },
    });

    conversation = await prisma.whatsAppConversation.create({
      data: {
        projectId,
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
        status: "ACTIVE",
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
