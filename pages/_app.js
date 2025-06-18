import { useEffect } from "react";
import dynamic from "next/dynamic";
import "../styles/globals.css";
import "react-datepicker/dist/react-datepicker.css";
import Layout from "../components/layout/layout";
import ErrorBoundary from "../components/layout/errorboundary";
import "../components/cardfeatures.css";
import "../components/typebadge.css";

// Dynamic imports for framer-motion to reduce initial bundle size
const AnimatePresence = dynamic(
  () => import("framer-motion").then((mod) => ({ default: mod.AnimatePresence })),
  { ssr: false }
);

const MotionDiv = dynamic(
  () => import("framer-motion").then((mod) => ({ default: mod.motion.div })),
  { 
    ssr: false,
    loading: () => <div className="min-h-screen" /> // Fallback while loading
  }
);

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
    
    // Load our navigation fix as early as possible to ensure all clicks are properly handled
    const loadNavigationFix = () => {
      console.log('Loading navigation fix script from _app.js');
      
      // Check if script already exists
      if (document.querySelector('script[src="/js/fix-navigation.js"]')) {
        console.log('Fix script already loaded, skipping');
        return;
      }
      
      // Create and load the script
      const script = document.createElement('script');
      script.src = '/js/fix-navigation.js';
      script.async = true;
      script.id = 'navigation-fix-script';
      script.onload = () => console.log('Navigation fix script loaded successfully');
      script.onerror = (e) => console.error('Error loading navigation fix script:', e);
      
      // Append to head for earlier execution
      document.head.appendChild(script);
    };
    
    // Load right away
    loadNavigationFix();
    
    // Also run on route changes in Next.js to ensure script runs
    // after client-side navigations
    router.events.on('routeChangeComplete', loadNavigationFix);
    
    return () => {
      window.removeEventListener("scroll", throttledScrollHandler);
      router.events.off('routeChangeComplete', loadNavigationFix);
      
      // No need to clean up the script as it should persist across pages
    };
  }, [router.events]);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <FavoritesProvider>
          <ViewSettingsProvider>
            <SortingProvider>
              <ModalProvider>
                  <Layout>
                    <AnimatePresence mode="wait" initial={false}>
                      <MotionDiv
                        key={router.route}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -24 }}
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                        className="min-h-screen"
                      >
                        <Component {...pageProps} />
                      </MotionDiv>
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