import { generateObject, DEFAULT_MODEL } from ".";
import { z } from "zod";

const leadScoreSchema = z.object({
  score: z.number().min(0).max(100),
  reason: z.string(),
  category: z.enum(["HOT", "WARM", "COLD"]),
});

export async function scoreLead(input: {
  name: string;
  source: string;
  message?: string;
  company?: string;
  projectType: string;
}) {
  const { object } = await generateObject({
    model: DEFAULT_MODEL,
    schema: leadScoreSchema,
    system: `You are a lead scoring assistant for an Indian multi-project operations platform.
Score leads 0-100 based on:
- Source quality (WHATSAPP > WEBSITE_FORM > MANUAL > CALENDLY)
- Message specificity (product mentioned, budget, urgency)
- Company/B2B signal
- Relevance to project type

Output a score, a 1-line reason, and a category (HOT/WARM/COLD).`,
    prompt: JSON.stringify(input),
  });

  return object;
}
