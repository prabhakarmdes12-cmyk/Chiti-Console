import { prisma } from "@/lib/db/prisma";
import { getProjectId } from "@/lib/db/queries";
import ChitiPageHeader from "@/components/ui/ChitiPageHeader";

export default async function CustomersPage() {
  const projectId = await getProjectId();
  const customers = await prisma.customer.findMany({
    where: { projectId },
    orderBy: { totalSpent: "desc" },
  });

  return (
    <div className="space-y-6">
      <ChitiPageHeader title="Customers" description="View and manage your customer base." />

      {customers.length === 0 && (
        <div className="bg-surface-1 border border-white/10 rounded-xl p-12 text-center text-text-muted text-sm">No customers yet</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {customers.map((customer) => {
          const initials = customer.name.split(" ").map(n => n[0]).join("");
          const status = customer.totalOrders >= 10 ? "VIP" : customer.totalOrders >= 5 ? "Active" : "New";
          return (
            <div key={customer.id} className="bg-surface-1 border border-white/10 rounded-xl p-5 space-y-3 hover:border-white/20 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-primary/20 flex items-center justify-center">
                    <span className="text-sm text-brand-primary font-bold">{initials}</span>
                  </div>
                  <div>
                    <p className="text-sm text-text-main font-medium">{customer.name}</p>
                    <p className="text-xs text-text-muted">{customer.phone || customer.email}</p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  status === "VIP" ? "bg-warning/10 text-warning" :
                  status === "New" ? "bg-info/10 text-info" :
                  "bg-success/10 text-success"
                }`}>{status}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
                <div>
                  <p className="text-xs text-text-muted">Orders</p>
                  <p className="text-sm text-text-main font-medium">{customer.totalOrders}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Total Spent</p>
                  <p className="text-sm text-text-main font-medium">₹{Number(customer.totalSpent).toLocaleString("en-IN")}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
