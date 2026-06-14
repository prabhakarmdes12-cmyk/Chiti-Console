export function validateRazorpayWebhook(body: string, signature: string, secret: string): boolean {
  const crypto = require("crypto");
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return expected === signature;
}

export function validateStripeWebhook(body: string, signature: string, secret: string): boolean {
  const stripe = require("stripe");
  try {
    stripe.webhooks.constructEvent(body, signature, secret);
    return true;
  } catch {
    return false;
  }
}
