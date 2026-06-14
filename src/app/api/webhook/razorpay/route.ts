import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature") || "";

  const crypto = require("crypto");
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  if (expected !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const event = JSON.parse(body);
    const { event: eventName, payload } = event;

    if (eventName === "payment.captured" || eventName === "order.paid") {
      const rzpOrderId = payload.order?.entity?.id || payload.payment?.entity?.order_id;
      const paymentId = payload.payment?.entity?.id;

      if (!rzpOrderId) {
        return NextResponse.json({ error: "Missing order ID" }, { status: 400 });
      }

      await prisma.order.updateMany({
        where: { paymentProviderId: rzpOrderId },
        data: {
          paymentStatus: "PAID",
          paymentProvider: "RAZORPAY",
          paymentProviderId: paymentId,
        },
      });

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("Razorpay webhook error:", e);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
