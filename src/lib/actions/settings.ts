"use server";

import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

export async function updatePreferences(preferences: Record<string, boolean>) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Not authenticated");

  let user;
  try {
    user = await prisma.user.findUnique({ where: { email: session.user.email } });
  } catch (e) {
    console.error("updatePreferences find failed:", e);
    throw new Error("Failed to find user");
  }
  if (!user) throw new Error("User not found");

  const merged = { ...((user.preferences as Record<string, boolean>) || {}), ...preferences };

  try {
    await prisma.user.update({
      where: { email: session.user.email },
      data: { preferences: merged },
    });
  } catch (e) {
    console.error("updatePreferences update failed:", e);
    throw new Error("Failed to update preferences");
  }
}
