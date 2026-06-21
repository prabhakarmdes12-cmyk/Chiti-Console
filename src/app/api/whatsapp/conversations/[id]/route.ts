import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";
import { authenticate } from "@/lib/api/auth";
import { auth as authSession } from "@/lib/auth/auth";
import { getProjectId } from "@/lib/db/queries";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const apiAuth = request.headers.get("Authorization") || request.headers.get("x-api-key");
  let projectId: string | null = null;
  if (apiAuth) {
    const auth = await authenticate(request);
    if (auth.error) return auth.error;
    projectId = auth.project!.id;
  } else {
    const session = await authSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    projectId = await getProjectId();
    if (!projectId) return NextResponse.json({ error: "No project selected" }, { status: 400 });
  }

  const { id } = await params;

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
