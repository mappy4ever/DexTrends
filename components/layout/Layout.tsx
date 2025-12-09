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
 * - CSS var --navbar-offset: Accounts for safe area + navbar height (defined in globals.css)
 * - pb-20 sm:pb-0: Bottom padding for mobile BottomNav, none on desktop
 * - px-safe: Safe area horizontal padding for devices with rounded corners/notches
 *
 * IMPORTANT: Navbar height is 56px (mobile) / 64px (desktop) PLUS safe-area-inset-top on iOS
 */
export default function Layout({ children, fullBleed = false }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen text-card-foreground transition-colors duration-300 relative px-safe">
      <Navbar />
      <div className="flex flex-col flex-grow relative z-10">
        <main
          className="flex-grow transition-all duration-300"
          style={fullBleed ? undefined : {
            paddingTop: 'var(--navbar-offset-mobile)',
          }}
        >
          {/* Desktop override for navbar height - uses CSS variables from globals.css */}
          {!fullBleed && (
            <style jsx>{`
              @media (min-width: 768px) {
                main {
                  padding-top: var(--navbar-offset-desktop) !important;
                }
              }
            `}</style>
          )}
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