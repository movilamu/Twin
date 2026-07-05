const steps = [
  {
    label: "Tell it about your home",
    detail:
      "Address, who lives there, mobility needs, and what's on which floor. Sixty seconds, no jargon.",
  },
  {
    label: "Get a grounded resilience score",
    detail:
      "The AI cross-references your household with real hazard data for your area and scores flood, quake, and outage risk separately.",
  },
  {
    label: "Ask it anything, watch it play out",
    detail:
      "\u201cWhat if the power goes out for 3 days?\u201d gets a minute-by-minute answer specific to your home, not a generic tip sheet.",
  },
];

/** Three-step sequence — order carries real meaning here, so numbering is earned. */
export function HowItWorksSection(): JSX.Element {
  return (
    <section id="how-it-works" className="border-t border-border/60 bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-secondary">
          How it works
        </h2>
        <p className="mt-2 max-w-xl text-2xl font-semibold text-foreground">
          Three steps from a blank form to a household-specific plan.
        </p>

        <ol className="mt-12 grid gap-10 sm:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step.label} className="relative pl-12">
              <span
                className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary"
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <h3 className="font-medium text-foreground">{step.label}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {step.detail}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
