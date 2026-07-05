"use client";

import { SiteNav } from "@/components/features/site-nav";
import { SiteFooter } from "@/components/features/site-footer";
import { HouseholdSetupForm } from "@/components/features/household-setup-form";
import { ResilienceScorePanel } from "@/components/features/resilience-score-panel";
import { ShareScoreCard } from "@/components/features/share-score-card";
import { OnboardingWalkthrough } from "@/components/features/onboarding-walkthrough";
import { SimulationChat } from "@/components/features/simulation-chat";
import { AuthGate } from "@/components/features/auth-gate";
import { useHouseholdProfile } from "@/hooks/useHouseholdProfile";
import { useResilienceScore } from "@/hooks/useResilienceScore";
import type { HouseholdProfile } from "@/types/household";

export default function DashboardPage(): JSX.Element {
  const { profile, isSaving, error: saveError, saveProfile } = useHouseholdProfile();
  const { score, isLoading, error: scoreError, fetchScore } = useResilienceScore();

  async function handleSetupSubmit(household: HouseholdProfile): Promise<void> {
    const saved = await saveProfile(household);
    if (saved) {
      await fetchScore(saved);
    }
  }

  return (
    <>
      <SiteNav />
      <OnboardingWalkthrough />
      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-2xl font-semibold text-foreground">Your household twin</h1>
        <p className="mt-1 text-muted">
          A resilience score and simulation built from your own household — not a generic
          checklist.
        </p>

        <div className="mt-8 space-y-8">
          <AuthGate>
            {!profile && (
              <HouseholdSetupForm isSaving={isSaving} onSubmit={handleSetupSubmit} />
            )}

            {saveError && (
              <p role="alert" className="text-sm text-danger">
                {saveError}
              </p>
            )}

            {profile && isLoading && (
              <div
                className="flex items-center gap-3 rounded-lg border border-border bg-surface p-6 text-sm text-muted"
                role="status"
              >
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"
                  aria-hidden="true"
                />
                Generating your resilience score...
              </div>
            )}

            {scoreError && (
              <p role="alert" className="text-sm text-danger">
                {scoreError}
              </p>
            )}

            {profile && score && !isLoading && (
              <>
                <ResilienceScorePanel score={score} />
                <ShareScoreCard score={score} />
                <SimulationChat household={profile} resilienceScore={score} />
              </>
            )}
          </AuthGate>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
