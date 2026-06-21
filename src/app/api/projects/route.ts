import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";
import { projectTypeToCapabilities } from "@/engines/capabilities";
import type { Capability } from "@/engines/registry";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    let body: any;
    try { body = await req.json(); } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { name, domain, integrationType, logoUrl, capabilities } = body;
    if (!name?.trim()) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const caps: Capability[] = capabilities?.length > 0
      ? capabilities
      : projectTypeToCapabilities(body.type || "CUSTOM");

    const project = await prisma.project.create({
      data: {
        name,
        slug,
        type: (body.type || "CUSTOM") as any,
        domain: domain || undefined,
        integrationType: integrationType || "MANUAL",
        logoUrl: logoUrl || undefined,
        capabilities: caps,
      },
    });

    await prisma.userProject.create({
      data: { userId: user.id, projectId: project.id, role: "ADMIN" },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (err) {
    console.error("projects POST error:", err);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
