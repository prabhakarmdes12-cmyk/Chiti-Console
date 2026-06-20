import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authenticate } from "@/lib/api/auth";

export async function POST(request: Request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  const body = await request.json();
  const { name, email, phone, message, company } = body;

  if (!name || !message) {
    return NextResponse.json({ error: "Name and message are required" }, { status: 400 });
  }

  const lead = await prisma.lead.create({
    data: {
      projectId: auth.project!.id,
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
