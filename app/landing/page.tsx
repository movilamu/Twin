import { SiteNav } from "@/components/features/site-nav";
import { HeroSection } from "@/components/features/hero-section";
import { HowItWorksSection } from "@/components/features/how-it-works-section";
import { FeatureHighlights } from "@/components/features/feature-highlights";
import { CTASection } from "@/components/features/cta-section";
import { SiteFooter } from "@/components/features/site-footer";

export default function LandingPage(): JSX.Element {
  return (
    <>
      <SiteNav />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <FeatureHighlights />
        <CTASection />
      </main>
      <SiteFooter />
    </>
  );
}
