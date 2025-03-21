import { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function Layout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-background transition-colors duration-300">
      <div className="flex flex-grow">
        <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <main className={`flex-grow transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
          {children}
          <Analytics />
          <SpeedInsights />
        </main>
      </div>
      <Footer />
    </div>
  );
}
