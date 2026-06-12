import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import ChitiButton from "@/components/ui/ChitiButton";
import { createProduct, deleteProduct } from "@/lib/actions/products";
import Link from "next/link";
import { Plus, Trash2, ExternalLink, Download } from "lucide-react";

export default async function ProjectProductsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) notFound();

  const products = await prisma.product.findMany({
    where: { projectId: id },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-muted">{products.length} products</p>
        <div className="flex items-center gap-2">
          <a href={`/api/export?entity=products`}>
            <ChitiButton variant="secondary" size="sm" icon={<Download className="w-4 h-4" />}>CSV</ChitiButton>
          </a>
          <details className="relative">
            <summary className="list-none">
              <ChitiButton size="sm" icon={<Plus className="w-4 h-4" />}>New</ChitiButton>
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
                <ChitiButton type="submit" className="w-full">Create</ChitiButton>
              </form>
            </div>
          </details>
        </div>
      </div>

      {products.length === 0 && (
        <div className="bg-surface-1 border border-white/10 rounded-xl p-12 text-center">
          <p className="text-text-muted text-sm mb-2">No products yet</p>
          <p className="text-text-muted/60 text-xs">Create your first product using the &quot;New&quot; button above.</p>
        </div>
      )}
      {products.length > 0 && <div className="bg-surface-1 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-text-muted">
              <th className="text-left p-3 font-medium">Product</th>
              <th className="text-left p-3 font-medium">SKU</th>
              <th className="text-left p-3 font-medium">Category</th>
              <th className="text-left p-3 font-medium">Price</th>
              <th className="text-left p-3 font-medium">Stock</th>
              <th className="text-right p-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const isLow = (product.stock ?? 0) <= (product.lowStockThreshold ?? 5) && (product.stock ?? 0) > 0;
              const isOut = (product.stock ?? 0) === 0;
              return (
                <tr key={product.id} className="border-b border-white/5 last:border-0 hover:bg-surface-2 transition-colors">
                  <td className="p-3">
                    <Link href={`/products/${product.id}`} className="font-medium text-text-main hover:text-brand-primary flex items-center gap-1.5">
                      {product.name}<ExternalLink className="w-3 h-3 text-text-muted" />
                    </Link>
                  </td>
                  <td className="p-3 text-text-muted font-mono text-xs">{product.sku || "—"}</td>
                  <td className="p-3 text-text-muted">{product.category || "—"}</td>
                  <td className="p-3 text-text-main">₹{Number(product.price).toLocaleString("en-IN")}</td>
                  <td className="p-3">
                    <span className={`text-xs font-medium ${isOut ? "text-error" : isLow ? "text-warning" : "text-success"}`}>
                      {isOut ? "OOS" : `${product.stock}`}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <form action={deleteProduct.bind(null, product.id)}>
                      <button type="submit" className="text-text-muted hover:text-error"><Trash2 className="w-3.5 h-3.5" /></button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>}
    </div>
  );
}
