export type ScenarioType = "flood" | "earthquake" | "power-outage" | "custom";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  scenario?: ScenarioType;
  createdAt: string;
}
