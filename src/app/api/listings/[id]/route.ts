import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authenticate } from "@/lib/api/auth";
import { listingUpdateSchema, validate } from "@/lib/api/validation";

export async function GET(request: Request, { params }: any) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  const listing = await prisma.listing.findFirst({
    where: { id: params.id, projectId: auth.project!.id },
    include: { vendor: true },
  });
  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  return NextResponse.json({ data: listing });
}

export async function PUT(request: Request, { params }: any) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  const existing = await prisma.listing.findFirst({
    where: { id: params.id, projectId: auth.project!.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const body = await request.json();
  const validated = validate(listingUpdateSchema, body);
  if (validated.error) return validated.error;
  if (validated.data.vendorId) {
    const vendor = await prisma.vendor.findFirst({ where: { id: validated.data.vendorId, projectId: auth.project!.id }, select: { id: true } });
    if (!vendor) return NextResponse.json({ error: "Vendor not found in project" }, { status: 400 });
  }

  const listing = await prisma.listing.update({
    where: { id: params.id },
    data: {
      ...(validated.data.vendorId !== undefined && { vendorId: validated.data.vendorId || null }),
      ...(validated.data.type !== undefined && { type: validated.data.type as any }),
      ...(validated.data.name !== undefined && { name: validated.data.name }),
      ...(validated.data.description !== undefined && { description: validated.data.description }),
      ...(validated.data.images !== undefined && { images: validated.data.images as any }),
      ...(validated.data.pricing !== undefined && { pricing: validated.data.pricing as any }),
      ...(validated.data.location !== undefined && { location: validated.data.location as any }),
      ...(validated.data.amenities !== undefined && { amenities: validated.data.amenities }),
      ...(validated.data.tags !== undefined && { tags: validated.data.tags }),
      ...(validated.data.status !== undefined && { status: validated.data.status as any }),
    },
  });

  return NextResponse.json({ data: listing });
}

export async function DELETE(request: Request, { params }: any) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  const existing = await prisma.listing.findFirst({
    where: { id: params.id, projectId: auth.project!.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  await prisma.listing.delete({ where: { id: params.id } });

  return NextResponse.json({ data: { id: params.id, deleted: true } });
}
