// components/Layout.tsx
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from "@vercel/speed-insights/next";
import Navbar from "../Navbar";
import Footer from "../Footer";
import React, { ReactNode } from "react";
import BottomNavigation from '../ui/BottomNavigation';

interface LayoutProps {
  children: ReactNode;
  fullBleed?: boolean;
}

/**
 * Main layout component that wraps all pages with navbar and footer
 * Includes Vercel Analytics and Speed Insights for performance monitoring
 *
 * Padding strategy:
 * - pt-14/pt-16: Space for fixed navbar (56px mobile, 64px desktop)
 * - pb-20 sm:pb-0: Bottom padding for mobile BottomNav, none on desktop
 */
export default function Layout({ children, fullBleed = false }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen text-card-foreground transition-colors duration-300 relative">
      <Navbar />
      <div className="flex flex-col flex-grow relative z-10">
        <main className={`flex-grow transition-all duration-300 ${fullBleed ? '' : 'pt-14 md:pt-16'}`}>
          {fullBleed ? (
            children
          ) : (
            <div className="max-w-full mx-auto pb-20 sm:pb-6">
              {children}
            </div>
          )}
          {/* Vercel Analytics and Speed Insights */}
          <Analytics />
          <SpeedInsights />
        </main>
      </div>
      <Footer />
      {/* Bottom navigation for mobile - handles its own spacer */}
      <BottomNavigation />
    </div>
  );
}