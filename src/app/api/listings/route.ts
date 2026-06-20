import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authenticate } from "@/lib/api/auth";
import { paginationSchema, listingCreateSchema, validate } from "@/lib/api/validation";

export async function GET(request: Request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const status = searchParams.get("status");
  const vendorId = searchParams.get("vendorId");
  const pagination = validate(paginationSchema, Object.fromEntries(searchParams));
  const limit = pagination.data?.limit ?? 50;
  const offset = pagination.data?.offset ?? 0;

  const where: Record<string, unknown> = { projectId: auth.project!.id };
  if (type) where.type = type;
  if (status) where.status = status;
  if (vendorId) where.vendorId = vendorId;

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({ where, orderBy: { createdAt: "desc" }, take: limit, skip: offset }),
    prisma.listing.count({ where }),
  ]);

  return NextResponse.json({ data: listings, total, limit, offset });
}

export async function POST(request: Request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  const body = await request.json();
  const validated = validate(listingCreateSchema, body);
  if (validated.error) return validated.error;

  const listing = await prisma.listing.create({
    data: {
      projectId: auth.project!.id,
      vendorId: validated.data.vendorId || null,
      type: validated.data.type as any,
      name: validated.data.name,
      description: validated.data.description || null,
      images: (validated.data.images || []) as any,
      pricing: (validated.data.pricing || []) as any,
      location: (validated.data.location || {}) as any,
      amenities: validated.data.amenities || [],
      tags: validated.data.tags || [],
      status: (validated.data.status || "DRAFT") as any,
    },
  });

  return NextResponse.json({ data: listing }, { status: 201 });
}
