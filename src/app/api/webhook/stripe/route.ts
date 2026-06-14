import { handleStripeWebhook } from "@/lib/billing/stripe";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return Response.json({ error: "Missing signature" }, { status: 400 });
  }

  try {
    const event = await handleStripeWebhook(body, signature);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const tierId = session.metadata?.tierId;
        if (userId && tierId) {
          await prisma.user.update({
            where: { id: userId },
            data: { preferences: { ...(await getUserPrefs(userId)), subscription: { tier: tierId, active: true, since: new Date().toISOString() } } },
          });
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const userId = sub.metadata?.userId;
        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: { preferences: { ...(await getUserPrefs(userId)), subscription: { tier: "free", active: false, since: null } } },
          });
        }
        break;
      }
    }

    return Response.json({ received: true });
  } catch (err) {
    console.error("Stripe webhook error:", err);
    return Response.json({ error: "Webhook error" }, { status: 400 });
  }
}

async function getUserPrefs(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { preferences: true } });
  return (user?.preferences as Record<string, unknown>) || {};
}
