import { NextResponse } from "next/server";
import type { VendorCategory } from "@/generated/prisma/client";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { authenticate } from "@/lib/api/auth";
import { vendorCreateSchema, validate } from "@/lib/api/validation";

export async function POST(request: Request) {
  const { error, project } = await authenticate(request);
  if (error) return error;

  const body = await request.json();
  const validated = validate(vendorCreateSchema, body);
  if (validated.error) return validated.error;

  const vendor = await prisma.vendor.create({
    data: {
      projectId: project!.id,
      businessName: validated.data.businessName,
      ownerName: validated.data.ownerName,
      category: validated.data.category as VendorCategory,
      phone: validated.data.phone,
      email: validated.data.email || undefined,
      gst: validated.data.gst,
      district: validated.data.district,
      address: validated.data.address,
      documents: (validated.data.documents || []) as Prisma.InputJsonValue,
      status: "PENDING",
    },
  });

  return NextResponse.json({ data: vendor }, { status: 201 });
}
