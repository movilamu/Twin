import { NextRequest } from "next/server";
import { z } from "zod";
import { generateStreamingNarrative } from "@/lib/groq";
import { getHazardProfile } from "@/lib/hazard-data";
import type { HouseholdProfile } from "@/types/household";
import type { ResilienceScore } from "@/types/resilience";

export const maxDuration = 10; // stay under Vercel Hobby serverless timeout

const requestSchema = z.object({
  household: z.record(z.unknown()),
  resilienceScore: z.record(z.unknown()).nullable().optional(),
  question: z.string().min(3).max(500),
});

function buildSimulationPrompt(
  household: HouseholdProfile,
  resilienceScore: ResilienceScore | null | undefined,
  question: string
): string {
  const hazard = getHazardProfile(household.region);

  return `You are generating a step-by-step action sequence for ONE specific household during a disaster scenario. Ground every step in the household and hazard data below — reference specific floors, specific family members' needs, and realistic timing. Do not give generic advice; describe what THIS household should do, in order.

HOUSEHOLD:
${JSON.stringify(household, null, 2)}

HAZARD DATA:
${JSON.stringify(hazard, null, 2)}

${resilienceScore ? `PRIOR RESILIENCE SCORE:\n${JSON.stringify(resilienceScore, null, 2)}\n` : ""}

QUESTION FROM THE HOUSEHOLD: "${question}"

Respond as a numbered list of 5-8 short, sequential steps. Each step must:
- Start with a bolded time marker in brackets, e.g. "[Now]", "[+10 min]", "[+40 min]"
- Be one or two sentences, plain language, specific to this household (name the floor, person, or item where relevant)
- Be a concrete action, not general advice

Format exactly like this, with no intro or closing paragraph, no headers, just the numbered list:
1. [Now] ...
2. [+10 min] ...
3. [+25 min] ...

Respond with the numbered list only.`;
}

/**
 * POST /api/simulate
 * Streams a Server-Sent-Events response of narrative text chunks as
 * Groq generates them, so the chat UI can render tokens live.
 */
export async function POST(request: NextRequest): Promise<Response> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Request body must be valid JSON." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: "Invalid request.", details: parsed.error.flatten() }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { household, resilienceScore, question } = parsed.data;
  const prompt = buildSimulationPrompt(
    household as unknown as HouseholdProfile,
    resilienceScore as unknown as ResilienceScore | null | undefined,
    question
  );

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of generateStreamingNarrative(prompt)) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`));
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (err) {
        console.error("Simulation streaming failed:", err);
        const message =
          err instanceof Error && err.message === "RATE_LIMITED"
            ? "Groq's rate limit was hit. Please wait a few seconds and try again."
            : "The simulation is temporarily unavailable. Please try again shortly.";
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
