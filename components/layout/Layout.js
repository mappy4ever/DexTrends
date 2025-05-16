// components/Layout.js
import { useState } from "react";
import Navbar from "../Navbar"; // Assuming Navbar component exists
import Footer from "../Footer"; // Assuming Footer component exists
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function Layout({ children }) {
  // Manages the collapsed state of the Navbar.
  // This state is internal to the Layout and its direct child Navbar.
  // If other components outside Layout needed to control or react to this state,
  // a more global state management solution (like Context API or Zustand/Redux) might be considered.
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-background text-card-foreground transition-colors duration-300">
	  {/* Navbar is rendered here. It contains both mobile fixed top bar and desktop fixed sidebar */}
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
	  <div className="flex flex-grow"> {/* This div ensures Navbar and main content are side-by-side */}
      <main
        className={`flex-grow transition-all duration-300 pt-14 pb-10 md:pt-0 ${
			isCollapsed ? 'md:ml-16' : 'md:ml-64'}
			`}
      >
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