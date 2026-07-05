"use client";

import { useEffect, useState } from "react";
import { X, Phone, Hospital, Pill, WifiOff } from "lucide-react";
import { getEmergencyNumbers } from "@/lib/emergency-numbers";
import { useDetectedCountry } from "@/hooks/useDetectedCountry";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { HospitalFinder } from "@/components/features/hospital-finder";
import { MedicineGuidance } from "@/components/features/medicine-guidance";

interface PanicPanelProps {
  onClose: () => void;
}

type Tab = "call" | "hospital" | "medicine";

const TABS: { id: Tab; label: string; icon: typeof Phone }[] = [
  { id: "call", label: "Call", icon: Phone },
  { id: "hospital", label: "Hospital", icon: Hospital },
  { id: "medicine", label: "Medicine", icon: Pill },
];

/** The emergency panel opened by the floating panic button. */
export function PanicPanel({ onClose }: PanicPanelProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<Tab>("call");
  const countryCode = useDetectedCountry();
  const emergencyNumbers = getEmergencyNumbers(countryCode);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[110] flex items-end justify-center bg-foreground/40 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="panic-panel-title"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-surface shadow-card sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 id="panic-panel-title" className="text-lg font-semibold text-foreground">
            Emergency help
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close emergency panel"
            className="rounded-lg p-1.5 text-muted transition-colors duration-200 hover:bg-foreground/5 hover:text-foreground"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {!isOnline && (
          <div className="flex items-center gap-2 bg-accent/10 px-5 py-2 text-xs font-medium text-accent">
            <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
            You're offline. Call features and cached data still work.
          </div>
        )}

        <div className="flex border-b border-border" role="tablist">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors duration-200 ${
                  isActive
                    ? "border-b-2 border-danger text-danger"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === "call" && (
            <section>
              <h3 className="text-sm font-semibold text-foreground">
                Call for help ({emergencyNumbers.countryLabel})
              </h3>
              <ul className="mt-3 space-y-2">
                {emergencyNumbers.contacts.map((contact) => (
                  <li key={contact.label}>
                    <a
                      href={`tel:${contact.number}`}
                      className="flex items-center justify-between rounded-lg border border-border p-3 text-sm transition-colors duration-200 hover:bg-danger/5"
                    >
                      <span className="font-medium text-foreground">{contact.label}</span>
                      <span className="rounded-full bg-danger px-3 py-1 text-xs font-semibold text-white">
                        Call {contact.number}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
              {countryCode === null && (
                <p className="mt-2 text-xs text-muted">
                  Couldn't detect your country — showing a generic number. Verify the local
                  emergency number if possible.
                </p>
              )}
            </section>
          )}

          {activeTab === "hospital" && <HospitalFinder />}

          {activeTab === "medicine" && <MedicineGuidance />}
        </div>

        <p className="border-t border-border px-5 py-3 text-center text-xs text-muted">
          This is decision support, not a replacement for emergency services or medical
          professionals. In immediate danger, call your local emergency number first.
        </p>
      </div>
    </div>
  );
}
