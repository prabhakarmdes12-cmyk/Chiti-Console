import { prisma } from "@/lib/db/prisma";

export const ADMIN_ROLES = ["SUPER_ADMIN", "PROJECT_ADMIN"] as const;
export const FINANCE_ROLES = ["SUPER_ADMIN", "PROJECT_ADMIN", "FINANCE_MANAGER"] as const;

export async function authenticate(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const { jwtVerify } = await import("jose");
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || "");
      const { payload } = await jwtVerify(token, secret);
      return { userId: payload.sub as string, email: payload.email as string, role: payload.role as string, projectSlug: payload.projectSlug as string };
    } catch {
      return null;
    }
  }
  const apiKey = req.headers.get("x-api-key");
  if (apiKey) {
    const project = await prisma.project.findUnique({ where: { apiKey } });
    if (project) return { userId: null, email: null, role: "API_KEY", projectSlug: project.slug };
  }
  return null;
}

export function requireRole(allowedRoles: readonly string[]) {
  return (role: string | null) => {
    if (!role || !allowedRoles.includes(role)) {
      return new Response(JSON.stringify({ error: { code: "FORBIDDEN", message: "Insufficient permissions" } }), { status: 403, headers: { "Content-Type": "application/json" } });
    }
    return null;
  };
}
