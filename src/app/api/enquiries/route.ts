import { NextResponse } from "next/server";
import type { EnquiryType } from "@/generated/prisma/client";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { authenticateApiKey } from "@/lib/api/auth";
import { enquiryCreateSchema, paginationSchema, validate } from "@/lib/api/validation";

export async function GET(request: Request) {
  const { error, project } = await authenticateApiKey(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const type = searchParams.get("type");
  const vendorId = searchParams.get("vendorId");
  const search = searchParams.get("search");
  const pagination = validate(paginationSchema, Object.fromEntries(searchParams));
  const limit = pagination.data?.limit ?? 50;
  const offset = pagination.data?.offset ?? 0;

  const where: Record<string, unknown> = { projectId: project!.id };
  if (status) where.status = status;
  if (type) where.type = type;
  if (vendorId) where.vendorId = vendorId;
  if (search) {
    where.OR = [
      { customerName: { contains: search, mode: "insensitive" } },
      { customerPhone: { contains: search } },
    ];
  }

  const [enquiries, total] = await Promise.all([
    prisma.enquiry.findMany({ where, orderBy: { updatedAt: "desc" }, take: limit, skip: offset }),
    prisma.enquiry.count({ where }),
  ]);

  return NextResponse.json({ data: enquiries, total, limit, offset });
}

export async function POST(request: Request) {
  const { error, project } = await authenticateApiKey(request);
  if (error) return error;

  const body = await request.json();
  const validated = validate(enquiryCreateSchema, body);
  if (validated.error) return validated.error;

  const enquiry = await prisma.enquiry.create({
    data: {
      projectId: project!.id,
      type: validated.data.type as EnquiryType,
      customerName: validated.data.customerName,
      customerPhone: validated.data.customerPhone,
      customerEmail: validated.data.customerEmail || undefined,
      customerCity: validated.data.customerCity,
      listingName: validated.data.listingName,
      vendorId: validated.data.vendorId,
      details: (validated.data.details ?? {}) as Prisma.InputJsonValue,
      priority: validated.data.priority || "medium",
      source: validated.data.source,
      language: validated.data.language,
      status: "NEW",
    },
  });

  return NextResponse.json({ data: enquiry }, { status: 201 });
}
