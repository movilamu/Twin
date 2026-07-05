import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreGauge } from "@/components/charts/score-gauge";
import { RiskBreakdownChart } from "@/components/charts/risk-breakdown-chart";
import { TopActionsList } from "@/components/features/top-actions-list";
import type { ResilienceScore } from "@/types/resilience";

interface ResilienceScorePanelProps {
  score: ResilienceScore;
}

/** Composed dashboard panel: overall score, per-category breakdown, and ranked actions. */
export function ResilienceScorePanel({ score }: ResilienceScorePanelProps): JSX.Element {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Your resilience score</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <ScoreGauge score={score.overallScore} />
          <div className="flex-1">
            <RiskBreakdownChart categories={score.categories} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What to fix first</CardTitle>
          <p className="mt-1 text-sm text-muted">Ranked by impact versus effort.</p>
        </CardHeader>
        <CardContent>
          <TopActionsList actions={score.topActions} />
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Category details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          {score.categories.map((category) => (
            <div key={category.category} className="rounded-lg border border-border p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                {category.category.replace("-", " ")}
              </p>
              <p className="mt-1 text-2xl font-semibold text-foreground">
                {Math.round(category.score)}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{category.summary}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
