import { useCallback, useState } from "react";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

interface UseGeolocationResult {
  coordinates: Coordinates | null;
  isLocating: boolean;
  error: string | null;
  requestLocation: () => void;
}

/**
 * Wraps browser geolocation behind an explicit trigger (requestLocation)
 * rather than firing on mount — a location permission prompt should
 * only appear when the person actually asks for the map/hospital finder,
 * not the instant they open the emergency panel.
 */
export function useGeolocation(): UseGeolocationResult {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Location isn't available in this browser.");
      return;
    }

    setIsLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsLocating(false);
      },
      (geoError) => {
        setError(
          geoError.code === geoError.PERMISSION_DENIED
            ? "Location access was denied. You can search by address instead."
            : "Couldn't get your location. You can search by address instead."
        );
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return { coordinates, isLocating, error, requestLocation };
}
