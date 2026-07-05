import { useEffect, useState } from "react";

/**
 * Best-effort country guess from the browser's locale (e.g. "en-IN" -> "IN").
 * This is only used to pick a sensible default emergency-number set — it is
 * NOT location tracking and involves no network call or geolocation permission.
 */
export function useDetectedCountry(): string | null {
  const [countryCode, setCountryCode] = useState<string | null>(null);

  useEffect(() => {
    const locale = typeof navigator !== "undefined" ? navigator.language : null;
    if (!locale) return;

    const parts = locale.split("-");
    const region = parts[1];
    if (region && region.length === 2) {
      setCountryCode(region.toUpperCase());
    }
  }, []);

  return countryCode;
}
