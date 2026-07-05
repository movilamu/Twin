import type { ActionItem } from "@/types/resilience";

interface TopActionsListProps {
  actions: ActionItem[];
}

const IMPACT_STYLES: Record<ActionItem["impact"], string> = {
  high: "bg-secondary/10 text-secondary",
  medium: "bg-accent/10 text-accent",
  low: "bg-muted/10 text-muted",
};

/** Ranked list of recommended actions, each tagged with impact and effort. */
export function TopActionsList({ actions }: TopActionsListProps): JSX.Element {
  if (actions.length === 0) {
    return <p className="text-sm text-muted">No actions to show yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {actions.map((action) => (
        <li
          key={action.id}
          className="rounded-lg border border-border p-4 transition-colors duration-200 hover:bg-foreground/[0.02]"
        >
          <div className="flex items-start justify-between gap-3">
            <h4 className="font-medium text-foreground">{action.title}</h4>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${IMPACT_STYLES[action.impact]}`}
            >
              {action.impact} impact
            </span>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-muted">{action.rationale}</p>
          <span className="mt-2 inline-block text-xs text-muted">
            Effort: {action.effort}
          </span>
        </li>
      ))}
    </ul>
  );
}
