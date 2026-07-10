import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface UseAuthResult {
  session: Session | null;
  isLoading: boolean;
  isSendingLink: boolean;
  linkSent: boolean;
  error: string | null;
  sendMagicLink: (email: string) => Promise<void>;
  signInAnonymously: () => Promise<void>;
  signOut: () => Promise<void>;
}

/**
 * Manages Supabase magic-link auth. Household data is only ever saved
 * under a signed-in session (see the household API route), so this
 * hook is what turns "anyone can write anonymous rows" into "each
 * person's household is private to them."
 */
export function useAuth(): UseAuthResult {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingLink, setIsSendingLink] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const sendMagicLink = useCallback(async (email: string): Promise<void> => {
    setIsSendingLink(true);
    setError(null);
    setLinkSent(false);

    try {
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          // Send the link straight to /dashboard, not the site root.
          // The root page does a server-side redirect to /landing,
          // which strips the auth token from the URL before Supabase's
          // client-side code ever gets a chance to read it.
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (signInError) {
        setError(signInError.message || "Could not send the sign-in link. Please try again.");
      } else {
        setLinkSent(true);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not reach the authentication server. Please try again."
      );
    } finally {
      setIsSendingLink(false);
    }
  }, []);

  const signInAnonymously = useCallback(async (): Promise<void> => {
    setError(null);
    const { error: anonError } = await supabase.auth.signInAnonymously();
    if (anonError) {
      setError(anonError.message);
    }
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    await supabase.auth.signOut();
  }, []);

  return {
    session,
    isLoading,
    isSendingLink,
    linkSent,
    error,
    sendMagicLink,
    signInAnonymously,
    signOut,
  };
}
