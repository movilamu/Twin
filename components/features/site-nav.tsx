import Link from "next/link";
import { Button } from "@/components/ui/button";

/** Top navigation for public pages. Sticky, translucent on scroll. */
export function SiteNav(): JSX.Element {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <nav
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6"
        aria-label="Primary"
      >
        <Link href="/landing" className="flex items-center gap-2 font-semibold text-foreground">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full bg-secondary"
            aria-hidden="true"
          />
          Twin
        </Link>

        <div className="hidden items-center gap-8 text-sm text-muted md:flex">
          <a href="#how-it-works" className="transition-colors duration-200 hover:text-foreground">
            How it works
          </a>
          <a href="#features" className="transition-colors duration-200 hover:text-foreground">
            Features
          </a>
        </div>

        <Link href="/dashboard">
          <Button size="sm">Build my twin</Button>
        </Link>
      </nav>
    </header>
  );
}
