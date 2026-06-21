/* eslint-disable @typescript-eslint/no-explicit-any */
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

async function handleWhatsApp(_payload: any) {
  return { processed: true, source: "whatsapp" };
}

async function handleStripe(_payload: any) {
  return { processed: true, source: "stripe" };
}

async function handleRazorpay(_payload: any) {
  return { processed: true, source: "razorpay" };
}
