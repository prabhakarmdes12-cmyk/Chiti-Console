import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getProjectId, projectFilter } from "@/lib/db/queries";
import ChitiCard from "@/components/ui/ChitiCard";
import ChitiPageHeader from "@/components/ui/ChitiPageHeader";
import ChitiStatusBadge from "@/components/ui/ChitiStatusBadge";
import ChitiButton from "@/components/ui/ChitiButton";
import { updateOrderStatus, deleteOrder } from "@/lib/actions/orders";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projectId = await getProjectId();
  const order = await prisma.order.findFirst({
    where: { id, ...projectFilter(projectId) },
    include: { customer: true, items: true, timeline: { orderBy: { createdAt: "desc" } } },
  });

  if (!order) notFound();

  return (
    <div className="space-y-6">
      <ChitiPageHeader
        title={`Order ${order.orderNumber}`}
        description={`Placed on ${order.createdAt.toLocaleDateString("en-IN", { dateStyle: "long" })}`}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/orders">
              <ChitiButton variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>Back</ChitiButton>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <ChitiCard>
            <h3 className="text-sm font-medium text-text-muted mb-3">Order Items</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-text-muted">
                  <th className="text-left pb-2 font-medium">Item</th>
                  <th className="text-right pb-2 font-medium">Qty</th>
                  <th className="text-right pb-2 font-medium">Price</th>
                  <th className="text-right pb-2 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-b border-white/5 last:border-0">
                    <td className="py-2 text-text-main">{item.productName}</td>
                    <td className="py-2 text-right text-text-muted">{item.quantity}</td>
                    <td className="py-2 text-right text-text-muted">₹{Number(item.unitPrice).toLocaleString("en-IN")}</td>
                    <td className="py-2 text-right text-text-main font-medium">₹{Number(item.lineTotal).toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-white/10">
                  <td colSpan={3} className="pt-2 text-right text-sm text-text-muted font-medium">Total</td>
                  <td className="pt-2 text-right text-sm text-text-main font-bold">₹{Number(order.totalAmount).toLocaleString("en-IN")}</td>
                </tr>
              </tfoot>
            </table>
          </ChitiCard>

          <ChitiCard>
            <h3 className="text-sm font-medium text-text-muted mb-3">Timeline</h3>
            <div className="space-y-3">
              {order.timeline.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-brand-primary mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <ChitiStatusBadge status={entry.status} type="order" />
                      <span className="text-xs text-text-muted">{new Date(entry.createdAt).toLocaleString("en-IN")}</span>
                    </div>
                    {entry.note && <p className="text-xs text-text-muted mt-0.5">{entry.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </ChitiCard>
        </div>

        <div className="space-y-4">
          <ChitiCard>
            <h3 className="text-sm font-medium text-text-muted mb-3">Order Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Status</span>
                <ChitiStatusBadge status={order.status} type="order" />
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Payment</span>
                <ChitiStatusBadge status={order.paymentStatus} type="payment" />
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Source</span>
                <span className="text-text-main">{order.source}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Amount</span>
                <span className="text-text-main font-bold">₹{Number(order.totalAmount).toLocaleString("en-IN")}</span>
              </div>
            </div>
          </ChitiCard>

          {order.customer && (
            <ChitiCard>
              <h3 className="text-sm font-medium text-text-muted mb-3">Customer</h3>
              <div className="space-y-1 text-sm">
                <p className="text-text-main">{order.customer.name}</p>
                {order.customer.phone && <p className="text-text-muted">{order.customer.phone}</p>}
                {order.customer.email && <p className="text-text-muted">{order.customer.email}</p>}
              </div>
            </ChitiCard>
          )}

          <ChitiCard>
            <h3 className="text-sm font-medium text-text-muted mb-3">Actions</h3>
            <div className="space-y-2">
              <form action={updateOrderStatus.bind(null, order.id, "CONFIRMED")}>
                <ChitiButton type="submit" variant="secondary" size="sm" className="w-full">Mark Confirmed</ChitiButton>
              </form>
              <form action={updateOrderStatus.bind(null, order.id, "SHIPPED")}>
                <ChitiButton type="submit" variant="secondary" size="sm" className="w-full">Mark Shipped</ChitiButton>
              </form>
              <form action={updateOrderStatus.bind(null, order.id, "DELIVERED")}>
                <ChitiButton type="submit" variant="secondary" size="sm" className="w-full">Mark Delivered</ChitiButton>
              </form>
              <form action={updateOrderStatus.bind(null, order.id, "CANCELLED")}>
                <ChitiButton type="submit" variant="ghost" size="sm" className="w-full text-error">Cancel Order</ChitiButton>
              </form>
              <div className="pt-2 border-t border-white/10">
                <form action={deleteOrder.bind(null, order.id)}>
                  <ChitiButton type="submit" variant="ghost" size="sm" className="w-full text-error" icon={<Trash2 className="w-4 h-4" />}>Delete</ChitiButton>
                </form>
              </div>
            </div>
          </ChitiCard>
        </div>
      </div>
    </div>
  );
}
