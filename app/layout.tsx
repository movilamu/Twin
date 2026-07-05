import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PanicButton } from "@/components/features/panic-button";
import { PrivacyNotice } from "@/components/features/privacy-notice";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Twin | Household Disaster Resilience",
  description:
    "See how your specific home responds to floods, quakes, and outages — and know exactly what to fix first.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        {children}
        <PanicButton />
        <PrivacyNotice />
      </body>
    </html>
  );
}
