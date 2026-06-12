import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import ChitiButton from "@/components/ui/ChitiButton";
import { createCustomer, deleteCustomer } from "@/lib/actions/customers";
import Link from "next/link";
import { Plus, Trash2, Download } from "lucide-react";

export default async function ProjectCustomersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) notFound();

  const customers = await prisma.customer.findMany({
    where: { projectId: id },
    orderBy: { totalSpent: "desc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-muted">{customers.length} customers</p>
        <div className="flex items-center gap-2">
          <a href={`/api/export?entity=customers`}>
            <ChitiButton variant="secondary" size="sm" icon={<Download className="w-4 h-4" />}>CSV</ChitiButton>
          </a>
          <details className="relative">
            <summary className="list-none">
              <ChitiButton size="sm" icon={<Plus className="w-4 h-4" />}>New</ChitiButton>
            </summary>
            <div className="absolute right-0 top-10 w-72 bg-surface-1 border border-white/10 rounded-xl p-4 shadow-2xl z-10">
              <form action={createCustomer} className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs text-text-muted">Name</label>
                  <input name="name" required className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs text-text-muted">Phone</label>
                  <input name="phone" className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs text-text-muted">Email</label>
                  <input name="email" type="email" className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm" />
                </div>
                <ChitiButton type="submit" className="w-full">Create</ChitiButton>
              </form>
            </div>
          </details>
        </div>
      </div>

      {customers.length === 0 && (
        <div className="bg-surface-1 border border-white/10 rounded-xl p-12 text-center">
          <p className="text-text-muted text-sm mb-2">No customers yet</p>
          <p className="text-text-muted/60 text-xs">Create your first customer using the &quot;New&quot; button above.</p>
        </div>
      )}
      {customers.length > 0 && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {customers.map((customer) => {
          const initials = customer.name.split(" ").map(n => n[0]).join("");
          const status = customer.totalOrders >= 10 ? "VIP" : customer.totalOrders >= 5 ? "Active" : "New";
          return (
            <div key={customer.id} className="group bg-surface-1 border border-white/10 rounded-xl p-4 space-y-2 hover:border-white/20 transition-colors relative">
              <Link href={`/customers/${customer.id}`} className="absolute inset-0 z-0" />
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center">
                    <span className="text-xs text-brand-primary font-bold">{initials}</span>
                  </div>
                  <div>
                    <p className="text-sm text-text-main font-medium">{customer.name}</p>
                    <p className="text-xs text-text-muted">{customer.phone || customer.email}</p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  status === "VIP" ? "bg-warning/10 text-warning" : status === "New" ? "bg-info/10 text-info" : "bg-success/10 text-success"
                }`}>{status}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-text-muted relative z-10">
                <span>{customer.totalOrders} orders</span>
                <span>₹{Number(customer.totalSpent).toLocaleString("en-IN")}</span>
              </div>
              <div className="relative z-10 flex justify-end">
                <form action={deleteCustomer.bind(null, customer.id)}>
                  <button type="submit" className="text-text-muted hover:text-error p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                </form>
              </div>
            </div>
          );
        })}
      </div>}
    </div>
  );
}
