import { createHmac, timingSafeEqual } from "crypto";

export function validateRazorpayWebhook(body: string, signature: string, secret: string): boolean {
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  if (expected.length !== signature.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export function validateStripeWebhook(body: string, signature: string, secret: string): boolean {
  const { default: Stripe } = require("stripe");
  try {
    Stripe.webhooks.constructEvent(body, signature, secret);
    return true;
  } catch {
    return false;
  }
}
