"use client";

import { useState, type FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { HouseholdProfile } from "@/types/household";
import type { ResilienceScore } from "@/types/resilience";
import type { ScenarioType } from "@/types/chat";
import { useSimulationChat } from "@/hooks/useSimulationChat";
import { StepList } from "@/components/features/step-list";

interface SimulationChatProps {
  household: HouseholdProfile;
  resilienceScore: ResilienceScore | null;
}

const QUICK_PROMPTS: { label: string; question: string; scenario: ScenarioType }[] = [
  {
    label: "If it floods tonight",
    question: "What happens to my household if flooding starts tonight?",
    scenario: "flood",
  },
  {
    label: "3-day power outage",
    question: "What happens if the power goes out for 3 days?",
    scenario: "power-outage",
  },
  {
    label: "A strong earthquake",
    question: "Walk me through what happens during a strong earthquake.",
    scenario: "earthquake",
  },
];

/** Streaming "what-if" chat grounded in the household's profile and score. */
export function SimulationChat({ household, resilienceScore }: SimulationChatProps): JSX.Element {
  const { messages, isStreaming, error, sendQuestion } = useSimulationChat(
    household,
    resilienceScore
  );
  const [input, setInput] = useState("");

  function handleSubmit(e: FormEvent): void {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    setInput("");
    void sendQuestion(trimmed, "custom");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ask &quot;what if&quot;</CardTitle>
        <p className="mt-1 text-sm text-muted">
          Grounded in your household's own profile and score — not generic advice.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt.label}
              type="button"
              disabled={isStreaming}
              onClick={() => void sendQuestion(prompt.question, prompt.scenario)}
              className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors duration-200 hover:bg-foreground/5 disabled:opacity-50"
            >
              {prompt.label}
            </button>
          ))}
        </div>

        <div
          className="max-h-96 space-y-4 overflow-y-auto rounded-lg border border-border bg-background p-4 text-base"
          role="log"
          aria-live="polite"
        >
          {messages.length === 0 && !isStreaming && (
            <p className="text-sm text-muted">
              Try a quick prompt above, or ask your own question below.
            </p>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={message.role === "user" ? "text-right" : "text-left"}
            >
              {message.role === "user" ? (
                <span className="inline-block max-w-[85%] rounded-lg bg-primary px-4 py-2 text-sm leading-relaxed text-primary-foreground">
                  {message.content}
                </span>
              ) : (
                <div className="inline-block w-full max-w-[95%] rounded-lg bg-surface px-4 py-3 text-sm shadow-subtle">
                  {message.content ? (
                    <StepList content={message.content} />
                  ) : (
                    <span className="text-muted">{isStreaming ? "Thinking..." : ""}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <form onSubmit={handleSubmit} className="flex gap-2">
          <label htmlFor="simulation-question" className="sr-only">
            Ask a what-if question
          </label>
          <Input
            id="simulation-question"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What if...?"
            disabled={isStreaming}
          />
          <Button type="submit" disabled={isStreaming || !input.trim()}>
            {isStreaming ? "Sending..." : "Ask"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
