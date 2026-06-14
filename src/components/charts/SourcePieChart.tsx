"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface SourceData {
  name: string;
  value: number;
  color: string;
}

export default function SourcePieChart({ data }: { data: SourceData[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return <p className="text-text-muted text-sm text-center py-8">No data yet</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={4}
          dataKey="value"
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: "hsla(220,10%,8%,0.85)", backdropFilter: "blur(12px)", border: "1px solid hsla(260,100%,65%,0.2)", borderRadius: "8px", fontSize: "13px" }}
          formatter={(value: unknown) => [`${value ?? 0} (${(Number(value ?? 0) / total * 100).toFixed(1)}%)`, ""]}
        />
        <Legend
          formatter={(value: string) => <span style={{ color: "hsl(220,10%,65%)", fontSize: "12px" }}>{value.replace(/_/g, " ")}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
