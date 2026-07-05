"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const ACK_KEY = "twin:privacy-ack";

/**
 * Shown once on first visit. Covers two things judges and real users
 * both care about: what happens to household/location data, and that
 * this tool is decision support, not an emergency service itself.
 * Gated behind localStorage so it never nags a returning user.
 */
export function PrivacyNotice(): JSX.Element | null {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const acknowledged = typeof window !== "undefined" && window.localStorage.getItem(ACK_KEY);
    if (!acknowledged) setVisible(true);
  }, []);

  function acknowledge(): void {
    try {
      window.localStorage.setItem(ACK_KEY, "true");
    } catch {
      // If storage is unavailable, still let the person proceed.
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-notice-title"
      className="fixed inset-0 z-[200] flex items-end justify-center bg-foreground/40 p-4 backdrop-blur-sm sm:items-center"
    >
      <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-card">
        <h2 id="privacy-notice-title" className="text-lg font-semibold text-foreground">
          Before you start
        </h2>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
          <li>
            <span className="font-medium text-foreground">Your data: </span>
            household details you enter are used only to generate your resilience score and
            simulations. Location is only requested when you open the hospital finder, never
            tracked in the background.
          </li>
          <li>
            <span className="font-medium text-foreground">Not a replacement for emergency services: </span>
            this tool provides decision support and general guidance. In immediate danger,
            always call your local emergency number first.
          </li>
        </ul>
        <Button onClick={acknowledge} className="mt-6 w-full">
          I understand, continue
        </Button>
      </div>
    </div>
  );
}
