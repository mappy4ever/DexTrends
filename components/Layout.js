import Navbar from "./Navbar";
import Footer from "./Footer";
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from "@vercel/speed-insights/next"

export default function Layout({ children }) {
  return (
    <div className="flex flex-col bg-background transition-colors duration-300">
      <Navbar />
      <main className="flex-grow h-min-screen">
		{children}
		<Analytics />
		<SpeedInsights />
	  </main>
      <Footer />
    </div>
  );
}
