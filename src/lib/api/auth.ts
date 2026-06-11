import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function authenticateApiKey(request: Request) {
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
