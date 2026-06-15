import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import ChitiStatusBadge from "@/components/ui/ChitiStatusBadge";
import ChitiButton from "@/components/ui/ChitiButton";
import { createOrder, updateOrderStatus, deleteOrder } from "@/lib/actions/orders";
import Link from "next/link";
import { Plus, Trash2, Download } from "lucide-react";

export default async function ProjectOrdersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) notFound();

  const orders = await prisma.order.findMany({
    where: { projectId: id },
    orderBy: { createdAt: "desc" },
    include: { customer: true },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-muted">{orders.length} orders</p>
        <div className="flex items-center gap-2">
          <a href={`/api/export?entity=orders`}>
            <ChitiButton variant="secondary" size="sm" icon={<Download className="w-4 h-4" />}>CSV</ChitiButton>
          </a>
          <details className="relative">
            <summary className="list-none">
              <ChitiButton size="sm" icon={<Plus className="w-4 h-4" />}>New</ChitiButton>
            </summary>
            <div className="absolute right-0 top-10 w-72 bg-surface-1 border border-white/10 rounded-xl p-4 shadow-2xl z-10">
              <form action={createOrder} className="space-y-3">
                <input type="hidden" name="projectId" value={id} />
                <div className="space-y-1">
                  <label className="block text-xs text-text-muted">Customer ID</label>
                  <input name="customerId" className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm" placeholder="Optional" />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs text-text-muted">Source</label>
                  <select name="source" className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm">
                    <option value="MANUAL">Manual</option>
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="WEB_CHECKOUT">Web Checkout</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs text-text-muted">Amount (₹)</label>
                  <input name="totalAmount" type="number" step="0.01" required className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm" />
                </div>
                <ChitiButton type="submit" className="w-full">Create</ChitiButton>
              </form>
            </div>
          </details>
        </div>
      </div>

      {orders.length === 0 && (
        <div className="bg-surface-1 border border-white/10 rounded-xl p-12 text-center">
          <p className="text-text-muted text-sm mb-2">No orders yet</p>
          <p className="text-text-muted/60 text-xs">Create your first order using the &quot;New&quot; button above.</p>
        </div>
      )}
      {orders.length > 0 && <div className="bg-surface-1 border border-white/10 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-text-muted">
              <th className="text-left p-3 font-medium">Order</th>
              <th className="text-left p-3 font-medium">Customer</th>
              <th className="text-left p-3 font-medium">Amount</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Payment</th>
              <th className="text-left p-3 font-medium">Date</th>
              <th className="text-right p-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-white/5 last:border-0 hover:bg-surface-2 transition-colors">
                <td className="p-3">
                  <Link href={`/orders/${order.id}`} className="font-medium text-text-main hover:text-brand-primary">{order.orderNumber}</Link>
                </td>
                <td className="p-3 text-text-main">{order.customer?.name || "—"}</td>
                <td className="p-3 text-text-main">₹{Number(order.totalAmount).toLocaleString("en-IN")}</td>
                <td className="p-3">
                  <form action={updateOrderStatus.bind(null, order.id, order.status === "PENDING" ? "CONFIRMED" : order.status === "CONFIRMED" ? "PROCESSING" : order.status === "PROCESSING" ? "SHIPPED" : order.status === "SHIPPED" ? "DELIVERED" : "PENDING")}>
                    <button type="submit"><ChitiStatusBadge status={order.status} type="order" /></button>
                  </form>
                </td>
                <td className="p-3"><ChitiStatusBadge status={order.paymentStatus} type="payment" /></td>
                <td className="p-3 text-text-muted">{order.createdAt.toLocaleDateString("en-IN")}</td>
                <td className="p-3 text-right">
                  <form action={deleteOrder.bind(null, order.id)}>
                    <button type="submit" className="text-text-muted hover:text-error"><Trash2 className="w-3.5 h-3.5" /></button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>}
    </div>
  );
}
