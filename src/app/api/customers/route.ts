import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authenticateApiKey } from "@/lib/api/auth";

export async function GET(request: Request) {
  const { error, project } = await authenticateApiKey(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
  const offset = parseInt(searchParams.get("offset") || "0");

  const where = { projectId: project!.id };

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({ where, orderBy: { totalSpent: "desc" }, take: limit, skip: offset }),
    prisma.customer.count({ where }),
  ]);

  return NextResponse.json({ data: customers, total, limit, offset });
}

export async function POST(request: Request) {
  const { error, project } = await authenticateApiKey(request);
  if (error) return error;

  const body = await request.json();

  const customer = await prisma.customer.create({
    data: { projectId: project!.id, name: body.name, phone: body.phone, email: body.email },
  });

  return NextResponse.json({ data: customer }, { status: 201 });
}
