"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function DashboardChart({
  data = [],
  xKey = "day",
  yKey = "visitor",
  lines = [{ key: "visitor", color: "#3b82f6" }],
}: {
  data?: any[];
  xKey?: string;
  yKey?: string;
  lines?: { key: string; color: string }[];
}) {
  return (
    <div className="h-[350px] w-full rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <h2 className="mb-6 text-xl font-semibold text-white">Visitor Analytics</h2>

  <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey={xKey} stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip />
          {lines.map((l) => (
            <Line key={l.key} type="monotone" dataKey={l.key} stroke={l.color} dot={false} strokeWidth={2} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}