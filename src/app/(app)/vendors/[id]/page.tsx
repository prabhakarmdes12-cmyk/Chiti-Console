import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, CreditCard, FileCheck, Wallet } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { verifyProjectAccess } from "@/lib/db/queries";
import ChitiPageHeader from "@/components/ui/ChitiPageHeader";
import ChitiCard from "@/components/ui/ChitiCard";
import ChitiStatusBadge from "@/components/ui/ChitiStatusBadge";
import { updateVendorStatus, updateVendorDocumentStatus, upsertVendorBankAccount } from "@/lib/actions/vendors";

function money(value: unknown) {
  return Number(value || 0).toLocaleString("en-IN");
}

export default async function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vendor = await prisma.vendor.findUnique({
    where: { id },
    include: {
      bankAccount: true,
      wallet: { include: { transactions: { orderBy: { createdAt: "desc" }, take: 5 } } },
      payouts: { orderBy: { createdAt: "desc" }, take: 10 },
      listings: { orderBy: { updatedAt: "desc" } },
      enquiries: { orderBy: { updatedAt: "desc" }, take: 10 },
      orders: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  if (!vendor || !(await verifyProjectAccess(vendor.projectId))) notFound();
  const documents = Array.isArray(vendor.documents) ? (vendor.documents as any[]) : [];
  const totalRevenue = vendor.orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
  const totalCommission = vendor.orders.reduce((sum, order) => sum + Number(order.commissionAmount), 0);

  return (
    <div className="space-y-6">
      <Link href="/vendors" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-main transition-colors">
        <ArrowLeft className="w-4 h-4" /> Vendors
      </Link>
      <ChitiPageHeader title={vendor.businessName} description={`${vendor.category.replace("_", " ")} partner in ${vendor.district}`} />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        <ChitiCard padding="md" glass glow className="xl:col-span-2">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <p className="text-xs label-caps tracking-widest text-brand-primary mb-2">Vendor Profile</p>
              <h2 className="text-xl font-display font-semibold text-text-main">{vendor.ownerName}</h2>
              <p className="text-sm text-text-muted">{vendor.phone}{vendor.email ? ` · ${vendor.email}` : ""}</p>
            </div>
            <ChitiStatusBadge status={vendor.status} />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            <div><p className="text-text-muted text-xs">Revenue</p><p className="text-text-main font-bold">₹{money(totalRevenue)}</p></div>
            <div><p className="text-text-muted text-xs">Commission</p><p className="text-success font-bold">₹{money(totalCommission)}</p></div>
            <div><p className="text-text-muted text-xs">Listings</p><p className="text-text-main font-bold">{vendor.listings.length}</p></div>
            <div><p className="text-text-muted text-xs">Enquiries</p><p className="text-text-main font-bold">{vendor.enquiries.length}</p></div>
          </div>
          {vendor.address && <p className="mt-4 text-sm text-text-muted">{vendor.address}</p>}
        </ChitiCard>

        <ChitiCard padding="md" glass>
          <div className="flex items-center gap-2 mb-4"><Wallet className="w-4 h-4 text-brand-primary" /><h2 className="text-sm font-medium text-text-main">Wallet</h2></div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-text-muted">Available</span><span className="text-text-main font-bold">₹{money(vendor.wallet?.balance)}</span></div>
            <div className="flex justify-between"><span className="text-text-muted">Pending</span><span className="text-warning font-bold">₹{money(vendor.wallet?.pendingBalance)}</span></div>
            <div className="flex justify-between"><span className="text-text-muted">Earned</span><span className="text-success font-bold">₹{money(vendor.wallet?.totalEarned)}</span></div>
            <div className="flex justify-between"><span className="text-text-muted">Withdrawn</span><span className="text-text-main font-bold">₹{money(vendor.wallet?.totalWithdrawn)}</span></div>
          </div>
        </ChitiCard>

        <ChitiCard padding="md" glass>
          <div className="flex items-center gap-2 mb-4"><Building2 className="w-4 h-4 text-brand-primary" /><h2 className="text-sm font-medium text-text-main">Actions</h2></div>
          <div className="grid grid-cols-2 gap-2">
            <form action={updateVendorStatus.bind(null, vendor.id, "ACTIVE")}><button className="w-full px-3 py-2 rounded-lg bg-success/10 text-success text-sm">Approve</button></form>
            <form action={updateVendorStatus.bind(null, vendor.id, "PENDING")}><button className="w-full px-3 py-2 rounded-lg bg-warning/10 text-warning text-sm">Review</button></form>
            <form action={updateVendorStatus.bind(null, vendor.id, "SUSPENDED")} className="col-span-2 flex gap-2"><input name="reason" placeholder="Suspend reason" className="min-w-0 flex-1 px-3 py-2 rounded-lg bg-surface-2/60 border border-white/10 text-sm" /><button className="px-3 py-2 rounded-lg bg-error/10 text-error text-sm">Suspend</button></form>
            <form action={updateVendorStatus.bind(null, vendor.id, "REJECTED")} className="col-span-2 flex gap-2"><input name="reason" placeholder="Reject reason" className="min-w-0 flex-1 px-3 py-2 rounded-lg bg-surface-2/60 border border-white/10 text-sm" /><button className="px-3 py-2 rounded-lg bg-error/10 text-error text-sm">Reject</button></form>
          </div>
        </ChitiCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChitiCard padding="md" glass>
          <div className="flex items-center gap-2 mb-4"><FileCheck className="w-4 h-4 text-brand-primary" /><h2 className="text-sm font-medium text-text-main">KYC Documents</h2></div>
          <div className="space-y-3">
            {documents.length === 0 && <p className="text-sm text-text-muted">No documents uploaded.</p>}
            {documents.map((doc, index) => (
              <div key={`${doc.name}-${index}`} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg bg-surface-2/30 p-3">
                <div><p className="text-sm text-text-main font-medium">{doc.name}</p><p className="text-xs text-text-muted">{doc.status}</p></div>
                <form action={updateVendorDocumentStatus.bind(null, vendor.id)} className="flex gap-2">
                  <input type="hidden" name="index" value={index} />
                  <select name="status" defaultValue={doc.status} className="px-2 py-1 rounded-md bg-surface-2 border border-white/10 text-xs text-text-main">
                    <option value="verified">verified</option>
                    <option value="pending">pending</option>
                    <option value="rejected">rejected</option>
                    <option value="not_uploaded">not_uploaded</option>
                  </select>
                  <button className="px-3 py-1 rounded-md bg-brand-primary text-white text-xs">Save</button>
                </form>
              </div>
            ))}
          </div>
        </ChitiCard>

        <ChitiCard padding="md" glass>
          <div className="flex items-center gap-2 mb-4"><CreditCard className="w-4 h-4 text-brand-primary" /><h2 className="text-sm font-medium text-text-main">Bank Account</h2></div>
          <form action={upsertVendorBankAccount.bind(null, vendor.id)} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input name="accountHolder" defaultValue={vendor.bankAccount?.accountHolder || vendor.ownerName} placeholder="Account holder" className="px-3 py-2 rounded-lg bg-surface-2/60 border border-white/10 text-sm" required />
            <input name="bankName" defaultValue={vendor.bankAccount?.bankName || ""} placeholder="Bank name" className="px-3 py-2 rounded-lg bg-surface-2/60 border border-white/10 text-sm" />
            <input name="accountNumber" defaultValue={vendor.bankAccount?.accountNumber || ""} placeholder="Account number" className="px-3 py-2 rounded-lg bg-surface-2/60 border border-white/10 text-sm" />
            <input name="ifscCode" defaultValue={vendor.bankAccount?.ifscCode || ""} placeholder="IFSC" className="px-3 py-2 rounded-lg bg-surface-2/60 border border-white/10 text-sm" />
            <input name="upiId" defaultValue={vendor.bankAccount?.upiId || ""} placeholder="UPI ID" className="px-3 py-2 rounded-lg bg-surface-2/60 border border-white/10 text-sm" />
            <label className="flex items-center gap-2 text-sm text-text-muted"><input name="isVerified" type="checkbox" defaultChecked={vendor.bankAccount?.isVerified || false} className="accent-brand-primary" /> Verified</label>
            <button className="sm:col-span-2 px-4 py-2 rounded-lg bg-brand-primary text-white text-sm font-medium">Save Bank Details</button>
          </form>
        </ChitiCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Section title="Listings" items={vendor.listings.map((l) => [l.name, `${l.type} · ${l.status}`])} />
        <Section title="Recent Enquiries" items={vendor.enquiries.map((e) => [e.customerName, `${e.type} · ${e.status}`])} />
        <Section title="Recent Payouts" items={vendor.payouts.map((p) => [`₹${money(p.amount)}`, `${p.status} · ${p.scheduledFor?.toLocaleDateString("en-IN") || "unscheduled"}`])} />
      </div>
    </div>
  );
}

function Section({ title, items }: { title: string; items: [string, string][] }) {
  return (
    <ChitiCard padding="md" glass>
      <h2 className="text-sm font-medium text-text-main mb-4">{title}</h2>
      <div className="space-y-3">
        {items.length === 0 && <p className="text-sm text-text-muted">No records yet.</p>}
        {items.map(([primary, secondary], index) => (
          <div key={`${primary}-${index}`} className="rounded-lg bg-surface-2/30 p-3">
            <p className="text-sm text-text-main font-medium">{primary}</p>
            <p className="text-xs text-text-muted">{secondary}</p>
          </div>
        ))}
      </div>
    </ChitiCard>
  );
}
