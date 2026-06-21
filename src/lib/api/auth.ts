import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { rateLimit } from "@/lib/api/rate-limit";
import { jwtVerify } from "jose";

function getJWTSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is required");
  return new TextEncoder().encode(secret);
}

export async function authenticateApiKey(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const rl = rateLimit(ip, 60, 60_000);
  if (!rl.allowed) {
    return { error: NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 }), project: null };
  }

  const apiKey = request.headers.get("x-api-key");
  if (!apiKey) {
    return { error: NextResponse.json({ error: "Missing x-api-key header" }, { status: 401 }), project: null };
  }

  const project = await prisma.project.findUnique({ where: { apiKey } });
  if (!project) {
    return { error: NextResponse.json({ error: "Invalid API key" }, { status: 403 }), project: null };
  }

  return { error: null, project, user: null };
}

export async function authenticateJWT(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const rl = rateLimit(ip, 60, 60_000);
  if (!rl.allowed) {
    return { error: NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 }), project: null };
  }

  const auth = request.headers.get("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return { error: NextResponse.json({ error: "Missing Authorization header" }, { status: 401 }), project: null };
  }

  const token = auth.slice(7);
  try {
    const { payload } = await jwtVerify(token, getJWTSecret());
    const projectSlug = payload.projectSlug as string;
    const project = await prisma.project.findUnique({ where: { slug: projectSlug } });
    if (!project) {
      return { error: NextResponse.json({ error: "Project not found" }, { status: 403 }), project: null };
    }
    const userId = payload.sub as string;
    const role = payload.role as string;
    if (role !== "SUPER_ADMIN") {
      const membership = await prisma.userProject.findUnique({ where: { userId_projectId: { userId, projectId: project.id } } });
      if (!membership) {
        return { error: NextResponse.json({ error: "Project access denied" }, { status: 403 }), project: null };
      }
    }
    return {
      error: null,
      project,
      user: { id: userId, email: payload.email as string, role },
    };
  } catch {
    return { error: NextResponse.json({ error: "Invalid or expired token" }, { status: 401 }), project: null };
  }
}

export async function authenticate(request: Request) {
  const auth = request.headers.get("Authorization");
  if (auth?.startsWith("Bearer ")) {
    return authenticateJWT(request);
  }
  return authenticateApiKey(request);
}

export function requireRole(allowedRoles: string[], userRole?: string) {
  if (!userRole || !allowedRoles.includes(userRole)) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }
  return null;
}

export const ADMIN_ROLES = ["SUPER_ADMIN", "PROJECT_ADMIN"] as const;
export const FINANCE_ROLES = ["SUPER_ADMIN", "PROJECT_ADMIN", "FINANCE_MANAGER"] as const;
