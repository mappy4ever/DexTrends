import AboutSection from "../components/AboutSection";
import FAQ from "../components/FAQ";
import HeroSection from "../components/HeroSection";

export default function About() {
  return (
    <div>
      {/* Hero Section */}
      <HeroSection
        title="Our Approach"
        subtitle="Empowering Businesses with Insights."
        description="Learn more about us."
        backgroundImage="/about-hero.jpg"
      />

      <div className="max-w-7xl mx-auto p2-2 md:px-4 py-4 md:py-12 space-y-12">
        <AboutSection />
        <FAQ />
      </div>
    </div>
  );
}
