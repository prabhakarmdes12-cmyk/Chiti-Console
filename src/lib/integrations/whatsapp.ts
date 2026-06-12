const BASE = "https://graph.facebook.com/v22.0";

function getConfig() {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) {
    throw new Error("WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID must be set");
  }
  return { token, phoneNumberId };
}

export async function sendTextMessage(to: string, body: string) {
  const { token, phoneNumberId } = getConfig();
  const res = await fetch(`${BASE}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`WhatsApp API error: ${res.status} ${err}`);
  }
  return res.json();
}

export function verifyWebhook(mode: string | null, verifyToken: string | null, challenge: string | null) {
  const expected = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "chiti-console-verify";
  if (mode === "subscribe" && verifyToken === expected && challenge) {
    return { verified: true, challenge: parseInt(challenge, 10) };
  }
  return { verified: false, challenge: null };
}

export function extractIncomingMessage(payload: Record<string, unknown>) {
  const entry = (payload?.entry as Record<string, unknown>[])?.[0];
  const change = (entry?.changes as Record<string, unknown>[])?.[0];
  const value = change?.value as Record<string, unknown>;
  if (!value) return null;

  const messages = (value.messages as Record<string, unknown>[])?.[0];
  const contacts = (value.contacts as Record<string, unknown>[])?.[0];
  if (!messages) return null;

  return {
    waMessageId: messages.id as string,
    from: messages.from as string,
    fromName: ((contacts?.profile as Record<string, string>)?.name) || "Unknown",
    content: ((messages.text as Record<string, string>)?.body) || "",
    timestamp: messages.timestamp as string,
    type: (messages.type as string) || "text",
  };
}
