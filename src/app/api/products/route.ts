import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authenticate } from "@/lib/api/auth";
import { productCreateSchema, paginationSchema, validate } from "@/lib/api/validation";

export async function GET(request: Request) {
  const { error, project } = await authenticate(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const pagination = validate(paginationSchema, Object.fromEntries(searchParams));
  const limit = pagination.data?.limit ?? 50;
  const offset = pagination.data?.offset ?? 0;

  const where: Record<string, unknown> = { projectId: project!.id };
  if (category) where.category = category;

  const [products, total] = await Promise.all([
    prisma.product.findMany({ where, orderBy: { name: "asc" }, take: limit, skip: offset }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({ data: products, total, limit, offset });
}

export async function POST(request: Request) {
  const { error, project } = await authenticate(request);
  if (error) return error;

  const body = await request.json();
  const validated = validate(productCreateSchema, body);
  if (validated.error) return validated.error;

  const product = await prisma.product.create({
    data: {
      projectId: project!.id,
      name: validated.data.name,
      sku: validated.data.sku,
      category: validated.data.category,
      price: validated.data.price,
      stock: validated.data.stock ?? 0,
      lowStockThreshold: validated.data.lowStockThreshold ?? 5,
      externalId: validated.data.externalId,
    },
  });

  return NextResponse.json({ data: product }, { status: 201 });
}
