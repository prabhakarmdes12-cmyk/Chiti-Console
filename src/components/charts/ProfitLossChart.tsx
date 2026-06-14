"use client";

import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend,
} from "recharts";

interface PLData {
  month: string;
  revenue: number;
  expenses: number;
}

export default function ProfitLossChart({ data }: { data: PLData[] }) {
  if (data.length === 0) {
    return <p className="text-text-muted text-sm text-center py-8">No data yet</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#888" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "#888" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} />
        <Tooltip
          contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "13px" }}
          labelStyle={{ color: "#e2e8f0" }}
          formatter={(value: any) => [
            `₹${Number(value ?? 0).toLocaleString("en-IN")}`,
          ]}
        />
        <Legend wrapperStyle={{ fontSize: "12px", color: "#888" }} />
        <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} name="Revenue" />
        <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" />
      </BarChart>
    </ResponsiveContainer>
  );
}
