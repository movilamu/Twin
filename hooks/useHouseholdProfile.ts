import { useCallback, useState } from "react";
import type { HouseholdProfile } from "@/types/household";
import { supabase } from "@/lib/supabase";

interface UseHouseholdProfileResult {
  profile: HouseholdProfile | null;
  isSaving: boolean;
  error: string | null;
  saveProfile: (profile: HouseholdProfile) => Promise<HouseholdProfile | null>;
}

/**
 * Manages the household profile lifecycle: holds it in memory once
 * created, and posts it to /api/household for persistence. The
 * dashboard treats "profile is null" as the signal to show the
 * setup form instead of the score panel.
 */
export function useHouseholdProfile(): UseHouseholdProfileResult {
  const [profile, setProfile] = useState<HouseholdProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveProfile = useCallback(
    async (input: HouseholdProfile): Promise<HouseholdProfile | null> => {
      setIsSaving(true);
      setError(null);

      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData.session?.access_token;

        if (!accessToken) {
          throw new Error("You need to be signed in to save your household profile.");
        }

        const response = await fetch("/api/household", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(input),
        });

        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as
            | { error?: string }
            | null;
          throw new Error(body?.error ?? "Could not save your household profile.");
        }

        setProfile(input);
        return input;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  return { profile, isSaving, error, saveProfile };
}
