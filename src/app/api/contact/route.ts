import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, phone, message, company } = body;

  if (!name || !message) {
    return NextResponse.json({ error: "Name and message are required" }, { status: 400 });
  }

  const project = await prisma.project.findFirst({ where: { slug: "booking-jharkhand" } });
  if (!project) {
    return NextResponse.json({ error: "Project not configured" }, { status: 500 });
  }

  const lead = await prisma.lead.create({
    data: {
      projectId: project.id,
      name,
      email: email || null,
      phone: phone || null,
      company: company || null,
      message,
      source: "WEBSITE_FORM" as any,
      status: "NEW" as any,
    },
  });

  return NextResponse.json({ data: lead }, { status: 201 });
}
