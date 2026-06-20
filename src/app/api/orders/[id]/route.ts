import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { authenticate } from "@/lib/api/auth";
import { orderUpdateSchema, validate } from "@/lib/api/validation";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const request = new Request(_request);
  const { error, project } = await authenticate(request);
  if (error) return error;

  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { id, projectId: project!.id },
    include: { customer: true, items: true, timeline: { orderBy: { createdAt: "desc" } } },
  });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json({ data: order });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, project } = await authenticate(request);
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const validated = validate(orderUpdateSchema, body);
  if (validated.error) return validated.error;

  const existing = await prisma.order.findFirst({ where: { id, projectId: project!.id } });
  if (!existing) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const data: Prisma.OrderUpdateInput = {};
  if (validated.data.status) data.status = validated.data.status;
  if (validated.data.paymentStatus) data.paymentStatus = validated.data.paymentStatus;

  const order = await prisma.order.update({ where: { id }, data, include: { items: true } });

  return NextResponse.json({ data: order });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, project } = await authenticate(request);
  if (error) return error;

  const { id } = await params;
  const existing = await prisma.order.findFirst({ where: { id, projectId: project!.id } });
  if (!existing) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  await prisma.order.delete({ where: { id } });
  return NextResponse.json({ data: { message: "Order deleted" } });
}
