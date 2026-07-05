"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ResilienceScore } from "@/types/resilience";

interface ShareScoreCardProps {
  score: ResilienceScore;
}

function buildShareText(score: ResilienceScore): string {
  const categoryLines = score.categories
    .map((c) => `• ${c.category.replace("-", " ")}: ${Math.round(c.score)}/100`)
    .join("\n");

  return `My household resilience score: ${Math.round(score.overallScore)}/100\n\n${categoryLines}\n\nBuilt with Twin — a household disaster resilience simulator.`;
}

/**
 * Lets a person share their score outside the app — the loop that
 * turns an individual tool into a community one, which is the whole
 * point of the "smarter communities" framing. Uses the Web Share API
 * where available (mobile), falling back to copy-to-clipboard.
 */
export function ShareScoreCard({ score }: ShareScoreCardProps): JSX.Element {
  const [copied, setCopied] = useState(false);

  async function handleShare(): Promise<void> {
    const text = buildShareText(score);

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ text, title: "My household resilience score" });
        return;
      } catch {
        // User cancelled the share sheet — fall through to clipboard as a backup.
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — silently no-op rather than erroring the UI.
    }
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-gradient-to-r from-primary/5 to-secondary/5 p-4">
      <div>
        <p className="text-sm font-medium text-foreground">Share your resilience score</p>
        <p className="text-xs text-muted">Help a neighbor check theirs too.</p>
      </div>
      <Button variant="outline" size="sm" onClick={() => void handleShare()}>
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5" aria-hidden="true" /> Copied
          </>
        ) : (
          <>
            <Share2 className="h-3.5 w-3.5" aria-hidden="true" /> Share
          </>
        )}
      </Button>
    </div>
  );
}
