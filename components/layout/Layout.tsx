// components/Layout.tsx
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from "@vercel/speed-insights/next";
import Navbar from "../Navbar";
import Footer from "../Footer";
import React, { ReactNode } from "react";
import dynamic from 'next/dynamic';
import ComparisonFAB from '../ui/ComparisonFAB';

// Dynamically import MobileNavigation to avoid SSR issues
const MobileNavigation = dynamic(() => import('../mobile/MobileNavigation'), {
  ssr: false
});

// Dynamically import TouchGestures for mobile interactions
const TouchGestures = dynamic(() => import('../mobile/TouchGestures'), {
  ssr: false
});

// Dynamically import MobileIntegration for mobile platform features
const MobileIntegration = dynamic(() => import('../mobile/MobileIntegration'), {
  ssr: false
});

interface LayoutProps {
  children: ReactNode;
  fullBleed?: boolean;
}

/**
 * Main layout component that wraps all pages with navbar and footer
 * Includes Vercel Analytics and Speed Insights for performance monitoring
 */
export default function Layout({ children, fullBleed = false }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen text-card-foreground transition-colors duration-300 relative">
      {/* Mobile integration wrapper for mobile features */}
      <MobileIntegration>
        {/* Touch gestures for mobile interactions */}
        <TouchGestures>
          {/* Removed glassy, layered background effect overlay */}
          <Navbar />
          <div className="flex flex-col flex-grow relative z-10">
            <main className={`flex-grow transition-all duration-300 ${fullBleed ? '' : 'pt-20'}`}>
              {fullBleed ? (
                children
              ) : (
                <div className="max-w-full mx-auto pb-20">
                  {children}
                </div>
              )}
              {/* Mobile bottom padding spacer */}
              <div className="md:hidden h-16" />
              {/* Vercel Analytics and Speed Insights re-enabled */}
              <Analytics />
              <SpeedInsights />
            </main>
          </div>
          <Footer />
          {/* Mobile Navigation - only shown on mobile */}
          <MobileNavigation />
          {/* Floating comparison button */}
          <ComparisonFAB />
        </TouchGestures>
      </MobileIntegration>
    </div>
  );
}