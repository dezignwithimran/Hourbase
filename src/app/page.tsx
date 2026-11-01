import type { Metadata } from "next";
import {
  AnalyticsSection,
  ClientsProjectsSection,
  EarningsShowcaseSection,
  FAQSection,
  FeaturesSection,
  FinalCTASection,
  HeroSection,
  HowItWorksSection,
  PricingSection,
  ProblemSection,
  ProductShowcaseSection,
  SocialProofSection,
  TimerShowcaseSection,
} from "@/components/marketing/sections";
import { Footer, Navbar } from "@/components/marketing/shared";

export const metadata: Metadata = {
  title: { absolute: "Hourbase — Track your time. Know your worth." },
  description:
    "Hourbase makes it simple to track billable hours, manage projects, and understand exactly where your time and income go.",
};

export default function HomePage() {
  return (
    <div className="marketing-site">
      <Navbar />
      <main>
        <HeroSection />
        <SocialProofSection />
        <ProblemSection />
        <FeaturesSection />
        <ProductShowcaseSection />
        <TimerShowcaseSection />
        <EarningsShowcaseSection />
        <ClientsProjectsSection />
        <HowItWorksSection />
        <AnalyticsSection />
        <PricingSection />
        <FAQSection />
        <FinalCTASection />
      </main>
      <Footer />
    </div>
  );
}
