"use client";

import { useEffect, useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const ONBOARDING_KEY = "twin:onboarding-seen";

const STEPS = [
  {
    title: "Build your household twin",
    body: "Fill in a few details about your home and family — it takes about a minute and stays private to you.",
  },
  {
    title: "Get a grounded resilience score",
    body: "Your score is generated from your actual household, not a generic checklist, and shows exactly what to fix first.",
  },
  {
    title: "Ask \u201cwhat if\u201d anytime",
    body: "Try a real scenario and get a step-by-step, time-coded plan built for your home specifically.",
  },
  {
    title: "The red button is always there",
    body: "If things get urgent, tap the floating help button on any page for emergency numbers, the nearest hospital, and safe medicine guidance.",
  },
];

/** Four-step, skippable onboarding shown once per browser via localStorage. */
export function OnboardingWalkthrough(): JSX.Element | null {
  const [visible, setVisible] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const seen = typeof window !== "undefined" && window.localStorage.getItem(ONBOARDING_KEY);
    if (!seen) setVisible(true);
  }, []);

  function dismiss(): void {
    try {
      window.localStorage.setItem(ONBOARDING_KEY, "true");
    } catch {
      // Non-fatal if storage is unavailable.
    }
    setVisible(false);
  }

  function next(): void {
    if (stepIndex === STEPS.length - 1) {
      dismiss();
      return;
    }
    setStepIndex((i) => i + 1);
  }

  if (!visible) return null;

  const step = STEPS[stepIndex];
  if (!step) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      className="fixed inset-0 z-[190] flex items-end justify-center bg-foreground/40 p-4 backdrop-blur-sm sm:items-center"
    >
      <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-card">
        <div className="flex items-start justify-between">
          <span className="text-xs font-medium text-muted">
            Step {stepIndex + 1} of {STEPS.length}
          </span>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Skip walkthrough"
            className="rounded-lg p-1 text-muted transition-colors duration-200 hover:bg-foreground/5 hover:text-foreground"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <h2 id="onboarding-title" className="mt-3 text-lg font-semibold text-foreground">
          {step.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex gap-1.5" aria-hidden="true">
            {STEPS.map((s, i) => (
              <span
                key={s.title}
                className={`h-1.5 w-6 rounded-full transition-colors duration-200 ${
                  i === stepIndex ? "bg-primary" : "bg-border"
                }`}
              />
            ))}
          </div>
          <Button size="sm" onClick={next}>
            {stepIndex === STEPS.length - 1 ? "Get started" : "Next"}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
