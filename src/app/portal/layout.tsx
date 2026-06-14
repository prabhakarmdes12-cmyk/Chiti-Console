import { getPortalSession, clearPortalSession, getPortalClient } from "@/lib/auth/portal";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getPortalSession();
  if (!session) redirect("/portal/login");

  const client = await getPortalClient(session.clientId);
  if (!client) {
    await clearPortalSession();
    redirect("/portal/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-white/5 bg-surface-1/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-text-main font-display font-bold text-sm">{client.project.name}</span>
              <span className="text-[10px] text-text-muted ml-2 tracking-wider uppercase">· Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <nav className="flex items-center gap-1 mr-2">
              {[
                { label: "Dashboard", href: "/portal/dashboard" },
                { label: "Orders", href: "/portal/orders" },
                { label: "Invoices", href: "/portal/invoices" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-1.5 rounded-lg text-xs text-text-muted hover:text-text-main hover:bg-surface-2 transition-all"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="h-6 w-px bg-white/5" />
            <span className="text-xs text-text-muted">{session.name}</span>
            <form action={async () => {
              "use server";
              await clearPortalSession();
              redirect("/portal/login");
            }}>
              <button type="submit" className="p-2 rounded-lg text-text-muted hover:text-error hover:bg-surface-2 transition-all">
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/5 to-transparent h-48 pointer-events-none" />
        <main className="relative max-w-5xl mx-auto p-6">{children}</main>
      </div>
    </div>
  );
}
