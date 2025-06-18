// components/Layout.js
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from "@vercel/speed-insights/next";
import Navbar from "../Navbar"; // Assuming Navbar component exists
import Footer from "../Footer"; // Assuming Footer component exists

export default function Layout({ children }) {
  return (
    <div className="section-spacing-y-default max-w-[98vw] 2xl:max-w-[1800px] mx-auto px-2 sm:px-4 animate-fadeIn">
      <div className="flex flex-col min-h-screen text-card-foreground transition-colors duration-300 relative overflow-x-hidden">
        {/* Removed glassy, layered background effect overlay */}
        <Navbar />
        <div className="flex flex-grow relative z-10">
          <main className="flex-grow transition-all duration-300 pt-16 pb-10">
            {children}
            {/* Vercel Analytics and Speed Insights are good to have here for a full-app coverage. */}
            <Analytics />
            <SpeedInsights />
          </main>
        </div>
        <Footer />
      </div>
    </div>
  );
}