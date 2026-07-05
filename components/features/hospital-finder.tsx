"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { MapPin, Navigation, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useHospitalFinder } from "@/hooks/useHospitalFinder";
import type { Severity } from "@/lib/overpass";

// Leaflet touches `window` at import time, so it can only load client-side.
const LocationMap = dynamic(
  () => import("@/components/features/location-map").then((m) => m.LocationMap),
  { ssr: false, loading: () => <div className="h-64 w-full animate-pulse rounded-lg bg-border/40" /> }
);

const SEVERITY_OPTIONS: { value: Severity; label: string; hint: string }[] = [
  { value: "mild", label: "Mild", hint: "Minor injury or illness — clinics count" },
  { value: "moderate", label: "Moderate", hint: "Needs real attention soon — wider search" },
  { value: "severe", label: "Severe", hint: "Serious/life-threatening — full hospitals only" },
];

/** Full flow: pick severity, get location, search Overpass, show map + results. */
export function HospitalFinder(): JSX.Element {
  const [severity, setSeverity] = useState<Severity | null>(null);
  const { coordinates, isLocating, error: locationError, requestLocation } = useGeolocation();
  const { hospitals, isSearching, error: searchError, isShowingCached, search } = useHospitalFinder();
  const lastSearchedKey = useRef<string | null>(null);

  function handleSeveritySelect(value: Severity): void {
    setSeverity(value);
    if (!coordinates) {
      requestLocation();
    }
  }

  useEffect(() => {
    if (!coordinates || !severity) return;

    const key = `${coordinates.latitude},${coordinates.longitude},${severity}`;
    if (lastSearchedKey.current === key) return;

    lastSearchedKey.current = key;
    void search(coordinates, severity);
  }, [coordinates, severity, search]);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-foreground">How severe is the situation?</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {SEVERITY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSeveritySelect(option.value)}
              title={option.hint}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                severity === option.value
                  ? "border-danger bg-danger/10 text-danger"
                  : "border-border text-foreground hover:bg-foreground/5"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {!coordinates && severity && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 text-sm text-muted">
          <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
          {isLocating ? "Getting your location..." : "Requesting your location..."}
        </div>
      )}

      {locationError && (
        <p role="alert" className="text-sm text-danger">
          {locationError}
        </p>
      )}

      {isSearching && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 text-sm text-muted">
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"
            aria-hidden="true"
          />
          Searching nearby facilities...
        </div>
      )}

      {searchError && (
        <p role="alert" className={`text-sm ${isShowingCached ? "text-accent" : "text-danger"}`}>
          {searchError}
        </p>
      )}

      {coordinates && hospitals.length > 0 && (
        <>
          <LocationMap origin={coordinates} hospitals={hospitals} />
          <ul className="space-y-2">
            {hospitals.map((hospital) => (
              <li
                key={hospital.id}
                className="rounded-lg border border-border p-3 text-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{hospital.name}</p>
                    <p className="text-xs text-muted">
                      {hospital.type === "hospital" ? "Hospital" : "Clinic"} ·{" "}
                      {hospital.distanceKm.toFixed(1)} km away
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {hospital.phone && (
                      <a href={`tel:${hospital.phone}`} aria-label={`Call ${hospital.name}`}>
                        <Button size="sm" variant="secondary">
                          <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                        </Button>
                      </a>
                    )}
                    <a
                      href={`https://www.openstreetmap.org/directions?from=${coordinates.latitude},${coordinates.longitude}&to=${hospital.latitude},${hospital.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Get directions to ${hospital.name}`}
                    >
                      <Button size="sm" variant="outline">
                        <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
