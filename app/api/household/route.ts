import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createRequestScopedClient } from "@/lib/supabase";
import type { HouseholdProfile } from "@/types/household";

function extractAccessToken(request: NextRequest): string | null {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice(7);
}

const householdSchema = z.object({
  address: z.string().min(3).max(200),
  region: z.string().min(1),
  composition: z.object({
    adults: z.number().int().min(0).max(20),
    children: z.number().int().min(0).max(20),
    elderly: z.number().int().min(0).max(20),
    pets: z.number().int().min(0).max(20),
    mobilityNeeds: z.array(
      z.enum(["none", "wheelchair", "limited-mobility", "visual", "hearing"])
    ),
  }),
  home: z.object({
    floorLevel: z.enum(["ground", "upper", "multi-story"]),
    buildingType: z.enum(["apartment", "detached-house", "townhouse"]),
    hasMedicalEquipment: z.boolean(),
    medicalEquipmentFloor: z.enum(["ground", "upper"]).nullable().optional(),
  }),
});

/**
 * POST /api/household
 * Validates a household profile and persists it to Supabase.
 * RLS scopes rows to the authenticated user (or an anonymous session id
 * for the hackathon demo, depending on Supabase auth configuration).
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const accessToken = extractAccessToken(request);

  if (!accessToken) {
    return NextResponse.json(
      { error: "You need to be signed in to save your household profile." },
      { status: 401 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = householdSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid household profile.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const profile: HouseholdProfile = parsed.data;
  const supabase = createRequestScopedClient(accessToken);

  const { data, error } = await supabase
    .from("households")
    .insert({
      address: profile.address,
      region: profile.region,
      composition: profile.composition,
      home: profile.home,
    })
    .select()
    .single();

  if (error) {
    console.error("Household insert failed:", error);
    return NextResponse.json(
      { error: "Could not save household profile. Please try again." },
      { status: 502 }
    );
  }

  return NextResponse.json({ household: data }, { status: 201 });
}
