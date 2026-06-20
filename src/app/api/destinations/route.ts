import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authenticate } from "@/lib/api/auth";

export async function GET(request: Request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  const destinations = await prisma.destination.findMany({
    where: { projectId: auth.project!.id, isActive: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ data: destinations });
}
