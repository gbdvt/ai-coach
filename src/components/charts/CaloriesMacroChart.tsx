"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type MacroChartRow = {
  date: string;
  label: string;
  actual: number | null;
  target: number | null;
};

type Props = {
  data: MacroChartRow[];
  /** When true, show chart if any day has actual or target (not requiring 2+ points). */
  allowSparse?: boolean;
};

export function CaloriesMacroChart({ data, allowSparse }: Props) {
  const chartData = data.map((row) => ({
    ...row,
    actual: row.actual ?? undefined,
    target: row.target ?? undefined,
  }));

  const points = data.filter((r) => r.actual != null || r.target != null).length;
  if (points === 0) return null;
  if (!allowSparse && points < 2) return null;

  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#a1a1aa", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            width={40}
            tick={{ fill: "#a1a1aa", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#18181b",
              border: "1px solid #3f3f46",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            labelFormatter={(_, payload) =>
              payload?.[0]?.payload?.date ? String(payload[0].payload.date) : ""
            }
            formatter={(value, name) => [
              typeof value === "number" ? value.toLocaleString() : String(value ?? ""),
              String(name),
            ]}
          />
          <Legend
            wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
            formatter={(v) => <span className="text-zinc-400">{v}</span>}
          />
          <Bar dataKey="actual" name="Actual" fill="#22d3ee" radius={[4, 4, 0, 0]} maxBarSize={26} />
          <Line
            type="monotone"
            dataKey="target"
            name="Target"
            stroke="#fbbf24"
            strokeWidth={2}
            dot={{ r: 2, fill: "#fbbf24" }}
            connectNulls
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
