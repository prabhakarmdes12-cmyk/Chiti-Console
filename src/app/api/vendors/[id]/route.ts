import { NextResponse } from "next/server";
import type { VendorStatus } from "@/generated/prisma/client";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { authenticate } from "@/lib/api/auth";
import { vendorUpdateSchema, validate } from "@/lib/api/validation";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const request = new Request(_request);
  const { error, project } = await authenticate(request);
  if (error) return error;

  const { id } = await params;
  const vendor = await prisma.vendor.findFirst({
    where: { id, projectId: project!.id },
  });

  if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
  return NextResponse.json({ data: vendor });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, project } = await authenticate(request);
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const validated = validate(vendorUpdateSchema, body);
  if (validated.error) return validated.error;

  const existing = await prisma.vendor.findFirst({ where: { id, projectId: project!.id } });
  if (!existing) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

  const data: Record<string, unknown> = {};
  const fields = ["businessName", "ownerName", "category", "phone", "email", "gst", "district", "address", "status", "rejectionReason", "suspensionReason", "documents"];
  for (const key of fields) {
    if (validated.data[key as keyof typeof validated.data] !== undefined) {
      data[key] = validated.data[key as keyof typeof validated.data];
    }
  }
  if (data.status === ("ACTIVE" as string)) {
    data.rejectionReason = null;
    data.suspensionReason = null;
  }

  const vendor = await prisma.vendor.update({ where: { id }, data: data as never });

  return NextResponse.json({ data: vendor });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, project } = await authenticate(request);
  if (error) return error;

  const { id } = await params;
  const existing = await prisma.vendor.findFirst({ where: { id, projectId: project!.id } });
  if (!existing) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

  await prisma.vendor.delete({ where: { id } });
  return NextResponse.json({ data: { message: "Vendor deleted" } });
}
