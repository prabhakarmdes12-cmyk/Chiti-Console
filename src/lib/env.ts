const REQUIRED_ENV_VARS = ["DATABASE_URL", "AUTH_SECRET"];
const WHATSAPP_ENV_VARS = ["WHATSAPP_ACCESS_TOKEN", "WHATSAPP_PHONE_NUMBER_ID", "WHATSAPP_APP_SECRET"];

export function validateEnv() {
  if (process.env.NODE_ENV === "development") return;

  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}.\n` +
        "Check .env.example for the full list of required variables.",
    );
  }

  const waMissing = WHATSAPP_ENV_VARS.filter((key) => !process.env[key]);
  if (waMissing.length > 0) {
    console.warn(`Warning: WhatsApp integration won't work without: ${waMissing.join(", ")}`);
  }
}
