import { getPortalSession } from "@/lib/auth/portal";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { ShoppingCart, Receipt, ArrowRight, Sparkles, Package } from "lucide-react";

export default async function PortalDashboardPage() {
  const session = await getPortalSession();
  if (!session) redirect("/portal/login");

  const [orderCount, invoiceCount, paidInvoices, recentOrders] = await Promise.all([
    prisma.order.count({ where: { projectId: session.projectId } }),
    prisma.invoice.count({ where: { projectId: session.projectId } }),
    prisma.invoice.count({ where: { projectId: session.projectId, status: "PAID" } }),
    prisma.order.findMany({
      where: { projectId: session.projectId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, orderNumber: true, totalAmount: true, status: true, createdAt: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Hero Welcome */}
      <div className="bg-gradient-to-br from-brand-primary/10 via-surface-1 to-surface-1 border border-white/10 rounded-2xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-brand-primary" />
              <span className="text-xs text-text-muted tracking-wider uppercase font-medium">Client Portal</span>
            </div>
            <h1 className="text-2xl font-display font-bold text-text-main">Welcome, {session.name}</h1>
            <p className="text-text-muted text-sm mt-1">Here is your business overview at a glance.</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Orders", value: String(orderCount), icon: ShoppingCart, href: "/portal/orders", gradient: "from-sky-500 to-cyan-500" },
          { label: "Invoices", value: String(invoiceCount), icon: Receipt, href: "/portal/invoices", gradient: "from-violet-500 to-purple-500" },
          { label: "Paid", value: String(paidInvoices), icon: Package, href: "/portal/invoices", gradient: "from-emerald-500 to-teal-500" },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href} className="group bg-surface-1 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-black/20">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs text-text-muted font-medium tracking-wide uppercase">{stat.label}</p>
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg opacity-80 group-hover:opacity-100 transition-opacity`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-2xl font-display font-bold text-text-main">{stat.value}</p>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-surface-1 border border-white/10 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center">
              <ShoppingCart className="w-3.5 h-3.5 text-white" />
            </div>
            <h2 className="text-sm font-medium text-text-main">Recent Orders</h2>
          </div>
          <Link href="/portal/orders" className="text-xs text-brand-primary hover:text-brand-primary/80 transition-colors flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="py-10 text-center">
            <ShoppingCart className="w-8 h-8 text-text-muted/30 mx-auto mb-2" />
            <p className="text-sm text-text-muted">No orders yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2.5 px-3 -mx-3 rounded-lg hover:bg-surface-2/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-surface-2 flex items-center justify-center">
                    <ShoppingCart className="w-3.5 h-3.5 text-text-muted" />
                  </div>
                  <div>
                    <p className="text-sm text-text-main font-medium">{order.orderNumber}</p>
                    <p className="text-xs text-text-muted">{order.createdAt.toLocaleDateString("en-IN")}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <p className="text-sm text-text-main font-medium">₹{Number(order.totalAmount).toLocaleString("en-IN")}</p>
                  <span className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full ${
                    order.status === "DELIVERED" ? "bg-success/10 text-success" :
                    order.status === "CANCELLED" ? "bg-error/10 text-error" :
                    order.status === "PENDING" ? "bg-warning/10 text-warning" :
                    "bg-info/10 text-info"
                  }`}>{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
