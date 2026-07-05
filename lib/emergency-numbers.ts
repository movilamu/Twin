export interface EmergencyContact {
  label: string;
  number: string;
}

export interface EmergencyNumberSet {
  countryCode: string;
  countryLabel: string;
  contacts: EmergencyContact[];
}

/**
 * Static emergency numbers by country. This is reference data, not
 * AI-generated — numbers this critical should never come from a model.
 * Extend this table with more countries as needed.
 */
const EMERGENCY_NUMBERS: Record<string, EmergencyNumberSet> = {
  IN: {
    countryCode: "IN",
    countryLabel: "India",
    contacts: [
      { label: "All-in-one emergency", number: "112" },
      { label: "Ambulance", number: "108" },
      { label: "Police", number: "100" },
      { label: "Fire", number: "101" },
      { label: "Women's helpline", number: "1091" },
    ],
  },
  US: {
    countryCode: "US",
    countryLabel: "United States",
    contacts: [{ label: "All-in-one emergency", number: "911" }],
  },
  GB: {
    countryCode: "GB",
    countryLabel: "United Kingdom",
    contacts: [
      { label: "All-in-one emergency", number: "999" },
      { label: "Non-emergency police/medical", number: "111" },
    ],
  },
  DEFAULT: {
    countryCode: "DEFAULT",
    countryLabel: "Unknown region",
    contacts: [{ label: "All-in-one emergency (verify locally)", number: "112" }],
  },
};

/** Returns the emergency number set for a country code, defaulting to a generic set. */
export function getEmergencyNumbers(countryCode: string | null): EmergencyNumberSet {
  if (!countryCode) return EMERGENCY_NUMBERS.DEFAULT as EmergencyNumberSet;
  return EMERGENCY_NUMBERS[countryCode.toUpperCase()] ?? (EMERGENCY_NUMBERS.DEFAULT as EmergencyNumberSet);
}
