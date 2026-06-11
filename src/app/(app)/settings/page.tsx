import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  const session = await auth();
  const user = session?.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { name: true, email: true, role: true, preferences: true },
      })
    : null;

  const name = user?.name || session?.user?.name || "User";
  const email = user?.email || session?.user?.email || "";
  const role = user?.role || "USER";
  const initials = name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
  const prefs = (user?.preferences as Record<string, boolean>) || {
    emailNotifications: true,
    whatsappAlerts: true,
    darkMode: true,
    soundEffects: false,
  };

  return <SettingsForm name={name} email={email} role={role} initials={initials} initialPrefs={prefs} />;
}
