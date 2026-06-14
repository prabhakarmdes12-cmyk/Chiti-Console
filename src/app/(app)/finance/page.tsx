import { prisma } from "@/lib/db/prisma";
import { getProjectId, projectFilter } from "@/lib/db/queries";
import ChitiPageHeader from "@/components/ui/ChitiPageHeader";
import ChitiCard from "@/components/ui/ChitiCard";
import ProfitLossChart from "@/components/charts/ProfitLossChart";
import AddExpenseForm from "@/components/finance/AddExpenseForm";
import { deleteExpense, updateInvoiceStatus } from "@/lib/actions/finance";
import { Trash2, ArrowRight, Receipt, CreditCard, TrendingUp, Wallet } from "lucide-react";
import FadeIn from "@/components/motion/FadeIn";
import Link from "next/link";

const tabs = [
  { key: "invoices", label: "Invoices", icon: Receipt },
  { key: "expenses", label: "Expenses", icon: CreditCard },
  { key: "pnl", label: "P&L", icon: TrendingUp },
];

export default async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const activeTab = tab && tabs.some((t) => t.key === tab) ? tab : "invoices";
  const projectId = await getProjectId();

  return (
    <div className="space-y-6">
      <ChitiPageHeader
        title="Finance"
        description="Invoices, expenses, and profit & loss."
      />

      {/* Premium Tab Bar */}
      <div className="bg-surface-1 border border-white/10 rounded-xl p-1.5 flex items-center gap-1 w-fit">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          return (
            <Link
              key={t.key}
              href={`/finance?tab=${t.key}`}
              className={`relative flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "text-white gradient-brand shadow-lg shadow-purple-500/20"
                  : "text-text-muted hover:text-text-main hover:bg-surface-2"
              }`}
            >
              {isActive && <div className="absolute inset-0 rounded-lg gradient-brand opacity-100" />}
              <Icon className="w-4 h-4 relative z-10" />
              <span className="relative z-10">{t.label}</span>
            </Link>
          );
        })}
      </div>

      {activeTab === "invoices" && <InvoicesTab projectId={projectId} />}
      {activeTab === "expenses" && <ExpensesTab projectId={projectId} />}
      {activeTab === "pnl" && <PnLTab projectId={projectId} />}
    </div>
  );
}

async function InvoicesTab({ projectId }: { projectId: string | null }) {
  const invoices = await prisma.invoice.findMany({
    where: projectFilter(projectId),
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { order: { select: { orderNumber: true, customer: { select: { name: true } } } } },
  });

  const badgeStyles: Record<string, string> = {
    DRAFT: "bg-surface-2 text-text-muted",
    SENT: "bg-warning/10 text-warning",
    PAID: "bg-success/10 text-success",
    CANCELLED: "bg-error/10 text-error",
  };

  return (
    <FadeIn direction="up" delay={0.1}>
      <ChitiCard padding="sm" glass hover>
      {invoices.length === 0 ? (
        <div className="py-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-surface-2 flex items-center justify-center mx-auto mb-3">
            <Receipt className="w-6 h-6 text-text-muted/40" />
          </div>
          <p className="text-sm text-text-muted mb-1">No invoices yet</p>
          <p className="text-xs text-text-muted/60">Generate one from an order detail page</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-4 text-xs font-medium text-text-muted uppercase tracking-wider">Invoice</th>
                <th className="text-left p-4 text-xs font-medium text-text-muted uppercase tracking-wider">Order</th>
                <th className="text-left p-4 text-xs font-medium text-text-muted uppercase tracking-wider">Customer</th>
                <th className="text-left p-4 text-xs font-medium text-text-muted uppercase tracking-wider">Amount</th>
                <th className="text-left p-4 text-xs font-medium text-text-muted uppercase tracking-wider">Status</th>
                <th className="text-left p-4 text-xs font-medium text-text-muted uppercase tracking-wider">Date</th>
                <th className="text-right p-4 text-xs font-medium text-text-muted uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-white/5 last:border-0 hover:bg-surface-2/40 transition-colors">
                  <td className="p-4">
                    <span className="font-medium text-text-main">{inv.invoiceNumber}</span>
                  </td>
                  <td className="p-4 text-text-muted">{inv.order?.orderNumber || "—"}</td>
                  <td className="p-4 text-text-main">{inv.order?.customer?.name || "—"}</td>
                  <td className="p-4 font-medium text-text-main">₹{Number(inv.totalAmount).toLocaleString("en-IN")}</td>
                  <td className="p-4">
                    <form action={updateInvoiceStatus.bind(null, inv.id, inv.status === "DRAFT" ? "SENT" : inv.status === "SENT" ? "PAID" : "DRAFT")}>
                      <button type="submit" className="text-left">
                        <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${badgeStyles[inv.status] || "bg-surface-2 text-text-muted"}`}>{inv.status}</span>
                      </button>
                    </form>
                  </td>
                  <td className="p-4 text-text-muted text-xs">{inv.createdAt.toLocaleDateString("en-IN")}</td>
                  <td className="p-4 text-right">
                    {inv.orderId && (
                      <Link href={`/orders/${inv.orderId}`} className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-brand-primary transition-colors">
                        View <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </ChitiCard>
    </FadeIn>
  );
}

async function ExpensesTab({ projectId }: { projectId: string | null }) {
  const expenses = await prisma.expense.findMany({
    where: projectFilter(projectId),
    orderBy: { date: "desc" },
    take: 50,
  });

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <FadeIn direction="up" delay={0.1}>
      <div className="space-y-4">
      <ChitiCard padding="sm" glass hover>
        <AddExpenseForm />
      </ChitiCard>

      <ChitiCard padding="sm" glass hover>
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <h3 className="text-sm font-medium text-text-main">All Expenses</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">Total:</span>
            <span className="text-sm font-bold text-text-main">₹{totalExpenses.toLocaleString("en-IN")}</span>
          </div>
        </div>
        {expenses.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-surface-2 flex items-center justify-center mx-auto mb-3">
              <CreditCard className="w-6 h-6 text-text-muted/40" />
            </div>
            <p className="text-sm text-text-muted">No expenses recorded yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left p-4 text-xs font-medium text-text-muted uppercase tracking-wider">Description</th>
                  <th className="text-left p-4 text-xs font-medium text-text-muted uppercase tracking-wider">Category</th>
                  <th className="text-left p-4 text-xs font-medium text-text-muted uppercase tracking-wider">Amount</th>
                  <th className="text-left p-4 text-xs font-medium text-text-muted uppercase tracking-wider">Date</th>
                  <th className="text-right p-4 text-xs font-medium text-text-muted uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp.id} className="border-b border-white/5 last:border-0 hover:bg-surface-2/40 transition-colors">
                    <td className="p-4 text-text-main">{exp.description}</td>
                    <td className="p-4">
                      <span className="inline-flex text-xs text-text-muted bg-surface-2 px-2.5 py-1 rounded-full">{exp.category}</span>
                    </td>
                    <td className="p-4 text-text-main font-medium">₹{Number(exp.amount).toLocaleString("en-IN")}</td>
                    <td className="p-4 text-text-muted text-xs">{exp.date.toLocaleDateString("en-IN")}</td>
                    <td className="p-4 text-right">
                      <form action={deleteExpense.bind(null, exp.id)}>
                        <button type="submit" className="text-text-muted hover:text-error transition-colors p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ChitiCard>
    </div>
      </FadeIn>
  );
}

async function PnLTab({ projectId }: { projectId: string | null }) {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [orders, expenses] = await Promise.all([
    prisma.order.findMany({
      where: { ...projectFilter(projectId), createdAt: { gte: sixMonthsAgo } },
      select: { totalAmount: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.expense.findMany({
      where: { ...projectFilter(projectId), date: { gte: sixMonthsAgo } },
      select: { amount: true, date: true },
      orderBy: { date: "asc" },
    }),
  ]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthly: Record<string, { revenue: number; expenses: number }> = {};

  for (const o of orders) {
    const key = `${monthNames[o.createdAt.getMonth()]} ${o.createdAt.getFullYear()}`;
    if (!monthly[key]) monthly[key] = { revenue: 0, expenses: 0 };
    monthly[key].revenue += Number(o.totalAmount);
  }
  for (const e of expenses) {
    const key = `${monthNames[e.date.getMonth()]} ${e.date.getFullYear()}`;
    if (!monthly[key]) monthly[key] = { revenue: 0, expenses: 0 };
    monthly[key].expenses += Number(e.amount);
  }

  const chartData = Object.entries(monthly).map(([month, d]) => ({ month, ...d }));

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const profit = totalRevenue - totalExpenses;
  const margin = totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(1) : "0.0";
  const isProfitable = profit >= 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, gradient: "from-emerald-500 to-teal-500", icon: TrendingUp },
          { label: "Total Expenses", value: `₹${totalExpenses.toLocaleString("en-IN")}`, gradient: "from-rose-500 to-pink-500", icon: CreditCard },
          { label: `Profit (${margin}% margin)`, value: `₹${profit.toLocaleString("en-IN")}`, gradient: isProfitable ? "from-emerald-500 to-teal-500" : "from-rose-500 to-pink-500", icon: Wallet },
        ].map((metric, i) => (
          <FadeIn key={metric.label} direction="up" delay={0.1 + i * 0.05} className="group relative bg-surface-1 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all duration-300">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs text-text-muted font-medium">{metric.label}</p>
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${metric.gradient} flex items-center justify-center shadow-lg opacity-80 group-hover:opacity-100 transition-opacity`}>
                <metric.icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className={`text-xl font-display font-bold ${isProfitable ? "text-success" : "text-error"}`}>{metric.value}</p>
          </FadeIn>
        ))}
      </div>

      <FadeIn direction="up" delay={0.3}>
        <ChitiCard padding="md" glass hover>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5 text-white" />
          </div>
          <h2 className="text-sm font-medium text-text-main">Revenue vs Expenses (6 months)</h2>
        </div>
        <ProfitLossChart data={chartData} />
      </ChitiCard>
      </FadeIn>
    </div>
  );
}
