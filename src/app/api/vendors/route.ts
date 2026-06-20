import { NextResponse } from "next/server";
import type { VendorCategory, VendorStatus } from "@/generated/prisma/client";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { authenticate } from "@/lib/api/auth";
import { paginationSchema, vendorCreateSchema, validate } from "@/lib/api/validation";

export async function GET(request: Request) {
  const { error, project } = await authenticate(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const category = searchParams.get("category");
  const district = searchParams.get("district");
  const search = searchParams.get("search");
  const pagination = validate(paginationSchema, Object.fromEntries(searchParams));
  const limit = pagination.data?.limit ?? 50;
  const offset = pagination.data?.offset ?? 0;

  const where: Record<string, unknown> = { projectId: project!.id };
  if (status) where.status = status;
  if (category) where.category = category;
  if (district) where.district = district;
  if (search) {
    where.OR = [
      { businessName: { contains: search, mode: "insensitive" } },
      { ownerName: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
    ];
  }

  const [vendors, total] = await Promise.all([
    prisma.vendor.findMany({ where, orderBy: { createdAt: "desc" }, take: limit, skip: offset }),
    prisma.vendor.count({ where }),
  ]);

  return NextResponse.json({ data: vendors, total, limit, offset });
}

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
      status: "PENDING" as VendorStatus,
    },
  });

  return NextResponse.json({ data: vendor }, { status: 201 });
}
