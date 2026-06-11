const REQUIRED_ENV_VARS = ["DATABASE_URL", "AUTH_SECRET"];

export function validateEnv() {
  if (process.env.NODE_ENV === "development") return;

  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}.\n` +
        "Check .env.example for the full list of required variables.",
    );
  }
}
