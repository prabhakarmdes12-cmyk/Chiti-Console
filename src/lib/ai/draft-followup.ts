import { generateText, DEFAULT_MODEL } from ".";

export async function draftFollowUp(lead: {
  name: string;
  message?: string;
  status: string;
  source: string;
  company?: string;
}) {
  const { text } = await generateText({
    model: DEFAULT_MODEL,
    system: `You are a sales assistant for an Indian business operations platform.
Draft a WhatsApp follow-up message for a lead. Be concise, professional,
and contextually appropriate for the lead's current status. Use Hinglish
sparingly — only if the original conversation uses it.

Keep under 200 characters. Include a call to action. Sign with "— Chiti".`,
    prompt: JSON.stringify(lead),
  });

  return text;
}
