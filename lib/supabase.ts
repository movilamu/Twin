import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase environment variables are not set. Persistence routes will fail until configured."
  );
}

/**
 * Shared Supabase client. Safe to import on both server and client:
 * only the anon key (protected by Row Level Security) is used here.
 * Never import a service-role key into this file.
 */
export const supabase: SupabaseClient = createClient(
  supabaseUrl ?? "",
  supabaseAnonKey ?? ""
);

/**
 * Creates a request-scoped Supabase client that forwards the caller's
 * own access token, so Postgres RLS policies using auth.uid() correctly
 * identify the signed-in user inside a Next.js route handler. Without
 * this, route handlers would always look like anonymous requests to
 * the database, even if the browser is signed in.
 */
export function createRequestScopedClient(accessToken: string | null): SupabaseClient {
  if (!accessToken) return supabase;

  return createClient(supabaseUrl ?? "", supabaseAnonKey ?? "", {
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  });
}
