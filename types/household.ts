export type MobilityNeed = "none" | "wheelchair" | "limited-mobility" | "visual" | "hearing";

export interface HouseholdComposition {
  adults: number;
  children: number;
  elderly: number;
  pets: number;
  mobilityNeeds: MobilityNeed[];
}

export interface HomeDetails {
  floorLevel: "ground" | "upper" | "multi-story";
  buildingType: "apartment" | "detached-house" | "townhouse";
  hasMedicalEquipment: boolean;
  medicalEquipmentFloor?: "ground" | "upper" | null;
}

export interface HouseholdProfile {
  id?: string;
  address: string;
  region: string;
  composition: HouseholdComposition;
  home: HomeDetails;
  createdAt?: string;
}
