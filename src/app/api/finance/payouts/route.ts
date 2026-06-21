import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authenticate, FINANCE_ROLES, requireRole } from "@/lib/api/auth";

function money(value: unknown) {
  return Number(value ?? 0);
}

const payoutStatuses = new Set(["PENDING", "PROCESSING", "COMPLETED", "FAILED"]);

export async function GET(request: Request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  const payouts = await prisma.payout.findMany({
    where: { projectId: auth.project!.id },
    include: { vendor: { select: { businessName: true, category: true } } },
    orderBy: [{ status: "asc" }, { scheduledFor: "asc" }],
  });

  return NextResponse.json({
    data: payouts.map((payout) => ({
      id: payout.id,
      vendorId: payout.vendorId,
      vendorName: payout.vendor.businessName,
      category: payout.vendor.category,
      amount: money(payout.amount),
      status: payout.status,
      scheduledFor: payout.scheduledFor,
      processedAt: payout.processedAt,
      utrNumber: payout.utrNumber,
      notes: payout.notes,
    })),
  });
}

export async function POST(request: Request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;
  const roleErr = requireRole(FINANCE_ROLES as unknown as string[], auth.user?.role); if (roleErr) return roleErr;

  const body = await request.json();
  const amount = Number(body.amount);
  if (!body.vendorId || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "vendorId and amount are required" }, { status: 400 });
  }

  const vendor = await prisma.vendor.findFirst({ where: { id: body.vendorId, projectId: auth.project!.id }, select: { id: true } });
  if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

  const payout = await prisma.payout.create({
    data: {
      projectId: auth.project!.id,
      vendorId: body.vendorId,
      amount,
      scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : new Date(),
      notes: body.notes,
    },
  });

  return NextResponse.json({ data: { ...payout, amount: money(payout.amount) } }, { status: 201 });
}

export async function PATCH(request: Request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;
  const roleErr = requireRole(FINANCE_ROLES as unknown as string[], auth.user?.role); if (roleErr) return roleErr;

  const body = await request.json();
  if (!body.id || !payoutStatuses.has(body.status)) {
    return NextResponse.json({ error: "id and status are required" }, { status: 400 });
  }

  const existing = await prisma.payout.findFirst({ where: { id: body.id, projectId: auth.project!.id }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "Payout not found" }, { status: 404 });

  const payout = await prisma.payout.update({
    where: { id: existing.id },
    data: {
      status: body.status,
      utrNumber: body.utrNumber,
      processedAt: body.status === "COMPLETED" ? new Date() : undefined,
    },
  });

  return NextResponse.json({ data: { ...payout, amount: money(payout.amount) } });
}
