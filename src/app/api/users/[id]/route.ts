import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authenticate } from "@/lib/api/auth";

export async function GET(request: Request, { params }: any) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;
  if (auth.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Super admin access required" }, { status: 403 });
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ data: user });
}

export async function PATCH(request: Request, { params }: any) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;
  if (auth.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Super admin access required" }, { status: 403 });
  }

  const { id } = await params;

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const body = await request.json();
  const { role } = body;

  const data: Record<string, string> = {};
  if (role) data.role = role;

  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return NextResponse.json({ data: user });
}
