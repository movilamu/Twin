const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL_NAME = "openai/gpt-oss-120b";

function getApiKey(): string {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY is not set. Add it to your environment before calling AI routes."
    );
  }
  return apiKey;
}

interface GroqChatResponse {
  choices: Array<{
    message: { content: string };
  }>;
}

/**
 * Calls Groq's chat completions endpoint and expects a strict JSON
 * response matching the caller's expected shape. Uses Groq's JSON
 * object mode so the model is constrained at generation time, not
 * just prompted to behave. The caller is still responsible for
 * validating the parsed result with Zod.
 */
export async function generateStructuredJson(prompt: string): Promise<unknown> {
  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("RATE_LIMITED");
    }
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = (await response.json()) as GroqChatResponse;
  const text = data.choices[0]?.message.content ?? "";

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Groq did not return valid JSON");
  }
}

/**
 * Streams a free-form narrative response from Groq using
 * server-sent-events under the hood (Groq's OpenAI-compatible stream
 * format). Returns an async generator of text chunks so the route
 * handler can pipe them to the client as they arrive.
 */
export async function* generateStreamingNarrative(
  prompt: string
): AsyncGenerator<string> {
  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      stream: true,
    }),
  });

  if (!response.ok || !response.body) {
    if (response.status === 429) {
      throw new Error("RATE_LIMITED");
    }
    throw new Error(`Groq API error: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;

      const payload = trimmed.slice(5).trim();
      if (payload === "[DONE]") return;

      try {
        const parsed = JSON.parse(payload) as {
          choices: Array<{ delta: { content?: string } }>;
        };
        const text = parsed.choices[0]?.delta.content;
        if (text) {
          yield text;
        }
      } catch {
        // Skip malformed SSE chunks rather than failing the whole stream.
      }
    }
  }
}
