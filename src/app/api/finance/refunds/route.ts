import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authenticate, FINANCE_ROLES, requireRole } from "@/lib/api/auth";

function money(value: unknown) {
  return Number(value ?? 0);
}

const refundStatuses = new Set(["REQUESTED", "APPROVED", "PROCESSED", "REJECTED"]);

export async function GET(request: Request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  const refunds = await prisma.refund.findMany({
    where: { projectId: auth.project!.id },
    include: { order: { select: { orderNumber: true, totalAmount: true } } },
    orderBy: { requestedAt: "desc" },
  });

  return NextResponse.json({
    data: refunds.map((refund) => ({
      id: refund.id,
      orderId: refund.orderId,
      orderNumber: refund.order.orderNumber,
      orderAmount: money(refund.order.totalAmount),
      amount: money(refund.amount),
      reason: refund.reason,
      status: refund.status,
      requestedAt: refund.requestedAt,
      processedAt: refund.processedAt,
    })),
  });
}

export async function POST(request: Request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;
  const roleErr = requireRole(FINANCE_ROLES as unknown as string[], auth.user?.role); if (roleErr) return roleErr;

  const body = await request.json();
  const amount = Number(body.amount);
  if (!body.orderId || !Number.isFinite(amount) || amount < 0) {
    return NextResponse.json({ error: "orderId and amount are required" }, { status: 400 });
  }

  const order = await prisma.order.findFirst({ where: { id: body.orderId, projectId: auth.project!.id }, select: { id: true, totalAmount: true } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (amount > money(order.totalAmount)) return NextResponse.json({ error: "Refund exceeds order amount" }, { status: 400 });

  const refund = await prisma.refund.create({
    data: {
      projectId: auth.project!.id,
      orderId: body.orderId,
      amount,
      reason: body.reason,
    },
  });

  return NextResponse.json({ data: { ...refund, amount: money(refund.amount) } }, { status: 201 });
}

export async function PATCH(request: Request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;
  const roleErr = requireRole(FINANCE_ROLES as unknown as string[], auth.user?.role); if (roleErr) return roleErr;

  const body = await request.json();
  if (!body.id || !refundStatuses.has(body.status)) {
    return NextResponse.json({ error: "id and status are required" }, { status: 400 });
  }

  const existing = await prisma.refund.findFirst({ where: { id: body.id, projectId: auth.project!.id }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "Refund not found" }, { status: 404 });

  const refund = await prisma.refund.update({
    where: { id: existing.id },
    data: {
      status: body.status,
      processedAt: body.status === "PROCESSED" ? new Date() : undefined,
    },
  });

  return NextResponse.json({ data: { ...refund, amount: money(refund.amount) } });
}
