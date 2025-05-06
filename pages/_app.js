// pages/_app.js
import { useEffect } from "react";
import "../styles/globals.css";
import "react-datepicker/dist/react-datepicker.css";
import Layout from "../components/Layout";
import ThemeProvider from "../components/ThemeProvider"; // Assuming this component exists and is correctly set up
import ErrorBoundary from "../components/ErrorBoundary";

// Simple throttle function
const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    const handleScroll = () => {
      const headings = document.querySelectorAll(".parallax-heading");
      headings.forEach((heading) => {
        // Ensure heading is in viewport before calculating to potentially save some computation
        const rect = heading.getBoundingClientRect();
        if (rect.bottom >= 0 && rect.top <= window.innerHeight) {
          const scrollAmount = Math.max(0, (window.innerHeight - rect.top) * 0.08); // Adjust speed
          heading.style.transform = `translateY(${scrollAmount}px)`;
          heading.style.opacity = Math.max(0, 1 - scrollAmount * 0.015).toString(); // Ensure opacity is not negative
        }
      });
    };

    // Throttle the scroll handler to run at most once every 100ms
    const throttledScrollHandler = throttle(handleScroll, 100);

    window.addEventListener("scroll", throttledScrollHandler);
    return () => window.removeEventListener("scroll", throttledScrollHandler);
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider> {/* Assuming ThemeProvider manages its own error states or is simple enough */}
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default MyApp;