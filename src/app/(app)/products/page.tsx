import { prisma } from "@/lib/db/prisma";
import { getProjectId, projectFilter } from "@/lib/db/queries";
import ChitiPageHeader from "@/components/ui/ChitiPageHeader";
import ChitiButton from "@/components/ui/ChitiButton";
import SearchBar from "@/components/ui/SearchBar";
import FilterSelect from "@/components/ui/FilterSelect";
import PaginationBar from "@/components/ui/PaginationBar";
import { createProduct, deleteProduct } from "@/lib/actions/products";
import Link from "next/link";
import { Plus, Trash2, ExternalLink, Download, Package } from "lucide-react";
import FadeIn from "@/components/motion/FadeIn";
import EmptyState from "@/components/ui/EmptyState";

const PAGE_SIZE = 20;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; stock?: string; page?: string }>;
}) {
  const projectId = await getProjectId();
  const { q, stock, page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1", 10));

  const where: Record<string, unknown> = { ...projectFilter(projectId) };

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { sku: { contains: q, mode: "insensitive" } },
      { category: { contains: q, mode: "insensitive" } },
    ];
  }
  if (stock === "low") where.stock = { gt: 0, lte: 5 };
  if (stock === "out") where.stock = 0;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ]);

  return (
    <FadeIn direction="up" delay={0.1}>
      <div className="space-y-6">
      <ChitiPageHeader
        title="Products"
        description="Inventory and product catalog."
        actions={
          <div className="flex items-center gap-2">
            <a href="/api/export?entity=products">
              <ChitiButton variant="secondary" size="sm" icon={<Download className="w-4 h-4" />}>Export CSV</ChitiButton>
            </a>
            <details className="relative">
              <summary className="list-none">
                <ChitiButton size="sm" icon={<Plus className="w-4 h-4" />}>New Product</ChitiButton>
              </summary>
              <div className="absolute right-0 top-10 w-72 bg-surface-1 border border-white/10 rounded-xl p-4 shadow-2xl z-10">
                <form action={createProduct} className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-xs text-text-muted">Name</label>
                    <input name="name" required className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="block text-xs text-text-muted">SKU</label>
                      <input name="sku" className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs text-text-muted">Category</label>
                      <input name="category" className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="block text-xs text-text-muted">Price (₹)</label>
                      <input name="price" type="number" step="0.01" required className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs text-text-muted">Stock</label>
                      <input name="stock" type="number" defaultValue="0" className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm" />
                    </div>
                  </div>
                  <ChitiButton type="submit" className="w-full">Create Product</ChitiButton>
                </form>
              </div>
            </details>
          </div>
        }
      />

      <div className="flex items-center gap-3">
        <div className="flex-1 max-w-sm">
          <SearchBar placeholder="Search by name, SKU, or category..." />
        </div>
        <FilterSelect param="stock" options={[{ value: "low", label: "Low Stock" }, { value: "out", label: "Out of Stock" }]} placeholder="All Stock" />
      </div>

      <div className="bg-surface-1 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-text-muted">
              <th className="text-left p-4 font-medium">Product</th>
              <th className="text-left p-4 font-medium">SKU</th>
              <th className="text-left p-4 font-medium">Category</th>
              <th className="text-left p-4 font-medium">Price</th>
              <th className="text-left p-4 font-medium">Stock</th>
              <th className="text-right p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center">
                <EmptyState icon={Package} title="No products found" description="Try adjusting your search or filter criteria." />
              </td></tr>
            )}
            {products.map((product) => {
              const isLow = (product.stock ?? 0) <= (product.lowStockThreshold ?? 5) && (product.stock ?? 0) > 0;
              const isOut = (product.stock ?? 0) === 0;
              return (
                <tr key={product.id} className="border-b border-white/5 last:border-0 hover:bg-surface-2 transition-colors">
                  <td className="p-4">
                    <Link href={`/products/${product.id}`} className="font-medium text-text-main hover:text-brand-primary transition-colors flex items-center gap-1.5">
                      {product.name}
                      <ExternalLink className="w-3 h-3 text-text-muted" />
                    </Link>
                  </td>
                  <td className="p-4 text-text-muted font-mono text-xs">{product.sku || "—"}</td>
                  <td className="p-4 text-text-muted">{product.category || "—"}</td>
                  <td className="p-4 text-text-main">₹{Number(product.price).toLocaleString("en-IN")}</td>
                  <td className="p-4">
                    <span className={`text-xs font-medium ${isOut ? "text-error" : isLow ? "text-warning" : "text-success"}`}>
                      {isOut ? "Out of Stock" : `${product.stock} units`}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <form action={deleteProduct.bind(null, product.id)}>
                      <button type="submit" className="text-text-muted hover:text-error transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <PaginationBar total={total} pageSize={PAGE_SIZE} />
      </div>
    </div>
    </FadeIn>
  );
}
