import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { findNearbyHospitals } from "@/lib/overpass";

export const maxDuration = 10;

const requestSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  severity: z.enum(["mild", "moderate", "severe"]),
});

/**
 * POST /api/hospitals
 * Proxies the Overpass API server-side. Calling Overpass directly from
 * the browser is subject to CORS behavior that's inconsistent across
 * networks/browsers; running it through our own route sidesteps that
 * entirely, since server-to-server requests have no CORS restrictions.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid location or severity.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { latitude, longitude, severity } = parsed.data;

  try {
    const hospitals = await findNearbyHospitals({ latitude, longitude }, severity);
    return NextResponse.json({ hospitals });
  } catch (err) {
    console.error("Hospital search failed:", err);
    return NextResponse.json(
      { error: "Could not reach the hospital directory. Please try again." },
      { status: 502 }
    );
  }
}
