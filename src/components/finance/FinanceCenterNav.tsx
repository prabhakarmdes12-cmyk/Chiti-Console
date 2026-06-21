import Link from "next/link";

const items = [
  { label: "Overview", href: "/finance" },
  { label: "Escrow", href: "/finance/escrow" },
  { label: "Wallets", href: "/finance/wallets" },
  { label: "Payouts", href: "/finance/payouts" },
  { label: "Refunds", href: "/finance/refunds" },
  { label: "Commissions", href: "/finance/commissions" },
];

export default function FinanceCenterNav() {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Link key={item.href} href={item.href} className="px-4 py-2 rounded-lg bg-surface-2/50 border border-white/10 text-sm text-text-muted hover:text-text-main hover:border-brand-primary/30 transition-colors">
          {item.label}
        </Link>
      ))}
    </div>
  );
}
