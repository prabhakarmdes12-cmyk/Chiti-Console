import { prisma } from "@/lib/db/prisma";
import { getProjectId, projectFilter } from "@/lib/db/queries";
import { Prisma } from "@/generated/prisma/client";
import ChitiPageHeader from "@/components/ui/ChitiPageHeader";
import ChitiButton from "@/components/ui/ChitiButton";
import SearchBar from "@/components/ui/SearchBar";
import FilterSelect from "@/components/ui/FilterSelect";
import PaginationBar from "@/components/ui/PaginationBar";
import { createCustomer, deleteCustomer } from "@/lib/actions/customers";
import Link from "next/link";
import { Plus, Trash2, Download, Users } from "lucide-react";
import FadeIn from "@/components/motion/FadeIn";
import EmptyState from "@/components/ui/EmptyState";

const PAGE_SIZE = 20;

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tier?: string; page?: string }>;
}) {
  const projectId = await getProjectId();
  const { q, tier, page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1", 10));

  const where: Prisma.CustomerWhereInput = { ...projectFilter(projectId) };

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }

  const tierFilter: Record<string, Prisma.CustomerWhereInput> = {
    VIP: { totalOrders: { gte: 10 } },
    Active: { totalOrders: { gte: 5, lt: 10 } },
    New: { totalOrders: { lt: 5 } },
  };
  if (tier && tierFilter[tier]) Object.assign(where, tierFilter[tier]);

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { totalSpent: "desc" },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.customer.count({ where }),
  ]);

  return (
    <FadeIn direction="up" delay={0.1}>
      <div className="space-y-6">
      <ChitiPageHeader
        title="Customers"
        description="View and manage your customer base."
        actions={
          <div className="flex items-center gap-2">
            <a href="/api/export?entity=customers">
              <ChitiButton variant="secondary" size="sm" icon={<Download className="w-4 h-4" />}>Export CSV</ChitiButton>
            </a>
            <details className="relative">
              <summary className="list-none">
                <ChitiButton size="sm" icon={<Plus className="w-4 h-4" />}>New Customer</ChitiButton>
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
                  <ChitiButton type="submit" className="w-full">Create Customer</ChitiButton>
                </form>
              </div>
            </details>
          </div>
        }
      />

      <div className="flex items-center gap-3">
        <div className="flex-1 max-w-sm">
          <SearchBar placeholder="Search by name, phone, or email..." />
        </div>
        <FilterSelect param="tier" options={[{ value: "VIP", label: "VIP" }, { value: "Active", label: "Active" }, { value: "New", label: "New" }]} placeholder="All Tiers" />
      </div>

      {customers.length === 0 && (
        <EmptyState icon={Users} title="No customers found" description="Try adjusting your search or filter criteria." />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {customers.map((customer) => {
          const initials = (customer.name || "?").split(" ").map(n => n[0]).join("");
          const status = customer.totalOrders >= 10 ? "VIP" : customer.totalOrders >= 5 ? "Active" : "New";
          return (
            <div key={customer.id} className="group bg-surface-1 border border-white/10 rounded-xl p-5 space-y-3 hover:border-white/20 transition-colors relative">
              <Link href={`/customers/${customer.id}`} className="absolute inset-0 z-0" />
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-primary/20 flex items-center justify-center">
                    <span className="text-sm text-brand-primary font-bold">{initials}</span>
                  </div>
                  <div>
                    <p className="text-sm text-text-main font-medium group-hover:text-brand-primary transition-colors">{customer.name}</p>
                    <p className="text-xs text-text-muted">{customer.phone || customer.email}</p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  status === "VIP" ? "bg-warning/10 text-warning" :
                  status === "New" ? "bg-info/10 text-info" :
                  "bg-success/10 text-success"
                }`}>{status}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5 relative z-10">
                <div>
                  <p className="text-xs text-text-muted">Orders</p>
                  <p className="text-sm text-text-main font-medium">{customer.totalOrders}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Total Spent</p>
                  <p className="text-sm text-text-main font-medium">₹{Number(customer.totalSpent).toLocaleString("en-IN")}</p>
                </div>
              </div>
              <div className="relative z-10 flex justify-end">
                <form action={deleteCustomer.bind(null, customer.id)}>
                  <button type="submit" className="text-text-muted hover:text-error transition-colors p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </div>

      <PaginationBar total={total} pageSize={PAGE_SIZE} />
    </div>
    </FadeIn>
  );
}
