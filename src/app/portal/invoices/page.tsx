import { getPortalSession } from "@/lib/auth/portal";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function PortalInvoicesPage() {
  const session = await getPortalSession();
  if (!session) redirect("/portal/login");

  const invoices = await prisma.invoice.findMany({
    where: { projectId: session.projectId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { order: { select: { orderNumber: true } } },
  });

  const badgeStyles: Record<string, string> = {
    DRAFT: "bg-surface-2 text-text-muted",
    SENT: "bg-warning/10 text-warning",
    PAID: "bg-success/10 text-success",
    CANCELLED: "bg-error/10 text-error",
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-display font-bold text-text-main">Invoices</h1>
        <p className="text-sm text-text-muted mt-1">Your invoices</p>
      </div>

      <div className="bg-surface-1 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-text-muted">
              <th className="text-left p-4 font-medium">Invoice</th>
              <th className="text-left p-4 font-medium">Order</th>
              <th className="text-left p-4 font-medium">Amount</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-left p-4 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-text-muted text-sm">No invoices yet</td></tr>
            )}
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-b border-white/5 last:border-0">
                <td className="p-4 text-text-main font-medium">{inv.invoiceNumber}</td>
                <td className="p-4 text-text-muted">{inv.order?.orderNumber || "—"}</td>
                <td className="p-4 text-text-main">₹{Number(inv.totalAmount).toLocaleString("en-IN")}</td>
                <td className="p-4">
                  <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${badgeStyles[inv.status] || "bg-surface-2 text-text-muted"}`}>{inv.status}</span>
                </td>
                <td className="p-4 text-text-muted">{inv.createdAt.toLocaleDateString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
