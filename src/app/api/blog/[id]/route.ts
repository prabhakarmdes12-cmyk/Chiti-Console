import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authenticate } from "@/lib/api/auth";

export async function GET(request: Request, { params }: any) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  const entry = await prisma.contentEntry.findFirst({
    where: { id: params.id, projectId: auth.project!.id },
  });
  if (!entry) {
    return NextResponse.json({ error: "Blog entry not found" }, { status: 404 });
  }

  return NextResponse.json({ data: entry });
}

export async function PUT(request: Request, { params }: any) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  const existing = await prisma.contentEntry.findFirst({
    where: { id: params.id, projectId: auth.project!.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Blog entry not found" }, { status: 404 });
  }

  const body = await request.json();
  const data: Record<string, unknown> = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.slug !== undefined) data.slug = body.slug;
  if (body.body !== undefined) data.body = body.body;
  if (body.type !== undefined) data.type = body.type;
  if (body.status !== undefined) data.status = body.status;

  const entry = await prisma.contentEntry.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json({ data: entry });
}

export async function DELETE(request: Request, { params }: any) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  const existing = await prisma.contentEntry.findFirst({
    where: { id: params.id, projectId: auth.project!.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Blog entry not found" }, { status: 404 });
  }

  await prisma.contentEntry.delete({ where: { id: params.id } });

  return NextResponse.json({ data: { id: params.id, deleted: true } });
}
