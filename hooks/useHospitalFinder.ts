import { useCallback, useState } from "react";
import { findNearbyHospitals, type HospitalResult, type Severity } from "@/lib/overpass";
import type { Coordinates } from "@/hooks/useGeolocation";
import { cacheHospitalSearch, getCachedHospitalSearch } from "@/lib/offline-cache";

interface UseHospitalFinderResult {
  hospitals: HospitalResult[];
  isSearching: boolean;
  error: string | null;
  isShowingCached: boolean;
  search: (origin: Coordinates, severity: Severity) => Promise<void>;
}

/** Drives the "find nearby hospitals" flow, wrapping the Overpass client with UI state. */
export function useHospitalFinder(): UseHospitalFinderResult {
  const [hospitals, setHospitals] = useState<HospitalResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isShowingCached, setIsShowingCached] = useState(false);

  const search = useCallback(async (origin: Coordinates, severity: Severity): Promise<void> => {
    setIsSearching(true);
    setError(null);
    setIsShowingCached(false);

    try {
      const results = await findNearbyHospitals(origin, severity);
      if (results.length === 0) {
        setError("No matching facilities found nearby. Try a wider search or call emergency services.");
      } else {
        cacheHospitalSearch(results, origin, severity);
      }
      setHospitals(results);
    } catch (err) {
      const cached = getCachedHospitalSearch();
      if (cached) {
        setHospitals(cached.hospitals);
        setIsShowingCached(true);
        setError(
          "You appear to be offline. Showing your last saved search — it may be out of date."
        );
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong finding hospitals.");
        setHospitals([]);
      }
    } finally {
      setIsSearching(false);
    }
  }, []);

  return { hospitals, isSearching, error, isShowingCached, search };
}
