import { NextResponse } from "next/server";
import type { EnquiryStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { authenticateApiKey } from "@/lib/api/auth";
import { enquiryUpdateSchema, validate } from "@/lib/api/validation";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const request = new Request(_request);
  const { error, project } = await authenticateApiKey(request);
  if (error) return error;

  const { id } = await params;
  const enquiry = await prisma.enquiry.findFirst({
    where: { id, projectId: project!.id },
  });

  if (!enquiry) return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
  return NextResponse.json({ data: enquiry });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, project } = await authenticateApiKey(request);
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const validated = validate(enquiryUpdateSchema, body);
  if (validated.error) return validated.error;

  const existing = await prisma.enquiry.findFirst({ where: { id, projectId: project!.id } });
  if (!existing) return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });

  const data: Record<string, unknown> = {};
  if (validated.data.status) data.status = validated.data.status as EnquiryStatus;
  if (validated.data.assignedTo !== undefined) data.assignedTo = validated.data.assignedTo;
  if (validated.data.priority) data.priority = validated.data.priority;

  const enquiry = await prisma.enquiry.update({ where: { id }, data });

  return NextResponse.json({ data: enquiry });
}
