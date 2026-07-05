"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { RiskCategoryScore } from "@/types/resilience";

interface RiskBreakdownChartProps {
  categories: RiskCategoryScore[];
}

const CATEGORY_LABELS: Record<string, string> = {
  flood: "Flood",
  seismic: "Seismic",
  "power-outage": "Power outage",
};

const CATEGORY_COLORS: Record<string, string> = {
  flood: "#4F86C6",
  seismic: "#F4A261",
  "power-outage": "#52B788",
};

/** Horizontal bar chart comparing resilience score across hazard categories. */
export function RiskBreakdownChart({ categories }: RiskBreakdownChartProps): JSX.Element {
  const data = categories.map((c) => ({
    name: CATEGORY_LABELS[c.category] ?? c.category,
    value: c.score,
    category: c.category,
  }));

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis
            type="category"
            dataKey="name"
            width={100}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#1E293B", fontSize: 13 }}
          />
          <Tooltip
            cursor={{ fill: "rgba(30,41,59,0.04)" }}
            formatter={(value: number) => [`${value}/100`, "Score"]}
          />
          <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={20}>
            {data.map((entry) => (
              <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category] ?? "#4F86C6"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
