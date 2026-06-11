import { prisma } from "@/lib/db/prisma";
import { getProjectId } from "@/lib/db/queries";
import ChitiPageHeader from "@/components/ui/ChitiPageHeader";

export default async function ProductsPage() {
  const projectId = await getProjectId();
  const products = await prisma.product.findMany({
    where: { projectId },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <ChitiPageHeader title="Products" description="Inventory and product catalog." />

      <div className="bg-surface-1 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-text-muted">
              <th className="text-left p-4 font-medium">Product</th>
              <th className="text-left p-4 font-medium">SKU</th>
              <th className="text-left p-4 font-medium">Category</th>
              <th className="text-left p-4 font-medium">Price</th>
              <th className="text-left p-4 font-medium">Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-text-muted text-sm">No products found</td></tr>
            )}
            {products.map((product) => {
              const isLow = (product.stock ?? 0) <= (product.lowStockThreshold ?? 5) && (product.stock ?? 0) > 0;
              const isOut = (product.stock ?? 0) === 0;
              return (
                <tr key={product.id} className="border-b border-white/5 last:border-0 hover:bg-surface-2 transition-colors">
                  <td className="p-4 font-medium text-text-main">{product.name}</td>
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
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
