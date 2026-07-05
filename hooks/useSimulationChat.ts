import { useCallback, useState } from "react";
import type { HouseholdProfile } from "@/types/household";
import type { ResilienceScore } from "@/types/resilience";
import type { ChatMessage, ScenarioType } from "@/types/chat";

interface UseSimulationChatResult {
  messages: ChatMessage[];
  isStreaming: boolean;
  error: string | null;
  sendQuestion: (question: string, scenario?: ScenarioType) => Promise<void>;
}

function makeId(): string {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * Manages the "what-if" simulation chat: appends a user message,
 * opens a streaming POST to /api/simulate, and appends tokens to a
 * growing assistant message as they arrive.
 */
export function useSimulationChat(
  household: HouseholdProfile | null,
  resilienceScore: ResilienceScore | null
): UseSimulationChatResult {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendQuestion = useCallback(
    async (question: string, scenario?: ScenarioType): Promise<void> => {
      if (!household) {
        setError("Set up your household profile first.");
        return;
      }

      setError(null);

      const userMessage: ChatMessage = {
        id: makeId(),
        role: "user",
        content: question,
        scenario,
        createdAt: new Date().toISOString(),
      };

      const assistantId = makeId();
      const assistantMessage: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        scenario,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsStreaming(true);

      try {
        const response = await fetch("/api/simulate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ household, resilienceScore, question }),
        });

        if (!response.ok || !response.body) {
          throw new Error("Could not start the simulation. Please try again.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;

            const payload = trimmed.slice(5).trim();
            if (payload === "[DONE]") continue;

            try {
              const parsed = JSON.parse(payload) as { text?: string; error?: string };

              if (parsed.error) {
                setError(parsed.error);
                continue;
              }

              if (parsed.text) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, content: m.content + parsed.text } : m
                  )
                );
              }
            } catch {
              // Skip malformed SSE chunks.
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setIsStreaming(false);
      }
    },
    [household, resilienceScore]
  );

  return { messages, isStreaming, error, sendQuestion };
}
