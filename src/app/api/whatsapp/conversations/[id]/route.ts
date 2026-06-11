import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";
import { getProjectId } from "@/lib/db/queries";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projectId = await getProjectId();
  if (!projectId) {
    return NextResponse.json({ error: "No project found" }, { status: 500 });
  }

  const conversation = await prisma.whatsAppConversation.findFirst({
    where: { id, projectId },
    include: {
      customer: true,
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  return NextResponse.json(conversation);
}
