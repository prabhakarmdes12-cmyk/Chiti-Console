"use client";

import { useState } from "react";
import { createExpense } from "@/lib/actions/finance";
import { Plus, X } from "lucide-react";

const categories = [
  "OPERATIONS",
  "MARKETING",
  "HOSTING",
  "TOOLS",
  "SALARY",
  "OTHER",
];

export default function AddExpenseForm() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 m-3 rounded-lg bg-surface-2 text-sm text-text-main font-medium hover:bg-surface-3 border border-white/10 hover:border-white/20 transition-all"
      >
        <Plus className="w-4 h-4" />
        Add Expense
      </button>
    );
  }

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-text-main">New Expense</h3>
        <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-2 transition-all">
          <X className="w-4 h-4" />
        </button>
      </div>
      <form action={async (formData) => {
        await createExpense(formData);
        setOpen(false);
      }} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs text-text-muted font-medium">Description</label>
            <input
              name="description"
              required
              className="w-full px-3 py-2.5 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm placeholder:text-text-muted/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-transparent transition-all"
              placeholder="e.g. Domain renewal"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs text-text-muted font-medium">Category</label>
            <select
              name="category"
              required
              className="w-full px-3 py-2.5 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-transparent transition-all"
            >
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs text-text-muted font-medium">Amount (₹)</label>
            <input
              name="amount"
              type="number"
              step="0.01"
              min="0"
              required
              className="w-full px-3 py-2.5 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm placeholder:text-text-muted/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-transparent transition-all"
              placeholder="0.00"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs text-text-muted font-medium">Date</label>
            <input
              name="date"
              type="date"
              required
              defaultValue={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2.5 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-transparent transition-all"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg gradient-brand text-white text-sm font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
          >
            Save Expense
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-5 py-2.5 rounded-lg border border-white/10 text-text-muted hover:text-text-main text-sm transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
