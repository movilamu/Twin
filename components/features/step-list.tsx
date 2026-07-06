interface ParsedStep {
  number: string;
  timeMarker: string | null;
  action: string;
}

const STEP_LINE_PATTERN = /^\s*(\d+)\.\s*(?:\[([^\]]+)\]\s*)?(.*)$/;

type UrgencyBucket = "immediate" | "soon" | "today" | "later";

const BUCKET_STYLES: Record<UrgencyBucket, { badge: string; row: string; number: string }> = {
  immediate: {
    badge: "bg-danger text-white",
    row: "bg-danger/5",
    number: "bg-danger text-white",
  },
  soon: {
    badge: "bg-accent text-accent-foreground",
    row: "bg-accent/5",
    number: "bg-accent/20 text-accent-foreground",
  },
  today: {
    badge: "bg-primary/15 text-primary",
    row: "",
    number: "bg-primary/10 text-primary",
  },
  later: {
    badge: "bg-secondary/15 text-secondary",
    row: "",
    number: "bg-secondary/10 text-secondary",
  },
};

/**
 * Classifies a time marker like "Now", "+10 min", "Day 2" into an urgency
 * bucket so each step's color reflects how soon it needs to happen —
 * red for immediate, amber for soon, blue for later today, green for
 * multi-day-out actions. Falls back to "today" for unrecognized markers
 * rather than defaulting to alarming red.
 */
function classifyUrgency(timeMarker: string | null): UrgencyBucket {
  if (!timeMarker) return "today";
  const marker = timeMarker.toLowerCase();

  if (/^now$/.test(marker) || /\+\s*[0-5]\s*min/.test(marker)) return "immediate";

  const minuteMatch = marker.match(/\+\s*(\d+)\s*min/);
  if (minuteMatch) {
    const minutes = parseInt(minuteMatch[1] ?? "0", 10);
    return minutes <= 60 ? "soon" : "today";
  }

  if (/\bhour\b|\bhr\b|today/.test(marker)) return "today";
  if (/day\s*1|tonight/.test(marker)) return "today";
  if (/day\s*[2-9]|next week|day\s*\d{2,}/.test(marker)) return "later";

  return "today";
}

/** Parses "1. [Now] Move medication upstairs." lines into structured steps. */
function parseSteps(content: string): ParsedStep[] {
  const lines = content
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    // Strip markdown emphasis (the model sometimes wraps "[Now]" as
    // "**[Now]**"), which otherwise breaks the bracket match below.
    .map((l) => l.replace(/\*\*/g, "").replace(/__/g, ""));

  const steps: ParsedStep[] = [];

  for (const line of lines) {
    const match = line.match(STEP_LINE_PATTERN);
    if (match) {
      steps.push({
        number: match[1] ?? "",
        timeMarker: match[2] ?? null,
        action: (match[3] ?? "").trim(),
      });
    }
  }

  return steps;
}

interface StepListProps {
  content: string;
}

/**
 * Renders a streaming numbered-step response as a large, color-coded
 * timeline tuned for reading under stress: each step's time marker is
 * colored by how urgent it is (red = act now, amber = within the hour,
 * blue = later today, green = coming days), so urgency is legible at a
 * glance without reading every word. Falls back to plain text if the
 * model's output hasn't matched the expected format yet (e.g. mid-stream).
 */
export function StepList({ content }: StepListProps): JSX.Element {
  const steps = parseSteps(content);

  if (steps.length === 0) {
    return (
      <p className="whitespace-pre-line text-base leading-relaxed text-foreground">{content}</p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 text-xs text-muted" aria-hidden="true">
        <LegendDot bucket="immediate" label="Act now" />
        <LegendDot bucket="soon" label="Within the hour" />
        <LegendDot bucket="today" label="Later today" />
        <LegendDot bucket="later" label="Coming days" />
      </div>
      <ol className="space-y-4">
        {steps.map((step, i) => {
          const bucket = classifyUrgency(step.timeMarker);
          const styles = BUCKET_STYLES[bucket];
          return (
            <li
              key={`${step.number}-${i}`}
              className={`flex gap-3 rounded-lg p-2 ${styles.row}`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${styles.number}`}
              >
                {step.number}
              </span>
              <div className="flex-1 pt-0.5">
                {step.timeMarker && (
                  <span
                    className={`mr-2 inline-block rounded-full px-2.5 py-1 text-xs font-bold ${styles.badge}`}
                  >
                    {step.timeMarker.toUpperCase()}
                  </span>
                )}
                <span className="text-base font-medium leading-relaxed text-foreground">
                  {step.action}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function LegendDot({ bucket, label }: { bucket: UrgencyBucket; label: string }): JSX.Element {
  const dotColor: Record<UrgencyBucket, string> = {
    immediate: "bg-danger",
    soon: "bg-accent",
    today: "bg-primary",
    later: "bg-secondary",
  };
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${dotColor[bucket]}`} />
      {label}
    </span>
  );
}
