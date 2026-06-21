import { prisma } from "@/lib/db/prisma";

export async function handleWebhook(source: string, payload: any) {
  switch (source) {
    case "whatsapp":
      return handleWhatsApp(payload);
    case "stripe":
      return handleStripe(payload);
    case "razorpay":
      return handleRazorpay(payload);
    default:
      throw new Error(`Unknown webhook source: ${source}`);
  }
}

async function handleWhatsApp(payload: any) {
  return { processed: true, source: "whatsapp" };
}

async function handleStripe(payload: any) {
  return { processed: true, source: "stripe" };
}

async function handleRazorpay(payload: any) {
  return { processed: true, source: "razorpay" };
}
