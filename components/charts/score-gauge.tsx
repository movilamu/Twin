"use client";

import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from "recharts";

interface ScoreGaugeProps {
  score: number;
}

function scoreColor(score: number): string {
  if (score >= 70) return "#52B788";
  if (score >= 40) return "#F4A261";
  return "#E76F51";
}

/** Radial gauge showing the overall 0-100 resilience score. */
export function ScoreGauge({ score }: ScoreGaugeProps): JSX.Element {
  const data = [{ name: "score", value: score, fill: scoreColor(score) }];

  return (
    <div className="relative h-48 w-48">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius="75%"
          outerRadius="100%"
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar
            background={{ fill: "#E2E8F0" }}
            dataKey="value"
            cornerRadius={12}
            angleAxisId={0}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
        aria-hidden="true"
      >
        <span className="text-4xl font-semibold text-foreground">{Math.round(score)}</span>
        <span className="text-xs text-muted">out of 100</span>
      </div>
      <span className="sr-only">Overall resilience score: {Math.round(score)} out of 100</span>
    </div>
  );
}
