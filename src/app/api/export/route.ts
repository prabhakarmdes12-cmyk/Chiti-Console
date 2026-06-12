import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { getProjectId } from "@/lib/db/queries";

function toCSV(headers: string[], rows: string[][]): string {
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  return [headers.join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n");
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const entity = searchParams.get("entity") || "orders";
  const projectId = await getProjectId();

  if (!projectId) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  let csv = "";
  let filename = "";

  if (entity === "orders") {
    const orders = await prisma.order.findMany({
      where: { projectId },
      include: { customer: true },
      orderBy: { createdAt: "desc" },
    });
    csv = toCSV(
      ["Order Number", "Customer", "Amount", "Status", "Payment", "Source", "Date"],
      orders.map((o) => [
        o.orderNumber,
        o.customer?.name || "",
        Number(o.totalAmount).toString(),
        o.status,
        o.paymentStatus,
        o.source,
        o.createdAt.toISOString(),
      ]),
    );
    filename = "orders.csv";
  } else if (entity === "products") {
    const products = await prisma.product.findMany({ where: { projectId }, orderBy: { name: "asc" } });
    csv = toCSV(
      ["Name", "SKU", "Category", "Price", "Stock", "Status"],
      products.map((p) => [
        p.name,
        p.sku || "",
        p.category || "",
        Number(p.price).toString(),
        (p.stock ?? 0).toString(),
        p.isActive ? "Active" : "Inactive",
      ]),
    );
    filename = "products.csv";
  } else if (entity === "customers") {
    const customers = await prisma.customer.findMany({ where: { projectId }, orderBy: { totalSpent: "desc" } });
    csv = toCSV(
      ["Name", "Phone", "Email", "Orders", "Total Spent"],
      customers.map((c) => [
        c.name,
        c.phone || "",
        c.email || "",
        c.totalOrders.toString(),
        Number(c.totalSpent).toString(),
      ]),
    );
    filename = "customers.csv";
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
