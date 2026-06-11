import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { rateLimit } from "@/lib/api/rate-limit";

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

  return { error: null, project };
}
