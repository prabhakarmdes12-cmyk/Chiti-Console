import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const merged = { ...((user.preferences as Record<string, boolean>) || {}), ...body };
  await prisma.user.update({
    where: { email: session.user.email },
    data: { preferences: merged },
  });

  return NextResponse.json({ success: true, preferences: merged });
}
