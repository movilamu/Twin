import Link from "next/link";
import { Button } from "@/components/ui/button";

/** Closing call-to-action before the footer. */
export function CTASection(): JSX.Element {
  return (
    <section className="border-t border-border/60 bg-surface">
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h2 className="text-3xl font-semibold text-foreground">
          Find out what your home hides.
        </h2>
        <p className="mt-3 text-muted">
          Free, takes a minute, and tells you exactly what to fix first.
        </p>
        <div className="mt-8">
          <Link href="/dashboard">
            <Button size="lg">Build my household twin</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
