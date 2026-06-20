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
  if (!body.text) {
    return NextResponse.json({ error: "Validation failed", details: { text: ["text is required"] } }, { status: 400 });
  }

  const newNote = {
    text: body.text,
    createdBy: body.createdBy || "admin",
    time: new Date().toISOString(),
  };

  const notes = [...(Array.isArray(existing.notes) ? existing.notes : []), newNote];
  await prisma.enquiry.update({ where: { id }, data: { notes: JSON.parse(JSON.stringify(notes)) as Prisma.InputJsonValue } });

  return NextResponse.json({ data: newNote }, { status: 201 });
}
