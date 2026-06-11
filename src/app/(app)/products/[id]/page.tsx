import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getProjectId, projectFilter } from "@/lib/db/queries";
import ChitiCard from "@/components/ui/ChitiCard";
import ChitiPageHeader from "@/components/ui/ChitiPageHeader";
import ChitiButton from "@/components/ui/ChitiButton";
import { updateProduct, deleteProduct, adjustStock } from "@/lib/actions/products";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projectId = await getProjectId();
  const product = await prisma.product.findFirst({
    where: { id, ...projectFilter(projectId) },
    include: { stockMovements: { orderBy: { createdAt: "desc" }, take: 20 } },
  });

  if (!product) notFound();

  const isLow = (product.stock ?? 0) <= (product.lowStockThreshold ?? 5) && (product.stock ?? 0) > 0;
  const isOut = (product.stock ?? 0) === 0;

  return (
    <div className="space-y-6">
      <ChitiPageHeader
        title={product.name}
        description={`SKU: ${product.sku || "—"} | Category: ${product.category || "—"}`}
        actions={
          <Link href="/products">
            <ChitiButton variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>Back</ChitiButton>
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <ChitiCard>
            <h3 className="text-sm font-medium text-text-muted mb-3">Stock Movements</h3>
            {product.stockMovements.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-4">No stock movements recorded</p>
            ) : (
              <div className="space-y-2">
                {product.stockMovements.map((m) => (
                  <div key={m.id} className="flex items-center justify-between text-sm py-1.5 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                        m.type === "IN" ? "bg-success/10 text-success"
                        : m.type === "OUT" ? "bg-error/10 text-error"
                        : "bg-warning/10 text-warning"
                      }`}>{m.type}</span>
                      <span className="text-text-muted text-xs">{new Date(m.createdAt).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-text-main font-medium">{m.type === "OUT" ? "-" : "+"}{m.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ChitiCard>

          <ChitiCard>
            <h3 className="text-sm font-medium text-text-muted mb-3">Adjust Stock</h3>
            <form action={async (formData: FormData) => {
              "use server";
              const qty = parseInt(formData.get("quantity") as string);
              const type = formData.get("type") as "IN" | "OUT" | "ADJUSTMENT";
              await adjustStock(product.id, qty, type);
            }} className="flex items-end gap-3">
              <div className="flex-1 space-y-1">
                <label className="block text-xs text-text-muted">Type</label>
                <select name="type" className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm">
                  <option value="IN">Stock In</option>
                  <option value="OUT">Stock Out</option>
                  <option value="ADJUSTMENT">Set Exact</option>
                </select>
              </div>
              <div className="flex-1 space-y-1">
                <label className="block text-xs text-text-muted">Quantity</label>
                <input name="quantity" type="number" min="0" required className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm" />
              </div>
              <ChitiButton type="submit" size="sm">Apply</ChitiButton>
            </form>
          </ChitiCard>

          <ChitiCard>
            <h3 className="text-sm font-medium text-text-muted mb-3">Edit Product</h3>
            <form action={updateProduct.bind(null, product.id)} className="grid grid-cols-2 gap-3">
              <div className="space-y-1 col-span-2">
                <label className="block text-xs text-text-muted">Name</label>
                <input name="name" defaultValue={product.name} className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm" />
              </div>
              <div className="space-y-1">
                <label className="block text-xs text-text-muted">SKU</label>
                <input name="sku" defaultValue={product.sku || ""} className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm" />
              </div>
              <div className="space-y-1">
                <label className="block text-xs text-text-muted">Category</label>
                <input name="category" defaultValue={product.category || ""} className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm" />
              </div>
              <div className="space-y-1">
                <label className="block text-xs text-text-muted">Price (₹)</label>
                <input name="price" type="number" step="0.01" defaultValue={Number(product.price)} className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm" />
              </div>
              <div className="space-y-1">
                <label className="block text-xs text-text-muted">Low Stock Threshold</label>
                <input name="lowStockThreshold" type="number" defaultValue={product.lowStockThreshold ?? 5} className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm" />
              </div>
              <div className="col-span-2 flex justify-end gap-2 pt-2">
                <form action={deleteProduct.bind(null, product.id)}>
                  <ChitiButton type="submit" variant="ghost" icon={<Trash2 className="w-4 h-4" />}>Delete</ChitiButton>
                </form>
                <ChitiButton type="submit">Save Changes</ChitiButton>
              </div>
            </form>
          </ChitiCard>
        </div>

        <div className="space-y-4">
          <ChitiCard>
            <h3 className="text-sm font-medium text-text-muted mb-3">Product Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Price</span>
                <span className="text-text-main font-medium">₹{Number(product.price).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Stock</span>
                <span className={`font-medium ${isOut ? "text-error" : isLow ? "text-warning" : "text-success"}`}>
                  {isOut ? "Out of Stock" : `${product.stock} units`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Status</span>
                <span className={`text-xs font-medium ${product.isActive ? "text-success" : "text-error"}`}>
                  {product.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </ChitiCard>
        </div>
      </div>
    </div>
  );
}
