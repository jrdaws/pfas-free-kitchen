import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { FeatureCards } from "@/components/FeatureCards";
import { PricingTable } from "@/components/PricingTable";
import { Testimonials } from "@/components/Testimonials";
import { FAQ } from "@/components/FAQ";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-900">
      <Nav projectName="test-t19" />
      <Hero
        title="Build Something Amazing"
        subtitle="Your next-generation solution for building amazing products with AI-assisted development."
        ctaText="Get Started Free"
        ctaHref="/signup"
        ctaSecondaryText="View Pricing"
        ctaSecondaryHref="#pricing"
      />
      <FeatureCards />
      <PricingTable />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer projectName="test-t19" />
    </main>
  );
}
