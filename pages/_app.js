import { useEffect } from "react";
import "../styles/globals.css";
import "react-datepicker/dist/react-datepicker.css";
import Layout from "../components/layout/layout";
import ErrorBoundary from "../components/layout/errorboundary";
import "../components/cardfeatures.css";
import { AnimatePresence, motion } from "framer-motion";

import { ThemeProvider } from '../context/themecontext';
import { FavoritesProvider } from '../context/favoritescontext';
import { ViewSettingsProvider } from '../context/viewsettingscontext';
import { ModalProvider } from '../context/modalcontext';
import { SortingProvider } from '../context/sortingcontext';
import GlobalModal from '../components/GlobalModal'; // Updated path

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

function MyApp({ Component, pageProps, router }) {
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
      <ThemeProvider>
        <FavoritesProvider>
          <ViewSettingsProvider>
            <SortingProvider>
              <ModalProvider>
                  <Layout>
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={router.route}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -24 }}
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                        className="min-h-screen"
                      >
                        <Component {...pageProps} />
                      </motion.div>
                    </AnimatePresence>
                    <GlobalModal />
                  </Layout>
                </ModalProvider>
              </SortingProvider>
            </ViewSettingsProvider>
          </FavoritesProvider>
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