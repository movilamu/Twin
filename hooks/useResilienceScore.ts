import { useCallback, useState } from "react";
import type { HouseholdProfile } from "@/types/household";
import type { ResilienceScore } from "@/types/resilience";
import { supabase } from "@/lib/supabase";

interface UseResilienceScoreResult {
  score: ResilienceScore | null;
  isLoading: boolean;
  error: string | null;
  fetchScore: (household: HouseholdProfile) => Promise<void>;
}

/** Fetches and holds the AI-generated resilience score for a household. */
export function useResilienceScore(): UseResilienceScoreResult {
  const [score, setScore] = useState<ResilienceScore | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScore = useCallback(async (household: HouseholdProfile): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      const response = await fetch("/api/resilience-score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ household }),
      });

      const body = (await response.json().catch(() => null)) as
        | (ResilienceScore & { error?: string })
        | null;

      if (!response.ok) {
        throw new Error(body?.error ?? "Could not generate your resilience score.");
      }

      if (!body) {
        throw new Error("Received an empty response from the resilience model.");
      }

      setScore(body);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { score, isLoading, error, fetchScore };
}
