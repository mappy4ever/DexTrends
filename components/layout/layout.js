// components/Layout.js
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from "@vercel/speed-insights/next";
import Navbar from "../Navbar"; // Updated path
import Footer from "../Footer"; // Updated path
import React from "react"; // Ensuring React is imported if it was implicitly used or for good practice

export default function Layout({ children }) {
  return (
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
  );
}