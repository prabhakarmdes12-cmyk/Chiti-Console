import { getPortalSession } from "@/lib/auth/portal";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import FadeIn from "@/components/motion/FadeIn";

export const dynamic = "force-dynamic";

export default async function PortalOrdersPage() {
  const session = await getPortalSession();
  if (!session) redirect("/portal/login");

  const orders = await prisma.order.findMany({
    where: { projectId: session.projectId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, orderNumber: true, totalAmount: true, status: true, paymentStatus: true, createdAt: true },
  });

  const badgeColors: Record<string, string> = {
    DELIVERED: "bg-success/10 text-success",
    CANCELLED: "bg-error/10 text-error",
    PENDING: "bg-warning/10 text-warning",
    CONFIRMED: "bg-info/10 text-info",
    PROCESSING: "bg-info/10 text-info",
    SHIPPED: "bg-info/10 text-info",
  };

  return (
    <div className="space-y-4">
      <FadeIn>
      <div>
        <h1 className="text-xl font-display font-bold text-text-main">Orders</h1>
        <p className="text-sm text-text-muted mt-1">All your orders</p>
      </div>
      </FadeIn>

      <FadeIn direction="up" delay={0.1}>
      <div className="bg-surface-1 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-text-muted">
              <th className="text-left p-4 font-medium">Order</th>
              <th className="text-left p-4 font-medium">Amount</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-left p-4 font-medium">Payment</th>
              <th className="text-left p-4 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-text-muted text-sm">No orders yet</td></tr>
            )}
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-white/5 last:border-0">
                <td className="p-4 text-text-main font-medium">{order.orderNumber}</td>
                <td className="p-4 text-text-main">₹{Number(order.totalAmount).toLocaleString("en-IN")}</td>
                <td className="p-4">
                  <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${badgeColors[order.status] || "bg-surface-2 text-text-muted"}`}>{order.status}</span>
                </td>
                <td className="p-4">
                  <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${
                    order.paymentStatus === "PAID" ? "bg-success/10 text-success" :
                    order.paymentStatus === "UNPAID" ? "bg-error/10 text-error" :
                    "bg-warning/10 text-warning"
                  }`}>{order.paymentStatus}</span>
                </td>
                <td className="p-4 text-text-muted">{order.createdAt.toLocaleDateString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </FadeIn>
    </div>
  );
}
