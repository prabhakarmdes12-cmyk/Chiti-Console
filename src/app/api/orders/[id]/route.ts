import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { authenticateApiKey } from "@/lib/api/auth";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const request = new Request(_request);
  const { error, project } = await authenticateApiKey(request);
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
  const { error, project } = await authenticateApiKey(request);
  if (error) return error;

  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.order.findFirst({ where: { id, projectId: project!.id } });
  if (!existing) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const data: Prisma.OrderUpdateInput = {};
  if (body.status) data.status = body.status;
  if (body.paymentStatus) data.paymentStatus = body.paymentStatus;

  const order = await prisma.order.update({ where: { id }, data, include: { items: true } });

  return NextResponse.json({ data: order });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, project } = await authenticateApiKey(request);
  if (error) return error;

  const { id } = await params;
  const existing = await prisma.order.findFirst({ where: { id, projectId: project!.id } });
  if (!existing) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  await prisma.order.delete({ where: { id } });
  return NextResponse.json({ data: { message: "Order deleted" } });
}
