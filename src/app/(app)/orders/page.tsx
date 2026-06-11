import { prisma } from "@/lib/db/prisma";
import { getProjectId } from "@/lib/db/queries";
import { Prisma } from "@/generated/prisma/client";
import ChitiPageHeader from "@/components/ui/ChitiPageHeader";
import ChitiStatusBadge from "@/components/ui/ChitiStatusBadge";
import ChitiButton from "@/components/ui/ChitiButton";
import SearchBar from "@/components/ui/SearchBar";
import FilterSelect from "@/components/ui/FilterSelect";
import PaginationBar from "@/components/ui/PaginationBar";
import { createOrder, updateOrderStatus, deleteOrder } from "@/lib/actions/orders";
import Link from "next/link";
import { Plus, Trash2, Download } from "lucide-react";

const PAGE_SIZE = 20;

const statusOptions = [
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

const sourceOptions = [
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "MANUAL", label: "Manual" },
  { value: "WEB_CHECKOUT", label: "Web Checkout" },
  { value: "API", label: "API" },
];

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; source?: string; page?: string }>;
}) {
  const projectId = await getProjectId();
  const { q, status, source, page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1", 10));

  const where: Prisma.OrderWhereInput = { projectId };

  if (q) {
    where.OR = [
      { orderNumber: { contains: q, mode: "insensitive" } },
      { customer: { name: { contains: q, mode: "insensitive" } } },
    ];
  }
  if (status) (where as any).status = status;
  if (source) (where as any).source = source;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { customer: true },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.order.count({ where }),
  ]);

  return (
    <div className="space-y-6">
      <ChitiPageHeader
        title="Orders"
        description="Manage and track all orders."
        actions={
          <div className="flex items-center gap-2">
            <a href="/api/export?entity=orders">
              <ChitiButton variant="secondary" size="sm" icon={<Download className="w-4 h-4" />}>Export CSV</ChitiButton>
            </a>
            <details className="relative">
              <summary className="list-none">
                <ChitiButton size="sm" icon={<Plus className="w-4 h-4" />}>New Order</ChitiButton>
              </summary>
              <div className="absolute right-0 top-10 w-72 bg-surface-1 border border-white/10 rounded-xl p-4 shadow-2xl z-10">
                <form action={createOrder} className="space-y-3">
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
                  <ChitiButton type="submit" className="w-full">Create Order</ChitiButton>
                </form>
              </div>
            </details>
          </div>
        }
      />

      <div className="flex items-center gap-3">
        <div className="flex-1 max-w-sm">
          <SearchBar placeholder="Search by order or customer..." />
        </div>
        <FilterSelect param="status" options={statusOptions} placeholder="All Statuses" />
        <FilterSelect param="source" options={sourceOptions} placeholder="All Sources" />
      </div>

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
              <th className="text-right p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr><td colSpan={8} className="p-8 text-center text-text-muted text-sm">No orders found</td></tr>
            )}
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-white/5 last:border-0 hover:bg-surface-2 transition-colors">
                <td className="p-4">
                  <Link href={`/orders/${order.id}`} className="font-medium text-text-main hover:text-brand-primary transition-colors">{order.orderNumber}</Link>
                </td>
                <td className="p-4 text-text-main">{order.customer?.name || "—"}</td>
                <td className="p-4 text-text-main">₹{Number(order.totalAmount).toLocaleString("en-IN")}</td>
                <td className="p-4">
                  <form action={updateOrderStatus.bind(null, order.id, order.status === "PENDING" ? "CONFIRMED" : order.status === "CONFIRMED" ? "PROCESSING" : order.status === "PROCESSING" ? "SHIPPED" : order.status === "SHIPPED" ? "DELIVERED" : "PENDING")}>
                    <button type="submit" className="text-left">
                      <ChitiStatusBadge status={order.status} type="order" />
                    </button>
                  </form>
                </td>
                <td className="p-4"><ChitiStatusBadge status={order.paymentStatus} type="payment" /></td>
                <td className="p-4 text-text-muted text-xs">{order.source}</td>
                <td className="p-4 text-text-muted">{order.createdAt.toLocaleDateString("en-IN")}</td>
                <td className="p-4 text-right">
                  <form action={deleteOrder.bind(null, order.id)}>
                    <button type="submit" className="text-text-muted hover:text-error transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <PaginationBar total={total} pageSize={PAGE_SIZE} />
      </div>
    </div>
  );
}
