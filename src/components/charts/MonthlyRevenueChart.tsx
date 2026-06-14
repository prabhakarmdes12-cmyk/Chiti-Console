"use client";

import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from "recharts";

interface MonthlyData {
  month: string;
  revenue: number;
  orders: number;
}

export default function MonthlyRevenueChart({ data }: { data: MonthlyData[] }) {
  if (data.length === 0) {
    return <p className="text-text-muted text-sm text-center py-8">No data yet</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(260, 100%, 65%)" stopOpacity={0.35} />
            <stop offset="60%" stopColor="hsl(260, 100%, 65%)" stopOpacity={0.08} />
            <stop offset="100%" stopColor="hsl(260, 100%, 65%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(220,10%,65%)" }} axisLine={false} tickLine={false} dy={8} />
        <YAxis tick={{ fontSize: 12, fill: "hsl(220,10%,65%)" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} />
        <Tooltip
          contentStyle={{ background: "hsla(220,10%,8%,0.85)", backdropFilter: "blur(12px)", border: "1px solid hsla(260,100%,65%,0.2)", borderRadius: "8px", fontSize: "13px" }}
          labelStyle={{ color: "hsl(0,0%,98%)" }}
          formatter={(value: unknown) => [`₹${Number(value ?? 0).toLocaleString("en-IN")}`, "Revenue"]}
        />
        <Area type="monotone" dataKey="revenue" stroke="hsl(260, 100%, 65%)" strokeWidth={2} fill="url(#revenueGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
