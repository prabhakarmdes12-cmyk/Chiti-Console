"use server";

import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

export async function updatePreferences(preferences: Record<string, boolean>) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Not authenticated");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("User not found");

  const merged = { ...((user.preferences as Record<string, boolean>) || {}), ...preferences };

  await prisma.user.update({
    where: { email: session.user.email },
    data: { preferences: merged },
  });
}
