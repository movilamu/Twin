import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateStructuredJson } from "@/lib/groq";
import { getHazardProfile } from "@/lib/hazard-data";
import { createRequestScopedClient } from "@/lib/supabase";
import type { HouseholdProfile } from "@/types/household";

function extractAccessToken(request: NextRequest): string | null {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice(7);
}

const requestSchema = z.object({
  household: z.object({
    address: z.string(),
    region: z.string(),
    composition: z.object({
      adults: z.number(),
      children: z.number(),
      elderly: z.number(),
      pets: z.number(),
      mobilityNeeds: z.array(z.string()),
    }),
    home: z.object({
      floorLevel: z.string(),
      buildingType: z.string(),
      hasMedicalEquipment: z.boolean(),
      medicalEquipmentFloor: z.string().nullable().optional(),
    }),
  }),
});

const resilienceScoreSchema = z.object({
  overallScore: z.number().min(0).max(100),
  categories: z.array(
    z.object({
      category: z.enum(["flood", "seismic", "power-outage"]),
      score: z.number().min(0).max(100),
      summary: z.string(),
    })
  ),
  topActions: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      impact: z.enum(["high", "medium", "low"]),
      effort: z.enum(["low", "medium", "high"]),
      rationale: z.string(),
    })
  ),
});

/**
 * Builds the scoring prompt. This is the core "AI integration quality"
 * moment: we force Groq to reason over concrete hazard numbers and
 * household facts, then emit ONLY JSON matching resilienceScoreSchema
 * so downstream UI never has to parse free text.
 */
function buildScoringPrompt(household: HouseholdProfile): string {
  const hazard = getHazardProfile(household.region);

  return `You are a disaster-resilience risk analyst. Score this household's resilience (0-100, higher = MORE resilient / lower risk) across flood, seismic, and power-outage categories, using the hazard data provided. Be specific about WHY, referencing the household's actual details (floor level, medical equipment location, mobility needs, dependents).

HOUSEHOLD:
${JSON.stringify(household, null, 2)}

HAZARD DATA FOR THIS REGION:
${JSON.stringify(hazard, null, 2)}

Respond with ONLY valid JSON, no markdown fences, no preamble, matching exactly this shape:
{
  "overallScore": number (0-100),
  "categories": [
    { "category": "flood" | "seismic" | "power-outage", "score": number (0-100), "summary": string (1-2 sentences, reference specific household facts) }
  ],
  "topActions": [
    { "id": string, "title": string, "impact": "high"|"medium"|"low", "effort": "low"|"medium"|"high", "rationale": string }
  ]
}

Include exactly 3 categories (flood, seismic, power-outage) and 3-5 topActions ranked by impact-to-effort ratio, highest first.`;
}

/**
 * POST /api/resilience-score
 * Body: { household: HouseholdProfile }
 * Calls Groq for a structured score, validates with Zod, retries once
 * on a malformed response, then persists and returns the result.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsedRequest = requestSchema.safeParse(body);

  if (!parsedRequest.success) {
    return NextResponse.json(
      { error: "Invalid household data.", details: parsedRequest.error.flatten() },
      { status: 400 }
    );
  }

  const household = parsedRequest.data.household as HouseholdProfile;
  const prompt = buildScoringPrompt(household);

  let scoreResult: z.infer<typeof resilienceScoreSchema> | null = null;
  let lastError: unknown = null;
  let rateLimited = false;

  for (let attempt = 0; attempt < 2 && !scoreResult && !rateLimited; attempt++) {
    try {
      const raw = await generateStructuredJson(prompt);
      const parsed = resilienceScoreSchema.safeParse(raw);

      if (parsed.success) {
        scoreResult = parsed.data;
      } else {
        lastError = parsed.error;
      }
    } catch (err) {
      lastError = err;
      if (err instanceof Error && err.message === "RATE_LIMITED") {
        rateLimited = true; // no point retrying immediately against a 429
      }
    }
  }

  if (rateLimited) {
    return NextResponse.json(
      { error: "Groq's rate limit was hit. Please wait a few seconds and try again." },
      { status: 429 }
    );
  }

  if (!scoreResult) {
    console.error("Resilience score generation failed after retry:", lastError);
    return NextResponse.json(
      { error: "The resilience model is temporarily unavailable. Please try again in a moment." },
      { status: 503 }
    );
  }

  const generatedAt = new Date().toISOString();
  const accessToken = extractAccessToken(request);
  const supabase = createRequestScopedClient(accessToken);

  const { error: dbError } = await supabase.from("resilience_scores").insert({
    household_address: household.address,
    score: scoreResult,
    generated_at: generatedAt,
  });

  if (dbError) {
    // Non-fatal: still return the score even if persistence fails.
    console.error("Failed to persist resilience score:", dbError);
  }

  return NextResponse.json({
    ...scoreResult,
    generatedAt,
  });
}
