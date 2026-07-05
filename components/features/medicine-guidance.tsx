"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";

type AgeBracket = "infant" | "child" | "teen" | "adult" | "senior";
type Condition = "fever" | "cold";

const AGE_OPTIONS: { value: AgeBracket; label: string }[] = [
  { value: "infant", label: "Under 2" },
  { value: "child", label: "2–12" },
  { value: "teen", label: "13–17" },
  { value: "adult", label: "18–64" },
  { value: "senior", label: "65+" },
];

const CONDITION_OPTIONS: { value: Condition; label: string }[] = [
  { value: "fever", label: "Fever" },
  { value: "cold", label: "Cold / cough" },
];

interface Guidance {
  general: string;
  seekCareIf: string[];
}

/**
 * Deliberately does NOT include numeric dosages (mg per age/weight).
 * AI-generated or hardcoded dosage tables reaching someone in a panic
 * is a real safety risk if anything is even slightly off — always
 * defer the actual number to a pharmacist, doctor, or the medicine's
 * package insert. This section only orients: what's typically used,
 * and when to stop self-treating and get real care.
 */
const GUIDANCE: Record<AgeBracket, Record<Condition, Guidance>> = {
  infant: {
    fever: {
      general:
        "For a child under 2, do not choose or dose any fever medicine yourself. Call a pediatrician or pharmacist first — dosing at this age depends on exact weight.",
      seekCareIf: [
        "Fever in a baby under 3 months (any temperature)",
        "Fever above 38°C (100.4°F) in a baby under 2 months",
        "Unusual sleepiness, difficulty waking, or refusing to feed",
        "Rash, trouble breathing, or persistent crying",
      ],
    },
    cold: {
      general:
        "Over-the-counter cold medicines are generally not recommended for children under 2. Focus on fluids, rest, and saline drops; ask a pharmacist or doctor before giving anything else.",
      seekCareIf: [
        "Trouble breathing or fast breathing",
        "Bluish lips or face",
        "Fever alongside cold symptoms in a baby under 3 months",
        "Not feeding or unusually lethargic",
      ],
    },
  },
  child: {
    fever: {
      general:
        "Children's fever relief typically uses paracetamol/acetaminophen or ibuprofen formulated for kids — but the exact dose depends on weight, not just age. Check the product label for a weight-based dosing chart or ask a pharmacist.",
      seekCareIf: [
        "Fever above 39°C (102°F) that doesn't respond to medicine",
        "Fever lasting more than 3 days",
        "Stiff neck, severe headache, or rash",
        "Signs of dehydration (no tears, dry mouth, less urination)",
      ],
    },
    cold: {
      general:
        "Rest, fluids, and saline nasal spray are first-line for kids. Many cough/cold combination medicines aren't recommended under a certain age — check the label or ask a pharmacist before giving any.",
      seekCareIf: [
        "Wheezing or labored breathing",
        "Ear pain (possible ear infection)",
        "Symptoms worsening after a week",
        "High fever alongside cold symptoms",
      ],
    },
  },
  teen: {
    fever: {
      general:
        "Standard adult-formulation paracetamol or ibuprofen is typically used, following the package label's age-based dosing table exactly.",
      seekCareIf: [
        "Fever above 39.5°C (103°F)",
        "Fever lasting more than 3 days",
        "Severe headache, stiff neck, or confusion",
        "Difficulty breathing",
      ],
    },
    cold: {
      general:
        "Standard over-the-counter cold remedies (decongestants, antihistamines) are generally fine at this age per label instructions. Stay hydrated and rest.",
      seekCareIf: [
        "Difficulty breathing or chest pain",
        "Symptoms lasting more than 10 days without improvement",
        "High fever developing partway through a cold",
      ],
    },
  },
  adult: {
    fever: {
      general:
        "Paracetamol or ibuprofen per the package label are the typical first choices. Avoid combining multiple products that both contain paracetamol.",
      seekCareIf: [
        "Fever above 39.5°C (103°F) or lasting more than 3 days",
        "Severe headache, stiff neck, rash, or confusion",
        "Difficulty breathing or chest pain",
        "Underlying condition (e.g. pregnancy, immunocompromised) — check with a doctor first",
      ],
    },
    cold: {
      general:
        "Rest, fluids, and standard over-the-counter cold/cough remedies per the label are typically sufficient.",
      seekCareIf: [
        "Difficulty breathing or chest pain",
        "Symptoms lasting more than 10 days or worsening after initially improving",
        "High fever developing partway through a cold",
      ],
    },
  },
  senior: {
    fever: {
      general:
        "Paracetamol is usually preferred over ibuprofen at this age due to interactions with common medications — confirm with a pharmacist, especially if on blood thinners or blood pressure medication.",
      seekCareIf: [
        "Any fever alongside confusion or unusual drowsiness",
        "Fever above 38.5°C (101.3°F) for more than a day",
        "Difficulty breathing or chest pain",
        "Existing heart, kidney, or liver conditions — check before taking anything",
      ],
    },
    cold: {
      general:
        "Some decongestants can raise blood pressure or interact with heart medications — check with a pharmacist before taking anything new.",
      seekCareIf: [
        "Difficulty breathing or chest pain",
        "Symptoms lasting more than a week without improvement",
        "Existing heart or lung conditions",
      ],
    },
  },
};

/** Age- and condition-aware general guidance. No numeric dosages — see file header. */
export function MedicineGuidance(): JSX.Element {
  const [age, setAge] = useState<AgeBracket | null>(null);
  const [condition, setCondition] = useState<Condition | null>(null);

  const guidance = age && condition ? GUIDANCE[age][condition] : null;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 rounded-lg border border-accent/30 bg-accent/5 p-3 text-xs text-foreground">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
        <p>
          This gives general orientation only, not exact doses. Always confirm the actual
          dose with a pharmacist, doctor, or the product's label — especially for children.
        </p>
      </div>

      <div>
        <p className="text-sm font-medium text-foreground">Age</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {AGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setAge(option.value)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
                age === option.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-foreground hover:bg-foreground/5"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-foreground">Condition</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {CONDITION_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setCondition(option.value)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
                condition === option.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-foreground hover:bg-foreground/5"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {guidance && (
        <div className="space-y-3 rounded-lg border border-border p-4">
          <p className="text-sm leading-relaxed text-foreground">{guidance.general}</p>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-danger">
              Seek care immediately if:
            </p>
            <ul className="mt-2 space-y-1">
              {guidance.seekCareIf.map((item) => (
                <li key={item} className="text-sm leading-relaxed text-foreground">
                  • {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
