import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authenticate } from "@/lib/api/auth";
import { customerCreateSchema, paginationSchema, validate } from "@/lib/api/validation";

export async function GET(request: Request) {
  const { error, project } = await authenticate(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const pagination = validate(paginationSchema, Object.fromEntries(searchParams));
  const limit = pagination.data?.limit ?? 50;
  const offset = pagination.data?.offset ?? 0;

  const where = { projectId: project!.id };

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({ where, orderBy: { totalSpent: "desc" }, take: limit, skip: offset }),
    prisma.customer.count({ where }),
  ]);

  return NextResponse.json({ data: customers, total, limit, offset });
}

export async function POST(request: Request) {
  const { error, project } = await authenticate(request);
  if (error) return error;

  const body = await request.json();
  const validated = validate(customerCreateSchema, body);
  if (validated.error) return validated.error;

  const customer = await prisma.customer.create({
    data: { projectId: project!.id, name: validated.data.name, phone: validated.data.phone, email: validated.data.email },
  });

  return NextResponse.json({ data: customer }, { status: 201 });
}
