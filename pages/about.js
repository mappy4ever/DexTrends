// pages/about.js
import DashboardAbout from "../components/DashboardAbout";
import FAQ from "../components/FAQ";
import Layout from "../components/Layout"; // Assuming Layout provides overall page structure

export default function AboutPage() { // Renamed component function for clarity
  return (
    // Layout component should handle global padding, background etc.
    // This div applies page-specific max-width and vertical spacing.
    // section-spacing-y-default provides py-8 md:py-12
    // container class centers and applies horizontal padding based on tailwind.config.js
    <div className="container section-spacing-y-default">
      <div className="space-y-16 md:space-y-20"> {/* Increased space between About and FAQ sections */}
        <DashboardAbout />
        <FAQ />
      </div>
    </div>
  );
}