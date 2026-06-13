import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";
import { getProjectId } from "@/lib/db/queries";
import { sendTextMessage } from "@/lib/integrations/whatsapp";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projectId = await getProjectId();
  if (!projectId) {
    return NextResponse.json({ error: "No project found" }, { status: 500 });
  }

  const body = await request.json();
  const { content } = body;
  if (!content || typeof content !== "string") {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }

  const conversation = await prisma.whatsAppConversation.findFirst({
    where: { id, projectId },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  try {
    await sendTextMessage(conversation.waContactId, content);
  } catch (e) {
    console.warn("WhatsApp API unavailable, saving locally:", e instanceof Error ? e.message : e);
  }

  const message = await prisma.whatsAppMessage.create({
    data: {
      conversationId: id,
      direction: "OUTBOUND",
      content,
      messageType: "text",
    },
  });

  await prisma.whatsAppConversation.update({
    where: { id },
    data: { lastMessageAt: new Date() },
  });

  return NextResponse.json(message, { status: 201 });
}
