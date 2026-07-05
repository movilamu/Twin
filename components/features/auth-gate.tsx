"use client";

import { useState, type FormEvent } from "react";
import { Mail, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

interface AuthGateProps {
  children: React.ReactNode;
}

/**
 * Gates household data behind a real signed-in session. Household
 * profiles and scores are only ever saved under auth.uid() (see
 * supabase/schema.sql), so this is what makes household data private
 * per-person instead of world-readable/writable.
 */
export function AuthGate({ children }: AuthGateProps): JSX.Element {
  const { session, isLoading, isSendingLink, linkSent, error, sendMagicLink, signOut } =
    useAuth();
  const [email, setEmail] = useState("");

  function handleSubmit(e: FormEvent): void {
    e.preventDefault();
    if (!email.trim()) return;
    void sendMagicLink(email.trim());
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border bg-surface p-6 text-sm text-muted">
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"
          aria-hidden="true"
        />
        Checking your session...
      </div>
    );
  }

  if (!session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sign in to build your twin</CardTitle>
          <p className="mt-1 text-sm text-muted">
            Your household data is private to you. We'll email you a one-time sign-in link
            — no password needed.
          </p>
        </CardHeader>
        <CardContent>
          {linkSent ? (
            <p className="flex items-center gap-2 text-sm text-secondary">
              <Mail className="h-4 w-4" aria-hidden="true" />
              Check your inbox for a sign-in link.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="flex-1 space-y-2">
                <Label htmlFor="auth-email" className="sr-only">
                  Email address
                </Label>
                <Input
                  id="auth-email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={isSendingLink}>
                {isSendingLink ? "Sending..." : "Send link"}
              </Button>
            </form>
          )}
          {error && (
            <p role="alert" className="mt-2 text-sm text-danger">
              {error}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-muted">
        <span>Signed in as {session.user.email}</span>
        <button
          type="button"
          onClick={() => void signOut()}
          className="flex items-center gap-1 font-medium text-foreground transition-colors duration-200 hover:text-primary"
        >
          <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
          Sign out
        </button>
      </div>
      {children}
    </div>
  );
}
