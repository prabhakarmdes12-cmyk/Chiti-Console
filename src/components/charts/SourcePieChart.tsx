"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface SourceData {
  name: string;
  value: number;
  color: string;
}

export default function SourcePieChart({ data }: { data: SourceData[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

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
          contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "13px" }}
          formatter={(value: any) => [`${value} (${((value / total) * 100).toFixed(1)}%)`, ""]}
        />
        <Legend
          formatter={(value: string) => <span style={{ color: "#888", fontSize: "12px" }}>{value.replace(/_/g, " ")}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
