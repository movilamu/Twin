"use client";

import { useState } from "react";
import { PanicPanel } from "@/components/features/panic-panel";

/**
 * Persistent floating action button, present on every page via the
 * root layout. Opens the PanicPanel — the single place a panicking
 * user goes for maps, hospitals, emergency numbers, and calling for help.
 */
export function PanicButton(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className="fixed bottom-6 right-6 z-[100] flex h-16 w-16 items-center justify-center rounded-full bg-danger text-white shadow-lg shadow-danger/30 transition-transform duration-200 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-danger animate-pulse-slow"
      >
        <span className="text-xs font-bold leading-tight">
          NEED
          <br />
          HELP
        </span>
      </button>

      {isOpen && <PanicPanel onClose={() => setIsOpen(false)} />}
    </>
  );
}
