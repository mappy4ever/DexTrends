import { useEffect } from "react";
import "../styles/globals.css";
import "react-datepicker/dist/react-datepicker.css";
import Layout from "../components/layout/Layout";
import ThemeProvider from "../components/layout/ThemeProvider"; // Assuming this component exists and is correctly set up
import ErrorBoundary from "../components/layout/ErrorBoundary";
import "../components/cardfeatures.css";

import { ModalProvider } from '../context/ModalContext';
import GlobalModal from '../components/GlobalModal';

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
      const headings = document.querySelectorAll(".parallax-heading"); // Class used for JS targeting
      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect();
        // Check if element is in viewport or close to it
        if (rect.bottom >= -window.innerHeight && rect.top <= 2 * window.innerHeight) { // Expanded check
          const scrollAmount = Math.max(0, (window.innerHeight - rect.top) * 0.08);
          // Apply transform and opacity directly for parallax effect
          // Tailwind classes for this dynamic effect are less suitable here due to per-pixel updates
          heading.style.transform = `translateY(${scrollAmount}px)`;
          heading.style.opacity = Math.max(0, 1 - scrollAmount * 0.015).toString();
        }
      });
    };

    const throttledScrollHandler = throttle(handleScroll, 50); // Reduced throttle time for smoother parallax

    window.addEventListener("scroll", throttledScrollHandler);
    return () => window.removeEventListener("scroll", throttledScrollHandler);
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider> {/* Custom ThemeProvider */}
        <ModalProvider>
          <Layout>
            <Component {...pageProps} />
            <GlobalModal />
          </Layout>
        </ModalProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}


MyApp.getInitialProps = async (appContext) => {
  const pageProps = appContext.Component.getInitialProps
    ? await appContext.Component.getInitialProps(appContext.ctx)
    : {};
  return { pageProps };
};

export default MyApp;