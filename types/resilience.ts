export type RiskCategory = "flood" | "seismic" | "power-outage";

export interface RiskCategoryScore {
  category: RiskCategory;
  score: number; // 0-100, higher = more resilient
  summary: string;
}

export interface ActionItem {
  id: string;
  title: string;
  impact: "high" | "medium" | "low";
  effort: "low" | "medium" | "high";
  rationale: string;
}

export interface ResilienceScore {
  overallScore: number; // 0-100
  categories: RiskCategoryScore[];
  topActions: ActionItem[];
  generatedAt: string;
}
