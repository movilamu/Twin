const features = [
  {
    title: "Personalized, not generic",
    body: "Your score is built from your household's actual composition and home layout — not a one-size-fits-all checklist.",
    accent: "bg-primary/10 text-primary",
  },
  {
    title: "Grounded in real hazard data",
    body: "Risk scoring is anchored to public flood and seismic zone data for your area, so the AI reasons from facts, not guesses.",
    accent: "bg-secondary/10 text-secondary",
  },
  {
    title: "Narrated, not just numbered",
    body: "Ask a what-if question and get a lived-through scenario in plain language, so the risk actually sticks.",
    accent: "bg-accent/10 text-accent",
  },
];

/** Three feature cards restating the core value in different frames. */
export function FeatureHighlights(): JSX.Element {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-secondary">
        Why it's different
      </h2>
      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="rounded-xl border border-border bg-surface p-6 shadow-subtle transition-shadow duration-200 hover:shadow-card"
          >
            <span
              className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold ${f.accent}`}
              aria-hidden="true"
            >
              ●
            </span>
            <h3 className="mt-4 font-medium text-foreground">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
