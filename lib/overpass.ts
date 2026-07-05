import type { Coordinates } from "@/hooks/useGeolocation";

export type Severity = "mild" | "moderate" | "severe";

export interface HospitalResult {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  phone: string | null;
  type: "hospital" | "clinic";
}

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

/** Severity determines search radius and whether clinics count, or only full hospitals. */
const SEVERITY_CONFIG: Record<Severity, { radiusMeters: number; includeClinic: boolean }> = {
  mild: { radiusMeters: 5000, includeClinic: true },
  moderate: { radiusMeters: 10000, includeClinic: true },
  severe: { radiusMeters: 20000, includeClinic: false },
};

function haversineDistanceKm(a: Coordinates, b: Coordinates): number {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;

  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

interface OverpassElement {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

/**
 * Queries the free Overpass API for nearby hospitals (and clinics, for
 * lower severity) around a coordinate, sorted by distance. For "severe"
 * cases we only return full hospitals, since a clinic may not be
 * equipped to help.
 */
export async function findNearbyHospitals(
  origin: Coordinates,
  severity: Severity
): Promise<HospitalResult[]> {
  const config = SEVERITY_CONFIG[severity];
  const amenities = config.includeClinic ? ["hospital", "clinic"] : ["hospital"];

  const query = `
    [out:json][timeout:15];
    (
      ${amenities
        .map(
          (amenity) =>
            `node["amenity"="${amenity}"](around:${config.radiusMeters},${origin.latitude},${origin.longitude});
             way["amenity"="${amenity}"](around:${config.radiusMeters},${origin.latitude},${origin.longitude});`
        )
        .join("\n")}
    );
    out center tags 30;
  `;

  const response = await fetch(OVERPASS_URL, {
    method: "POST",
    body: query,
    headers: { "Content-Type": "text/plain" },
  });

  if (!response.ok) {
    throw new Error("Could not reach the hospital directory. Please try again.");
  }

  const data = (await response.json()) as OverpassResponse;

  const results: HospitalResult[] = data.elements
    .map((el) => {
      const lat = el.lat ?? el.center?.lat;
      const lon = el.lon ?? el.center?.lon;
      if (lat === undefined || lon === undefined) return null;

      const name = el.tags?.name ?? "Unnamed medical facility";
      const amenity = el.tags?.amenity === "hospital" ? "hospital" : "clinic";

      const result: HospitalResult = {
        id: String(el.id),
        name,
        latitude: lat,
        longitude: lon,
        distanceKm: haversineDistanceKm(origin, { latitude: lat, longitude: lon }),
        phone: el.tags?.phone ?? el.tags?.["contact:phone"] ?? null,
        type: amenity,
      };
      return result;
    })
    .filter((r): r is HospitalResult => r !== null)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 8);

  return results;
}
