import { prisma } from "@/lib/db/prisma";
import { getProjectId } from "@/lib/db/queries";
import ChitiPageHeader from "@/components/ui/ChitiPageHeader";
import ChitiButton from "@/components/ui/ChitiButton";
import { createProduct, deleteProduct } from "@/lib/actions/products";
import Link from "next/link";
import { Plus, Trash2, ExternalLink } from "lucide-react";

export default async function ProductsPage() {
  const projectId = await getProjectId();
  const products = await prisma.product.findMany({
    where: { projectId },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <ChitiPageHeader
        title="Products"
        description="Inventory and product catalog."
        actions={
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
        }
      />

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
              <tr><td colSpan={6} className="p-8 text-center text-text-muted text-sm">No products found</td></tr>
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
                    <span className={`text-xs font-medium ${
                      isOut ? "text-error" : isLow ? "text-warning" : "text-success"
                    }`}>
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
      </div>
    </div>
  );
}
