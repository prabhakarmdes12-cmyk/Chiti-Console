import { generateObject, DEFAULT_MODEL } from ".";
import { z } from "zod";

const orderItemSchema = z.object({
  productName: z.string(),
  quantity: z.number().min(1),
  unitPrice: z.number().optional(),
  notes: z.string().optional(),
});

const extractedOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1),
  customerName: z.string().optional(),
  phone: z.string().optional(),
  totalAmount: z.number(),
  confidence: z.enum(["HIGH", "MEDIUM", "LOW"]),
  missingInfo: z.array(z.string()),
});

export async function extractOrderFromMessages(messages: Array<{
  content: string;
  isFromCustomer: boolean;
}>) {
  const conversation = messages
    .map((m) => `${m.isFromCustomer ? "Customer" : "You"}: ${m.content}`)
    .join("\n");

  const { object } = await generateObject({
    model: DEFAULT_MODEL,
    schema: extractedOrderSchema,
    system: `You are an order extraction assistant for Indian WhatsApp commerce.
Read the conversation and extract order details. Be conservative — only extract
what is clearly stated. If information is ambiguous, list it in missingInfo.

Products may be mentioned with Indian names (e.g. "chandan soap", "almond oil").
Prices in ₹. Quantities as numbers or words (e.g. "2", "dozen", "half kg").`,
    prompt: conversation,
  });

  return object;
}
