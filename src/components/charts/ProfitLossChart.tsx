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
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(220,10%,65%)" }} axisLine={false} tickLine={false} dy={8} />
        <YAxis tick={{ fontSize: 12, fill: "hsl(220,10%,65%)" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} />
        <Tooltip
          contentStyle={{ background: "hsla(220,10%,8%,0.85)", backdropFilter: "blur(12px)", border: "1px solid hsla(260,100%,65%,0.2)", borderRadius: "8px", fontSize: "13px" }}
          labelStyle={{ color: "hsl(0,0%,98%)" }}
          formatter={(value: any) => [`₹${Number(value ?? 0).toLocaleString("en-IN")}`]}
        />
        <Legend wrapperStyle={{ fontSize: "12px", color: "hsl(220,10%,65%)" }} />
        <Bar dataKey="revenue" fill="hsl(150, 80%, 40%)" radius={[4, 4, 0, 0]} name="Revenue" />
        <Bar dataKey="expenses" fill="hsl(350, 80%, 55%)" radius={[4, 4, 0, 0]} name="Expenses" />
      </BarChart>
    </ResponsiveContainer>
  );
}
