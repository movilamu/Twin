import type { HospitalResult } from "@/lib/overpass";

const HOSPITAL_CACHE_KEY = "twin:last-hospital-search";
const CACHE_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7; // 1 week

interface CachedHospitalSearch {
  hospitals: HospitalResult[];
  origin: { latitude: number; longitude: number };
  severity: string;
  cachedAt: number;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

/**
 * Caches the last successful hospital search so the panic panel can
 * still show *something* useful if the network or Overpass API is down
 * when it matters most. This is best-effort, read-mostly caching, not
 * a source of truth — always prefer a fresh search when possible.
 */
export function cacheHospitalSearch(
  hospitals: HospitalResult[],
  origin: { latitude: number; longitude: number },
  severity: string
): void {
  if (!isBrowser()) return;

  try {
    const payload: CachedHospitalSearch = {
      hospitals,
      origin,
      severity,
      cachedAt: Date.now(),
    };
    window.localStorage.setItem(HOSPITAL_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Storage full or unavailable — non-fatal, just skip caching.
  }
}

/** Returns the last cached hospital search if it's still reasonably fresh. */
export function getCachedHospitalSearch(): CachedHospitalSearch | null {
  if (!isBrowser()) return null;

  try {
    const raw = window.localStorage.getItem(HOSPITAL_CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as CachedHospitalSearch;
    if (Date.now() - parsed.cachedAt > CACHE_MAX_AGE_MS) return null;

    return parsed;
  } catch {
    return null;
  }
}
