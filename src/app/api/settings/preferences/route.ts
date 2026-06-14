import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";
import { NextResponse } from "next/server";
import { preferencesUpdateSchema, validate } from "@/lib/api/validation";

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const validated = validate(preferencesUpdateSchema, body);
  if (validated.error) return validated.error;
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const merged = { ...((user.preferences as Record<string, boolean>) || {}), ...validated.data };
  await prisma.user.update({
    where: { email: session.user.email },
    data: { preferences: merged as Record<string, boolean> },
  });

  return NextResponse.json({ success: true, preferences: merged });
}
