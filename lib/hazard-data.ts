/**
 * Static, realistic hazard-zone lookup. In production this would call a
 * free public API (e.g. a national geological survey or flood-zone
 * service); for the hackathon it's a representative static dataset keyed
 * by a coarse region label so the AI still reasons from concrete numbers
 * rather than inventing them.
 */
export interface HazardProfile {
  region: string;
  floodRiskLevel: "low" | "moderate" | "high";
  floodReturnPeriodYears: number;
  seismicZone: "low" | "moderate" | "high";
  averageOutageEventsPerYear: number;
}

const HAZARD_TABLE: Record<string, HazardProfile> = {
  "coastal-lowland": {
    region: "coastal-lowland",
    floodRiskLevel: "high",
    floodReturnPeriodYears: 10,
    seismicZone: "moderate",
    averageOutageEventsPerYear: 6,
  },
  "river-basin": {
    region: "river-basin",
    floodRiskLevel: "moderate",
    floodReturnPeriodYears: 25,
    seismicZone: "low",
    averageOutageEventsPerYear: 3,
  },
  "urban-inland": {
    region: "urban-inland",
    floodRiskLevel: "low",
    floodReturnPeriodYears: 50,
    seismicZone: "low",
    averageOutageEventsPerYear: 2,
  },
  "seismic-fault-zone": {
    region: "seismic-fault-zone",
    floodRiskLevel: "low",
    floodReturnPeriodYears: 75,
    seismicZone: "high",
    averageOutageEventsPerYear: 4,
  },
};

const DEFAULT_PROFILE: HazardProfile = HAZARD_TABLE["urban-inland"] as HazardProfile;

/** Looks up a coarse hazard profile for a region label, falling back to a moderate default. */
export function getHazardProfile(region: string): HazardProfile {
  return HAZARD_TABLE[region] ?? DEFAULT_PROFILE;
}

export const AVAILABLE_REGIONS = Object.keys(HAZARD_TABLE);
