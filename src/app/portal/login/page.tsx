import { redirect } from "next/navigation";
import { getPortalSession, verifyPortalAccess, setPortalSession } from "@/lib/auth/portal";

export default async function PortalLoginPage() {
  const session = await getPortalSession();
  if (session) redirect("/portal/dashboard");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-sm mx-4">
        <div className="bg-surface-1 border border-white/10 rounded-xl p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-brand-primary" />
            <span className="text-text-main font-display font-bold text-lg">Client Portal</span>
          </div>

          <form action={async (formData: FormData) => {
            "use server";
            const email = formData.get("email") as string;
            const secret = formData.get("secret") as string;
            if (!email || !secret) return;

            const portalSession = await verifyPortalAccess(email, secret);
            if (!portalSession) redirect("/portal/login?error=1");

            await setPortalSession(portalSession);
            redirect("/portal/dashboard");
          }} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm text-text-muted">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-3 py-2.5 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                placeholder="your@email.com"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="secret" className="block text-sm text-text-muted">Access Code</label>
              <input
                id="secret"
                name="secret"
                type="password"
                required
                className="w-full px-3 py-2.5 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                placeholder="Enter your access code"
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2.5 rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-medium transition-all"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
