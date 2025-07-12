// components/Layout.js
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from "@vercel/speed-insights/next";
import Navbar from "../Navbar"; // Updated path
import Footer from "../Footer"; // Updated path
import React from "react"; // Ensuring React is imported if it was implicitly used or for good practice

export default function Layout({ children, fullBleed = false }) {
  return (
    <div className="flex flex-col min-h-screen text-card-foreground transition-colors duration-300 relative">
      {/* Removed glassy, layered background effect overlay */}
      <Navbar />
      <div className="flex flex-grow relative z-10">
        <main className={`flex-grow transition-all duration-300 ${fullBleed ? '' : 'pt-20 pb-10 px-4 md:px-6 lg:px-8'}`}>
          <div className="max-w-full mx-auto">
            {children}
          </div>
          {/* Vercel Analytics and Speed Insights re-enabled */}
          <Analytics />
          <SpeedInsights />
        </main>
      </div>
      <Footer />
    </div>
  );
}