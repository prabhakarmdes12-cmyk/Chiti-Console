import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authenticate } from "@/lib/api/auth";
import { paginationSchema, promotionCreateSchema, validate } from "@/lib/api/validation";

export async function GET(request: Request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const isActive = searchParams.get("isActive");
  const pagination = validate(paginationSchema, Object.fromEntries(searchParams));
  const limit = pagination.data?.limit ?? 50;
  const offset = pagination.data?.offset ?? 0;

  const where: Record<string, unknown> = { projectId: auth.project!.id };
  if (isActive !== null) where.isActive = isActive === "true";

  const [promotions, total] = await Promise.all([
    prisma.promotion.findMany({ where, orderBy: { createdAt: "desc" }, take: limit, skip: offset }),
    prisma.promotion.count({ where }),
  ]);

  return NextResponse.json({ data: promotions, total, limit, offset });
}

export async function POST(request: Request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  const body = await request.json();
  const validated = validate(promotionCreateSchema, body);
  if (validated.error) return validated.error;

  const promotion = await prisma.promotion.create({
    data: {
      projectId: auth.project!.id,
      code: validated.data.code,
      type: validated.data.type as any,
      value: validated.data.value,
      minCartValue: validated.data.minCartValue ?? 0,
      maxDiscount: validated.data.maxDiscount ?? 0,
      applicableTypes: validated.data.applicableTypes || [],
      usageLimit: validated.data.usageLimit ?? 0,
      perUserLimit: validated.data.perUserLimit ?? 1,
      validFrom: validated.data.validFrom ? new Date(validated.data.validFrom) : null,
      validTo: validated.data.validTo ? new Date(validated.data.validTo) : null,
      isActive: validated.data.isActive ?? true,
      description: validated.data.description || null,
    },
  });

  return NextResponse.json({ data: promotion }, { status: 201 });
}
