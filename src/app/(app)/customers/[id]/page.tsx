import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getProjectId, projectFilter } from "@/lib/db/queries";
import FadeIn from "@/components/motion/FadeIn";
import ChitiCard from "@/components/ui/ChitiCard";
import ChitiPageHeader from "@/components/ui/ChitiPageHeader";
import ChitiButton from "@/components/ui/ChitiButton";
import ChitiStatusBadge from "@/components/ui/ChitiStatusBadge";
import { updateCustomer, deleteCustomer } from "@/lib/actions/customers";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projectId = await getProjectId();
  const customer = await prisma.customer.findFirst({
    where: { id, ...projectFilter(projectId) },
    include: { orders: { orderBy: { createdAt: "desc" }, take: 10 } },
  });

  if (!customer) notFound();

  const initials = (customer.name || "?").split(" ").map((n) => n[0]).join("");

  return (
    <div className="space-y-6">
      <FadeIn>
        <ChitiPageHeader
          title={customer.name}
          description={`${customer.phone || ""} ${customer.email ? `· ${customer.email}` : ""}`}
          actions={
            <Link href="/customers">
              <ChitiButton variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>Back</ChitiButton>
            </Link>
          }
        />
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4">
          <FadeIn direction="up" delay={0.1}>
            <ChitiCard>
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-brand-primary/20 flex items-center justify-center">
                  <span className="text-2xl text-brand-primary font-bold">{initials}</span>
                </div>
                <div>
                  <p className="text-text-main font-medium">{customer.name}</p>
                  <p className="text-xs text-text-muted">{customer.email}</p>
                </div>
              </div>
            </ChitiCard>
          </FadeIn>

          <FadeIn direction="up" delay={0.2}>
            <ChitiCard>
              <h3 className="text-sm font-medium text-text-muted mb-3">Stats</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-2 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-text-main">{customer.totalOrders}</p>
                  <p className="text-xs text-text-muted">Orders</p>
                </div>
                <div className="bg-surface-2 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-text-main">₹{Number(customer.totalSpent).toLocaleString("en-IN")}</p>
                  <p className="text-xs text-text-muted">Total Spent</p>
                </div>
              </div>
            </ChitiCard>
          </FadeIn>

          <FadeIn direction="up" delay={0.3}>
            <ChitiCard>
              <h3 className="text-sm font-medium text-text-muted mb-3">Actions</h3>
              <div className="space-y-2">
                <form action={deleteCustomer.bind(null, customer.id)}>
                  <ChitiButton type="submit" variant="ghost" size="sm" className="w-full text-error" icon={<Trash2 className="w-4 h-4" />}>Delete Customer</ChitiButton>
                </form>
              </div>
            </ChitiCard>
          </FadeIn>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <FadeIn direction="up" delay={0.15}>
            <ChitiCard>
              <h3 className="text-sm font-medium text-text-muted mb-3">Edit Customer</h3>
              <form action={updateCustomer.bind(null, customer.id)} className="grid grid-cols-2 gap-3">
                <div className="space-y-1 col-span-2">
                  <label className="block text-xs text-text-muted">Name</label>
                  <input name="name" defaultValue={customer.name} className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs text-text-muted">Phone</label>
                  <input name="phone" defaultValue={customer.phone || ""} className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs text-text-muted">Email</label>
                  <input name="email" defaultValue={customer.email || ""} className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm" />
                </div>
                <div className="col-span-2 flex justify-end pt-2">
                  <ChitiButton type="submit">Save Changes</ChitiButton>
                </div>
              </form>
            </ChitiCard>
          </FadeIn>

          <FadeIn direction="up" delay={0.25}>
            <ChitiCard>
              <h3 className="text-sm font-medium text-text-muted mb-3">Recent Orders</h3>
              {customer.orders.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-4">No orders yet</p>
              ) : (
                <div className="space-y-2">
                  {customer.orders.map((order) => (
                    <Link key={order.id} href={`/orders/${order.id}`} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-surface-2 transition-colors">
                      <div>
                        <p className="text-sm text-text-main font-medium">{order.orderNumber}</p>
                        <p className="text-xs text-text-muted">{new Date(order.createdAt).toLocaleDateString("en-IN")}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-text-main">₹{Number(order.totalAmount).toLocaleString("en-IN")}</p>
                        <ChitiStatusBadge status={order.status} type="order" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </ChitiCard>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
