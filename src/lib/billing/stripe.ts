import Stripe from "stripe";

const stripeKey = process.env.STRIPE_SECRET_KEY;
const getClient = () => (stripeKey ? new Stripe(stripeKey) : null);

export interface PriceTier {
  id: string;
  name: string;
  price: number;
  interval: "month" | "year";
  description: string;
  features: string[];
  highlighted?: boolean;
  priceId?: string;
}

export const TIERS: PriceTier[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    interval: "month",
    description: "For solo founders exploring the platform.",
    features: [
      "1 project",
      "50 orders/month",
      "Basic analytics",
      "WhatsApp integration",
      "Community support",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    price: 999,
    interval: "month",
    description: "For growing businesses with multiple projects.",
    features: [
      "3 projects",
      "1,000 orders/month",
      "AI lead scoring",
      "AI order extraction",
      "AI follow-up drafts",
      "NL dashboard query",
      "Financial module (invoices, expenses, P&L)",
      "Client portal (5 clients)",
      "Email support",
    ],
    highlighted: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: 2999,
    interval: "month",
    description: "For established agencies and operations teams.",
    features: [
      "15 projects",
      "10,000 orders/month",
      "Everything in Starter",
      "Client portal (unlimited)",
      "GA4 analytics integration",
      "Custom integrations",
      "Priority support",
      "SLA guarantee",
    ],
  },
];

export async function createCheckoutSession(tierId: string, userId: string) {
  const stripe = getClient();
  if (!stripe) throw new Error("Stripe not configured");

  const tier = TIERS.find((t) => t.id === tierId);
  if (!tier || tier.price === 0) throw new Error("Invalid tier");

  const priceId = process.env[`STRIPE_PRICE_${tierId.toUpperCase()}`];
  if (!priceId) throw new Error("Price ID not configured");

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: userId,
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://chiti-console.vercel.app"}/settings?billing=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://chiti-console.vercel.app"}/pricing`,
    metadata: { userId, tierId },
  });

  return session;
}

export async function handleStripeWebhook(body: string, signature: string) {
  const stripe = getClient();
  if (!stripe) throw new Error("Stripe not configured");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) throw new Error("Webhook secret not configured");

  const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  return event;
}
