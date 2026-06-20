import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authenticate } from "@/lib/api/auth";
import { promotionUpdateSchema, validate } from "@/lib/api/validation";

export async function GET(request: Request, { params }: any) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  const promotion = await prisma.promotion.findFirst({
    where: { id: params.id, projectId: auth.project!.id },
  });
  if (!promotion) {
    return NextResponse.json({ error: "Promotion not found" }, { status: 404 });
  }

  return NextResponse.json({ data: promotion });
}

export async function PUT(request: Request, { params }: any) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  const existing = await prisma.promotion.findFirst({
    where: { id: params.id, projectId: auth.project!.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Promotion not found" }, { status: 404 });
  }

  const body = await request.json();
  const validated = validate(promotionUpdateSchema, body);
  if (validated.error) return validated.error;

  const promotion = await prisma.promotion.update({
    where: { id: params.id },
    data: {
      ...(validated.data.code !== undefined && { code: validated.data.code }),
      ...(validated.data.type !== undefined && { type: validated.data.type as any }),
      ...(validated.data.value !== undefined && { value: validated.data.value }),
      ...(validated.data.minCartValue !== undefined && { minCartValue: validated.data.minCartValue }),
      ...(validated.data.maxDiscount !== undefined && { maxDiscount: validated.data.maxDiscount }),
      ...(validated.data.applicableTypes !== undefined && { applicableTypes: validated.data.applicableTypes }),
      ...(validated.data.usageLimit !== undefined && { usageLimit: validated.data.usageLimit }),
      ...(validated.data.perUserLimit !== undefined && { perUserLimit: validated.data.perUserLimit }),
      ...(validated.data.validFrom !== undefined && { validFrom: validated.data.validFrom ? new Date(validated.data.validFrom) : null }),
      ...(validated.data.validTo !== undefined && { validTo: validated.data.validTo ? new Date(validated.data.validTo) : null }),
      ...(validated.data.isActive !== undefined && { isActive: validated.data.isActive }),
      ...(validated.data.description !== undefined && { description: validated.data.description }),
    },
  });

  return NextResponse.json({ data: promotion });
}
