import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authenticate } from "@/lib/api/auth";

export async function GET(request: Request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const status = searchParams.get("status");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
  const offset = parseInt(searchParams.get("offset") || "0");

  const where: Record<string, unknown> = { projectId: auth.project!.id };
  if (type) where.type = type;
  if (status) where.status = status;

  const [entries, total] = await Promise.all([
    prisma.contentEntry.findMany({ where, orderBy: { createdAt: "desc" }, take: limit, skip: offset }),
    prisma.contentEntry.count({ where }),
  ]);

  return NextResponse.json({ data: entries, total, limit, offset });
}

export async function POST(request: Request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  const body = await request.json();
  const { title, slug, body: content, type, status } = body;

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const entry = await prisma.contentEntry.create({
    data: {
      projectId: auth.project!.id,
      title,
      slug: slug || title.toLowerCase().replace(/\s+/g, "-"),
      body: content || null,
      type: type || "blog",
      status: status || "published",
    },
  });

  return NextResponse.json({ data: entry }, { status: 201 });
}
