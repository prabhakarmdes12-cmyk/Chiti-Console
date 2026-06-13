import { auth } from "@/lib/auth/auth";
import { redirect, notFound } from "next/navigation";
import { createOrder } from "@/lib/actions/orders";
import { prisma } from "@/lib/db/prisma";
import { getProjectId } from "@/lib/db/queries";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ChitiPageHeader from "@/components/ui/ChitiPageHeader";

export default async function NewOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string; customerName?: string; source?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const params = await searchParams;
  const projectId = await getProjectId();
  if (!projectId) notFound();

  const project = await prisma.project.findUnique({ where: { id: projectId }, select: { name: true } });
  const customers = projectId
    ? await prisma.customer.findMany({ where: { projectId }, orderBy: { name: "asc" }, select: { id: true, name: true, phone: true } })
    : [];

  return (
    <div className="space-y-6 max-w-2xl">
      <ChitiPageHeader
        title="New Order"
        description={project?.name ? `Create an order for ${project.name}` : "Create a new order"}
        actions={
          <Link href="/orders" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-2 hover:bg-surface-3 border border-white/10 text-text-main text-sm transition-all">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        }
      />

      <form action={createOrder} className="bg-surface-1 border border-white/10 rounded-xl p-6 space-y-5">
        <div>
          <label htmlFor="customerId" className="block text-sm text-text-muted mb-1">Customer</label>
          <select
            id="customerId"
            name="customerId"
            defaultValue={params.customerId || ""}
            className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
          >
            <option value="">Walk-in / Unknown</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}{c.phone ? ` (${c.phone})` : ""}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="source" className="block text-sm text-text-muted mb-1">Source</label>
          <select
            id="source"
            name="source"
            defaultValue={params.source || "MANUAL"}
            className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
          >
            <option value="MANUAL">Manual Entry</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="WEB_CHECKOUT">Web Checkout</option>
            <option value="API">API</option>
          </select>
        </div>

        <div>
          <label htmlFor="totalAmount" className="block text-sm text-text-muted mb-1">Total Amount (₹) *</label>
          <input
            id="totalAmount"
            name="totalAmount"
            type="number"
            step="0.01"
            min="0"
            required
            className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
            placeholder="0.00"
          />
        </div>

        <button
          type="submit"
          className="w-full px-4 py-3 rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-medium transition-all duration-150"
        >
          Create Order
        </button>
      </form>
    </div>
  );
}


