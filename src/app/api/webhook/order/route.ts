import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authenticateApiKey } from "@/lib/api/auth";

export async function POST(request: Request) {
  const { error, project } = await authenticateApiKey(request);
  if (error) return error;

  const body = await request.json();

  const existingProduct = body.productExternalId
    ? await prisma.product.findFirst({ where: { externalId: body.productExternalId, projectId: project!.id } })
    : null;

  const customer = body.customerPhone
    ? await prisma.customer.findFirst({ where: { phone: body.customerPhone, projectId: project!.id } })
    : null;

  const order = await prisma.order.create({
    data: {
      orderNumber: body.orderNumber || `BB-${String(Date.now()).slice(-4)}`,
      projectId: project!.id,
      customerId: customer?.id,
      source: "API",
      status: body.status || "PENDING",
      paymentStatus: body.paymentStatus || "UNPAID",
      totalAmount: parseFloat(body.totalAmount || "0"),
      items: body.items
        ? { create: body.items.map((i: any) => ({
            productId: existingProduct?.id,
            productName: i.productName,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            lineTotal: i.quantity * i.unitPrice,
          })) }
        : undefined,
      timeline: { create: { status: body.status || "PENDING", note: "Order received via webhook" } },
    },
    include: { items: true },
  });

  return NextResponse.json({ data: order }, { status: 201 });
}
