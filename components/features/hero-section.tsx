import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HouseSimulationSignature } from "@/components/features/house-simulation-signature";

/**
 * Hero section: the page's thesis. Leads with the signature
 * house-flooding visual rather than a generic stat block, since
 * the product's value is a simulated consequence, not a metric.
 */
export function HeroSection(): JSX.Element {
  return (
    <section className="relative mx-auto grid max-w-6xl gap-12 overflow-hidden px-6 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-[-6rem] h-96 w-96 rounded-full bg-gradient-to-br from-primary/30 via-secondary/20 to-accent/25 blur-3xl"
      />
      <div className="animate-fade-up">
        <span className="inline-flex items-center rounded-full bg-gradient-to-r from-secondary/15 to-secondary/5 px-3 py-1 text-xs font-medium text-secondary">
          Built for your home, not your city
        </span>
        <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
          Know what a disaster actually does to{" "}
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            your
          </span>{" "}
          house.
        </h1>
        <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted">
          Generic checklists tell everyone to store water. Your twin tells{" "}
          <em className="not-italic text-foreground">you</em> that your
          medication is on a ground floor that floods in 40 minutes — and
          what to do about it before it happens.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link href="/dashboard">
            <Button size="lg">Build my household twin</Button>
          </Link>
          <a
            href="#how-it-works"
            className="text-sm font-medium text-foreground underline underline-offset-4 transition-colors duration-200 hover:text-primary"
          >
            See how it works
          </a>
        </div>
        <p className="mt-6 text-xs text-muted">
          Takes about 60 seconds. No account required to see your first score.
        </p>
      </div>

      <div className="animate-fade-up [animation-delay:150ms] [animation-fill-mode:backwards]">
        <HouseSimulationSignature />
      </div>
    </section>
  );
}
