import { NextResponse } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { authenticate } from "@/lib/api/auth";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, project } = await authenticate(request);
  if (error) return error;

  const { id } = await params;
  const existing = await prisma.enquiry.findFirst({ where: { id, projectId: project!.id } });
  if (!existing) return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });

  const body = await request.json();
  if (!body.from || !body.text) {
    return NextResponse.json({ error: "Validation failed", details: { from: ["from is required"], text: ["text is required"] } }, { status: 400 });
  }

  const newMessage = {
    from: body.from,
    text: body.text,
    time: new Date().toISOString(),
  };

  const messages = [...(Array.isArray(existing.messages) ? existing.messages : []), newMessage];
  await prisma.enquiry.update({ where: { id }, data: { messages: JSON.parse(JSON.stringify(messages)) as Prisma.InputJsonValue } });

  return NextResponse.json({ data: newMessage }, { status: 201 });
}
