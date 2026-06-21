import { auth } from "@/lib/auth/auth";
import { NextResponse } from "next/server";

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") || "*";
  const allowed = new Set([
    "https://chiti-console.vercel.app",
    "https://booking-jharkhand-beta.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173",
  ]);
  const allowOrigin = origin === "*" || allowed.has(origin) ? origin : "https://chiti-console.vercel.app";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
    "Access-Control-Allow-Credentials": "true",
  };
}

function handleCors(req: Request): NextResponse | null {
  if (req.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
  }
  return null;
}

export const proxy = auth((req) => {
  const corsResp = handleCors(req);
  if (corsResp) return corsResp;

  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const isPublic = pathname === "/login" || pathname === "/manifest.webmanifest" || pathname.startsWith("/api/auth") || pathname.startsWith("/api/health") || pathname.startsWith("/api/contact");
  const isPortal = pathname.startsWith("/portal");

  if (isPortal || pathname.startsWith("/api/")) {
    return NextResponse.next({ headers: corsHeaders(req) });
  }

  if (!isLoggedIn && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isLoggedIn && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next({ headers: corsHeaders(req) });
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
