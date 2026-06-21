import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { SignJWT } from "jose";

function getJWTSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is required");
  return new TextEncoder().encode(secret);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const devEmail = process.env.AUTH_DEV_EMAIL || "admin@chiti.com";
  const devPassword = process.env.AUTH_DEV_PASSWORD || "admin123";

  if (email !== devEmail || password !== devPassword) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }

  const project = await prisma.project.findUnique({ where: { slug: "booking-jharkhand" } });

  const token = await new SignJWT({
    sub: user.id,
    email: user.email,
    role: user.role,
    projectSlug: "booking-jharkhand",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getJWTSecret());

  return NextResponse.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}
