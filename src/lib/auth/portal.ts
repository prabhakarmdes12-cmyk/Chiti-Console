import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { SignJWT, jwtVerify } from "jose";

const PORTAL_COOKIE = "chiti_portal";
const SESSION_DURATION = 24 * 60 * 60 * 1000;

function getSecret(): Uint8Array {
  const raw = process.env.AUTH_SECRET;
  if (!raw) throw new Error("AUTH_SECRET is required for portal session signing");
  return new TextEncoder().encode(raw);
}

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
  const token = await new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getSecret());

  cookieStore.set(PORTAL_COOKIE, token, {
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
    const token = cookieStore.get(PORTAL_COOKIE)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as PortalSession;
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
