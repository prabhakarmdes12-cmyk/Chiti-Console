import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authenticate } from "@/lib/api/auth";
import { orderCreateSchema, paginationSchema, validate } from "@/lib/api/validation";

export async function GET(request: Request) {
  const { error, project } = await authenticate(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const pagination = validate(paginationSchema, Object.fromEntries(searchParams));
  const limit = pagination.data?.limit ?? 50;
  const offset = pagination.data?.offset ?? 0;

  const where: Record<string, unknown> = { projectId: project!.id };
  if (status) where.status = status;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: { customer: { select: { name: true, phone: true } }, items: true },
    }),
    prisma.order.count({ where }),
  ]);

  return NextResponse.json({ data: orders, total, limit, offset });
}

export async function POST(request: Request) {
  const { error, project } = await authenticate(request);
  if (error) return error;

  const body = await request.json();
  const validated = validate(orderCreateSchema, body);
  if (validated.error) return validated.error;

  const order = await prisma.order.create({
    data: {
      orderNumber: validated.data.orderNumber || `BB-${String(Date.now()).slice(-4)}`,
      projectId: project!.id,
      customerId: validated.data.customerId || undefined,
      source: validated.data.source || "API",
      status: validated.data.status || "PENDING",
      paymentStatus: validated.data.paymentStatus || "UNPAID",
      totalAmount: validated.data.totalAmount,
      items: validated.data.items ? { create: validated.data.items.map((i) => ({ productName: i.productName, quantity: i.quantity, unitPrice: i.unitPrice, lineTotal: i.quantity * i.unitPrice })) } : undefined,
    },
    include: { items: true },
  });

  return NextResponse.json({ data: order }, { status: 201 });
}
