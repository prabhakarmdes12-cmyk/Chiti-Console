import { prisma } from "@/lib/db/prisma";
import { getProjectId } from "@/lib/db/queries";
import ChitiPageHeader from "@/components/ui/ChitiPageHeader";
import ChitiStatusBadge from "@/components/ui/ChitiStatusBadge";

export default async function OrdersPage() {
  const projectId = await getProjectId();
  const orders = await prisma.order.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    include: { customer: true },
  });

  return (
    <div className="space-y-6">
      <ChitiPageHeader title="Orders" description="Manage and track all orders." />

      <div className="bg-surface-1 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-text-muted">
              <th className="text-left p-4 font-medium">Order</th>
              <th className="text-left p-4 font-medium">Customer</th>
              <th className="text-left p-4 font-medium">Amount</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-left p-4 font-medium">Payment</th>
              <th className="text-left p-4 font-medium">Source</th>
              <th className="text-left p-4 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-text-muted text-sm">No orders found</td></tr>
            )}
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-white/5 last:border-0 hover:bg-surface-2 transition-colors">
                <td className="p-4 font-medium text-text-main">{order.orderNumber}</td>
                <td className="p-4 text-text-main">{order.customer?.name || "—"}</td>
                <td className="p-4 text-text-main">₹{Number(order.totalAmount).toLocaleString("en-IN")}</td>
                <td className="p-4"><ChitiStatusBadge status={order.status} type="order" /></td>
                <td className="p-4"><ChitiStatusBadge status={order.paymentStatus} type="payment" /></td>
                <td className="p-4 text-text-muted text-xs">{order.source}</td>
                <td className="p-4 text-text-muted">{order.createdAt.toLocaleDateString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
