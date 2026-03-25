"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type WeightPoint = { date: string; label: string; weight: number };

type Props = {
  data: WeightPoint[];
};

export function WeightTrendChart({ data }: Props) {
  if (data.length < 2) return null;

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis
            dataKey="label"
            tick={{ fill: "#a1a1aa", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            width={36}
            tick={{ fill: "#a1a1aa", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            domain={["dataMin - 0.5", "dataMax + 0.5"]}
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
            formatter={(value) => {
              const n = typeof value === "number" ? value : Number(value);
              const label = Number.isFinite(n) ? String(n) : "—";
              return [`${label} kg`, "Weight"];
            }}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#34d399"
            strokeWidth={2}
            dot={{ r: 3, fill: "#34d399" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
