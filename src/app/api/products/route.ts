import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authenticateApiKey } from "@/lib/api/auth";

export async function GET(request: Request) {
  const { error, project } = await authenticateApiKey(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
  const offset = parseInt(searchParams.get("offset") || "0");

  const where: any = { projectId: project!.id };
  if (category) where.category = category;

  const [products, total] = await Promise.all([
    prisma.product.findMany({ where, orderBy: { name: "asc" }, take: limit, skip: offset }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({ data: products, total, limit, offset });
}

export async function POST(request: Request) {
  const { error, project } = await authenticateApiKey(request);
  if (error) return error;

  const body = await request.json();

  const product = await prisma.product.create({
    data: {
      projectId: project!.id,
      name: body.name,
      sku: body.sku,
      category: body.category,
      price: parseFloat(body.price),
      stock: body.stock ? parseInt(body.stock) : 0,
      lowStockThreshold: body.lowStockThreshold ? parseInt(body.lowStockThreshold) : 5,
      externalId: body.externalId,
    },
  });

  return NextResponse.json({ data: product }, { status: 201 });
}
