import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import type { LeadSource, LeadStatus } from "@/generated/prisma/client";
import { authenticate } from "@/lib/api/auth";
import { leadCreateSchema, paginationSchema, validate } from "@/lib/api/validation";

export async function GET(request: Request) {
  const { error, project } = await authenticate(request);
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const pagination = validate(paginationSchema, Object.fromEntries(searchParams));
    const limit = pagination.data?.limit ?? 50;
    const offset = pagination.data?.offset ?? 0;

    const where: Record<string, unknown> = { projectId: project!.id };
    if (status) where.status = status;

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({ where, orderBy: { createdAt: "desc" }, take: limit, skip: offset }),
      prisma.lead.count({ where }),
    ]);

    return NextResponse.json({ data: leads, total, limit, offset });
  } catch (err) {
    console.error("leads GET error:", err);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { error, project } = await authenticate(request);
  if (error) return error;

  try {
    const body = await request.json();
    const validated = validate(leadCreateSchema, body);
    if (validated.error) return validated.error;

    const lead = await prisma.lead.create({
      data: {
        projectId: project!.id,
        name: validated.data.name,
        email: validated.data.email || undefined,
        phone: validated.data.phone,
        company: validated.data.company,
        source: (validated.data.source || "API") as LeadSource,
        status: (validated.data.status || "NEW") as LeadStatus,
        message: validated.data.message,
        products: validated.data.products || [],
      },
    });

    return NextResponse.json({ data: lead }, { status: 201 });
  } catch (err) {
    console.error("leads POST error:", err);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
