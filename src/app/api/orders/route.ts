import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authenticateApiKey } from "@/lib/api/auth";

export async function GET(request: Request) {
  const { error, project } = await authenticateApiKey(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
  const offset = parseInt(searchParams.get("offset") || "0");

  const where: any = { projectId: project!.id };
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
  const { error, project } = await authenticateApiKey(request);
  if (error) return error;

  const body = await request.json();

  const order = await prisma.order.create({
    data: {
      orderNumber: body.orderNumber || `BB-${String(Date.now()).slice(-4)}`,
      projectId: project!.id,
      customerId: body.customerId || undefined,
      source: body.source || "API",
      status: body.status || "PENDING",
      paymentStatus: body.paymentStatus || "UNPAID",
      totalAmount: parseFloat(body.totalAmount),
      items: body.items ? { create: body.items.map((i: any) => ({ productName: i.productName, quantity: i.quantity, unitPrice: i.unitPrice, lineTotal: i.quantity * i.unitPrice })) } : undefined,
    },
    include: { items: true },
  });

  return NextResponse.json({ data: order }, { status: 201 });
}
