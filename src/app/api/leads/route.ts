import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authenticateApiKey } from "@/lib/api/auth";

export async function GET(request: Request) {
  const { error, project } = await authenticateApiKey(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
  const offset = parseInt(searchParams.get("offset") || "0");

  const where: Record<string, unknown> = { projectId: project!.id };
  if (status) where.status = status;

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({ where, orderBy: { createdAt: "desc" }, take: limit, skip: offset }),
    prisma.lead.count({ where }),
  ]);

  return NextResponse.json({ data: leads, total, limit, offset });
}

export async function POST(request: Request) {
  const { error, project } = await authenticateApiKey(request);
  if (error) return error;

  const body = await request.json();

  const lead = await prisma.lead.create({
    data: {
      projectId: project!.id,
      name: body.name,
      email: body.email,
      phone: body.phone,
      company: body.company,
      source: body.source || "API",
      status: body.status || "NEW",
      message: body.message,
      products: body.products || [],
    },
  });

  return NextResponse.json({ data: lead }, { status: 201 });
}
