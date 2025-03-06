import { useEffect } from "react";
import "../styles/globals.css";
import Layout from "../components/Layout";
import CallToActionButton from "../components/CallToActionButton";
import ThemeProvider from "../components/ThemeProvider";

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    const handleScroll = () => {
      const headings = document.querySelectorAll(".parallax-heading");
      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect();
        const scrollAmount = Math.max(0, window.innerHeight - rect.top) * 0.08; // Adjust speed
        heading.style.transform = `translateY(${scrollAmount}px)`;
        heading.style.opacity = 1 - scrollAmount * 0.015; // Adds a fade effect
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <ThemeProvider>
      <Layout>
        <Component {...pageProps} />
        <div className="fixed bottom-8 right-8 z-50">
          <CallToActionButton />
        </div>
      </Layout>
    </ThemeProvider>
  );
}

export default MyApp;
