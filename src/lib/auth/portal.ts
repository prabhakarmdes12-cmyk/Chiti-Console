import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";

const PORTAL_COOKIE = "chiti_portal";
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24h

export interface PortalSession {
  clientId: string;
  projectId: string;
  name: string;
  email: string;
}

export async function verifyPortalAccess(email: string, secret: string): Promise<PortalSession | null> {
  try {
    const client = await prisma.clientAccess.findFirst({
      where: { email: email.toLowerCase().trim(), active: true, sharedSecret: secret },
    });
    if (!client) return null;

    await prisma.clientAccess.update({
      where: { id: client.id },
      data: { lastLoginAt: new Date() },
    });

    return { clientId: client.id, projectId: client.projectId, name: client.name, email: client.email };
  } catch {
    return null;
  }
}

export async function setPortalSession(session: PortalSession) {
  const cookieStore = await cookies();
  const payload = Buffer.from(JSON.stringify(session)).toString("base64");
  cookieStore.set(PORTAL_COOKIE, payload, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION / 1000,
    path: "/",
  });
}

export async function getPortalSession(): Promise<PortalSession | null> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(PORTAL_COOKIE)?.value;
    if (!raw) return null;
    return JSON.parse(Buffer.from(raw, "base64").toString("utf-8"));
  } catch {
    return null;
  }
}

export async function clearPortalSession() {
  const cookieStore = await cookies();
  cookieStore.delete(PORTAL_COOKIE);
}

export async function getPortalClient(clientId: string) {
  return prisma.clientAccess.findUnique({ where: { id: clientId }, include: { project: { select: { name: true, slug: true } } } });
}
