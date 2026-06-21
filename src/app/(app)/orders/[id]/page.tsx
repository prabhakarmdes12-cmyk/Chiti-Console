import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getProjectId, projectFilter } from "@/lib/db/queries";
import FadeIn from "@/components/motion/FadeIn";
import ChitiCard from "@/components/ui/ChitiCard";
import ChitiPageHeader from "@/components/ui/ChitiPageHeader";
import ChitiStatusBadge from "@/components/ui/ChitiStatusBadge";
import ChitiButton from "@/components/ui/ChitiButton";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import { updateOrderStatus, deleteOrder, markOrderPaid } from "@/lib/actions/orders";
import { createInvoice } from "@/lib/actions/finance";
import Link from "next/link";
import { ArrowLeft, Trash2, Receipt, CalendarDays, Users, MapPin, Percent, Landmark, Building2 } from "lucide-react";

function money(value: unknown) {
  return Number(value || 0).toLocaleString("en-IN");
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-text-muted">{label}</span>
      <span className="text-text-main text-right">{value}</span>
    </div>
  );
}

function BookingDetail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="w-4 h-4 mt-0.5 text-text-muted shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-text-muted">{label}</p>
        <p className="text-sm text-text-main">{value}</p>
      </div>
    </div>
  );
}

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projectId = await getProjectId();
  const order = await prisma.order.findFirst({
    where: { id, ...projectFilter(projectId) },
    include: {
      customer: true,
      vendor: true,
      items: true,
      timeline: { orderBy: { createdAt: "desc" } },
      escrow: true,
      refunds: true,
      invoices: true,
    },
  });

  if (!order) notFound();

  const netToVendor = Number(order.totalAmount) - Number(order.discount) - Number(order.commissionAmount) - Number(order.platformFee) - Number(order.gstAmount);
  const hasBookingFields = order.checkIn || order.checkOut || order.guests || order.roomType || order.pickupLocation || order.dropoffLocation;
  const existingInvoice = order.invoices.length > 0;

  return (
    <div className="space-y-6">
      <FadeIn>
        <ChitiPageHeader
          title={`Booking ${order.orderNumber}`}
          description={`${order.createdAt.toLocaleDateString("en-IN", { dateStyle: "long" })} · ${order.source}`}
          actions={
            <div className="flex items-center gap-2">
              <Link href="/orders">
                <ChitiButton variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>Back to Orders</ChitiButton>
              </Link>
              {!existingInvoice && (
                <form action={createInvoice.bind(null, order.id)}>
                  <ChitiButton type="submit" variant="secondary" size="sm" icon={<Receipt className="w-4 h-4" />}>Generate Invoice</ChitiButton>
                </form>
              )}
            </div>
          }
        />
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">

          {hasBookingFields && (
            <ErrorBoundary>
            <FadeIn direction="up" delay={0.05}>
              <ChitiCard padding="md" glass glow>
                <h3 className="text-sm font-medium text-text-muted mb-4 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-brand-primary" /> Booking Details
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {order.checkIn && (
                    <BookingDetail icon={<CalendarDays className="w-4 h-4" />} label="Check In" value={order.checkIn.toLocaleDateString("en-IN", { dateStyle: "medium" })} />
                  )}
                  {order.checkOut && (
                    <BookingDetail icon={<CalendarDays className="w-4 h-4" />} label="Check Out" value={order.checkOut.toLocaleDateString("en-IN", { dateStyle: "medium" })} />
                  )}
                  {order.guests && (
                    <BookingDetail icon={<Users className="w-4 h-4" />} label="Guests" value={String(order.guests)} />
                  )}
                  {order.roomType && (
                    <BookingDetail icon={<Building2 className="w-4 h-4" />} label="Room Type" value={order.roomType} />
                  )}
                  {order.pickupLocation && (
                    <BookingDetail icon={<MapPin className="w-4 h-4" />} label="Pickup" value={order.pickupLocation} />
                  )}
                  {order.dropoffLocation && (
                    <BookingDetail icon={<MapPin className="w-4 h-4" />} label="Dropoff" value={order.dropoffLocation} />
                  )}
                </div>
                {order.notes && <p className="mt-4 text-sm text-text-muted border-t border-white/10 pt-3">{order.notes}</p>}
              </ChitiCard>
            </FadeIn>
            </ErrorBoundary>
          )}

          <FadeIn direction="up" delay={0.1}>
            <ErrorBoundary>
            <ChitiCard>
              <h3 className="text-sm font-medium text-text-muted mb-3">Items</h3>
              <div className="overflow-x-auto">
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
                        <td className="py-2 text-right text-text-muted">₹{money(item.unitPrice)}</td>
                        <td className="py-2 text-right text-text-main font-medium">₹{money(item.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ChitiCard>
            </ErrorBoundary>
          </FadeIn>

          {order.refunds.length > 0 && (
            <ErrorBoundary>
            <FadeIn direction="up" delay={0.15}>
              <ChitiCard>
                <h3 className="text-sm font-medium text-text-muted mb-3">Refunds</h3>
                <div className="space-y-2">
                  {order.refunds.map((refund) => (
                    <div key={refund.id} className="flex items-center justify-between rounded-lg bg-surface-2/30 p-3 text-sm">
                      <div>
                        <p className="text-text-main font-medium">₹{money(refund.amount)}</p>
                        <p className="text-text-muted text-xs">{refund.reason}</p>
                      </div>
                      <ChitiStatusBadge status={refund.status} />
                    </div>
                  ))}
                </div>
              </ChitiCard>
            </FadeIn>
            </ErrorBoundary>
          )}

          <ErrorBoundary>
          <FadeIn direction="up" delay={0.2}>
            <ChitiCard>
              <h3 className="text-sm font-medium text-text-muted mb-3">Timeline</h3>
              <div className="space-y-3">
                {order.timeline.length === 0 && <p className="text-xs text-text-muted text-center py-4">No timeline entries yet</p>}
                {order.timeline.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-brand-primary mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <ChitiStatusBadge status={entry.status} type="order" />
                        <span className="text-xs text-text-muted">{new Date(entry.createdAt).toLocaleString("en-IN")}</span>
                      </div>
                      {entry.note && <p className="text-xs text-text-muted mt-0.5">{entry.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </ChitiCard>
          </FadeIn>
          </ErrorBoundary>
        </div>

        <div className="space-y-4">

          <ErrorBoundary>
          <FadeIn direction="up" delay={0.1}>
            <ChitiCard padding="md" glass>
              <h3 className="text-sm font-medium text-text-muted mb-3 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-brand-primary" /> Order Details
              </h3>
              <div className="space-y-2 text-sm">
                <InfoRow label="Status" value={<ChitiStatusBadge status={order.status} type="order" />} />
                <InfoRow label="Payment" value={<ChitiStatusBadge status={order.paymentStatus} type="payment" />} />
                {order.paymentMethod && <InfoRow label="Method" value={order.paymentMethod} />}
                {order.paymentProvider && (
                  <InfoRow label="Provider" value={`${order.paymentProvider}${order.paymentProviderId ? ` · ${order.paymentProviderId.slice(0, 12)}...` : ""}`} />
                )}
                <InfoRow label="Source" value={order.source} />
              </div>
            </ChitiCard>
          </FadeIn>
          </ErrorBoundary>

          <ErrorBoundary>
          <FadeIn direction="up" delay={0.15}>
            <ChitiCard padding="md" glass>
              <h3 className="text-sm font-medium text-text-muted mb-3 flex items-center gap-2">
                <Percent className="w-4 h-4 text-brand-primary" /> Financial Breakdown
              </h3>
              <div className="space-y-2 text-sm">
                <InfoRow label="Gross Amount" value={`₹${money(order.totalAmount)}`} />
                {Number(order.discount) > 0 && <InfoRow label="Discount" value={`-₹${money(order.discount)}`} />}
                <div className="border-t border-white/5 pt-2">
                  <InfoRow label="Commission" value={`-₹${money(order.commissionAmount)}`} />
                  <InfoRow label="Platform Fee" value={`-₹${money(order.platformFee)}`} />
                  <InfoRow label="GST" value={`-₹${money(order.gstAmount)}`} />
                </div>
                <div className="border-t border-white/10 pt-2">
                  <InfoRow label="Net to Vendor" value={`₹${money(netToVendor)}`} />
                </div>
              </div>
            </ChitiCard>
          </FadeIn>
          </ErrorBoundary>

          {order.customer && (
            <ErrorBoundary>
            <FadeIn direction="up" delay={0.2}>
              <ChitiCard padding="md" glass>
                <h3 className="text-sm font-medium text-text-muted mb-3">Customer</h3>
                <div className="space-y-1 text-sm">
                  <p className="text-text-main font-medium">{order.customer.name}</p>
                  {order.customer.phone && <p className="text-text-muted">{order.customer.phone}</p>}
                  {order.customer.email && <p className="text-text-muted">{order.customer.email}</p>}
                </div>
              </ChitiCard>
            </FadeIn>
            </ErrorBoundary>
          )}

          {order.vendor && (
            <ErrorBoundary>
            <FadeIn direction="up" delay={0.2}>
              <ChitiCard padding="md" glass>
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="w-4 h-4 text-brand-primary" />
                  <h3 className="text-sm font-medium text-text-muted">Vendor</h3>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-text-main font-medium">{order.vendor.businessName}</p>
                  <p className="text-text-muted">{order.vendor.category.replace("_", " ")} · {order.vendor.district}</p>
                  <p className="text-text-muted">{order.vendor.phone}</p>
                  {order.vendor.email && <p className="text-text-muted">{order.vendor.email}</p>}
                  <Link href={`/vendors/${order.vendor.id}`} className="inline-block mt-2 text-xs text-brand-primary hover:underline">View Vendor →</Link>
                </div>
              </ChitiCard>
            </FadeIn>
            </ErrorBoundary>
          )}

          {order.escrow && (
            <ErrorBoundary>
            <FadeIn direction="up" delay={0.25}>
              <ChitiCard padding="md" glass>
                <div className="flex items-center gap-2 mb-3">
                  <Landmark className="w-4 h-4 text-brand-primary" />
                  <h3 className="text-sm font-medium text-text-muted">Escrow</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <InfoRow label="Status" value={<ChitiStatusBadge status={order.escrow.status} />} />
                  <InfoRow label="Gross Amount" value={`₹${money(order.escrow.grossAmount)}`} />
                  <InfoRow label="Commission" value={`₹${money(order.escrow.commissionAmount)}`} />
                  <InfoRow label="Vendor Amount" value={`₹${money(order.escrow.vendorAmount)}`} />
                  {order.escrow.releaseDueAt && <InfoRow label="Release Due" value={order.escrow.releaseDueAt.toLocaleDateString("en-IN", { dateStyle: "medium" })} />}
                  {order.escrow.heldAt && <InfoRow label="Held Since" value={order.escrow.heldAt.toLocaleDateString("en-IN", { dateStyle: "medium" })} />}
                  {order.escrow.notes && <p className="text-xs text-text-muted mt-2">{order.escrow.notes}</p>}
                </div>
              </ChitiCard>
            </FadeIn>
            </ErrorBoundary>
          )}

          <FadeIn direction="up" delay={0.3}>
            <ChitiCard padding="md" glass>
              <h3 className="text-sm font-medium text-text-muted mb-3">Actions</h3>
              <div className="space-y-2">
                {order.paymentStatus === "UNPAID" && (
                  <form action={async (formData: FormData) => {
                    "use server";
                    await markOrderPaid(
                      order.id,
                      formData.get("paymentMethod") as string || "UPI",
                      formData.get("paymentProvider") as string || "MANUAL",
                      formData.get("paymentProviderId") as string || ""
                    );
                  }}>
                    <div className="space-y-2 mb-3 p-3 bg-surface-2 rounded-lg">
                      <input name="paymentMethod" placeholder="Method (UPI, COD, etc.)" defaultValue="UPI" className="w-full px-2 py-1.5 rounded bg-surface-1 border border-white/10 text-text-main text-xs" />
                      <input name="paymentProvider" placeholder="Provider (RAZORPAY, STRIPE, etc.)" defaultValue="MANUAL" className="w-full px-2 py-1.5 rounded bg-surface-1 border border-white/10 text-text-main text-xs" />
                      <input name="paymentProviderId" placeholder="Transaction ID" className="w-full px-2 py-1.5 rounded bg-surface-1 border border-white/10 text-text-main text-xs" />
                      <ChitiButton type="submit" variant="secondary" size="sm" className="w-full">Mark Paid</ChitiButton>
                    </div>
                  </form>
                )}
                <form action={updateOrderStatus.bind(null, order.id, "CONFIRMED")}>
                  <ChitiButton type="submit" variant="secondary" size="sm" className="w-full">Mark Confirmed</ChitiButton>
                </form>
                <form action={updateOrderStatus.bind(null, order.id, "PROCESSING")}>
                  <ChitiButton type="submit" variant="secondary" size="sm" className="w-full">Mark Processing</ChitiButton>
                </form>
                <form action={updateOrderStatus.bind(null, order.id, "DELIVERED")}>
                  <ChitiButton type="submit" variant="secondary" size="sm" className="w-full">Mark Completed</ChitiButton>
                </form>
                <form action={updateOrderStatus.bind(null, order.id, "CANCELLED")}>
                  <ChitiButton type="submit" variant="ghost" size="sm" className="w-full text-error">Cancel Booking</ChitiButton>
                </form>
                <div className="pt-2 border-t border-white/10">
                  <form action={deleteOrder.bind(null, order.id)}>
                    <ChitiButton type="submit" variant="ghost" size="sm" className="w-full text-error" icon={<Trash2 className="w-4 h-4" />}>Delete</ChitiButton>
                  </form>
                </div>
              </div>
            </ChitiCard>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
