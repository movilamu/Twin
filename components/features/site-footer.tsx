/** Minimal footer. */
export function SiteFooter(): JSX.Element {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-xs text-muted sm:flex-row">
        <span>© {new Date().getFullYear()} Twin. Built for GEN AI Academy APAC.</span>
        <span>Hazard data is illustrative and not a substitute for official alerts.</span>
      </div>
    </footer>
  );
}
