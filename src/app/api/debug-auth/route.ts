import { auth } from "@/lib/auth/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id || null;
  const email = session?.user?.email || null;

  let user = null;
  if (userId) {
    user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, role: true } });
  }

  let userByEmail = null;
  if (email) {
    userByEmail = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true, role: true } });
  }

  return NextResponse.json({
    hasSession: !!session,
    sessionUserId: userId,
    sessionEmail: email,
    userFoundById: !!user,
    userById: user,
    userFoundByEmail: !!userByEmail,
    userByEmail,
  });
}
