import { useEffect, useState } from "react";
import type { AppProps } from 'next/app';
import Head from "next/head";
import { useRouter } from "next/router";
import "../styles/globals.css";
import "../styles/unified-mobile.css";
import "../styles/ios-scrolling-fix.css";
import "../styles/desktop-tabs.css";
import "../styles/responsive-breakpoint-fixes.css";
import "../styles/pokemon-animations.css";
import "../styles/design-system.css";
import "../styles/animations.css";
import "../styles/card-types.css";
import "../styles/unified-components.css";
import "../components/typebadge.css";
import Layout from "../components/layout/Layout";
import logger from "../utils/logger";
import ErrorBoundary from "../components/layout/ErrorBoundary";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "../components/ui/animations/AnimationSystem";
import { UnifiedAppProvider } from '../context/UnifiedAppContext';
import GlobalErrorHandler from '../components/GlobalErrorHandler';
import { PWAProvider } from '../components/pwa/PWAProvider';

// Enhanced dynamic imports with comprehensive loading
import dynamic from 'next/dynamic';
import { initializeFeatureFlags, isFeatureEnabled } from '../utils/featureFlags';

// Create stable references for dynamic imports to improve Fast Refresh
const dynamicImports = {
  SimpleBackToTop: () => import('../components/ui/SimpleBackToTop'),
  AccessibilityProvider: () => import('../components/ui/AccessibilityProvider'),
  KeyboardShortcutsManager: () => import('../components/qol/KeyboardShortcuts'),
  PushNotifications: () => import('../components/mobile/PushNotifications'),
  GlobalSearchShortcuts: () => import('../components/qol/GlobalSearchShortcuts'),
  PreferencesManager: () => import('../components/qol/PreferencesManager'),
  NotificationProvider: () => import('../components/qol/NotificationSystem'),
  ContextualHelpProvider: () => import('../components/qol/ContextualHelp'),
  PreferencesProvider: () => import('../components/qol/UserPreferences'),
};

// Safe components - only load confirmed existing ones
const SimpleBackToTop = dynamic(dynamicImports.SimpleBackToTop, {
  ssr: false,
  loading: () => <div className="fixed bottom-4 right-4 w-12 h-12" />
});

// Core UX components that should be safe
const AccessibilityProvider = dynamic(dynamicImports.AccessibilityProvider, {
  ssr: false,
  loading: () => <div />
});

// Keyboard shortcuts manager
const KeyboardShortcutsManager = dynamic(dynamicImports.KeyboardShortcutsManager, {
  ssr: false,
  loading: () => null
});

// Mobile push notifications
const PushNotifications = dynamic(dynamicImports.PushNotifications, {
  ssr: false,
  loading: () => null
});

// Global search shortcuts with command palette
const GlobalSearchShortcuts = dynamic(dynamicImports.GlobalSearchShortcuts, {
  ssr: false,
  loading: () => null
});

// Preferences manager
const PreferencesManager = dynamic(dynamicImports.PreferencesManager, {
  ssr: false,
  loading: () => null
});

// QOL Component System
const NotificationProvider = dynamic(dynamicImports.NotificationProvider, {
  ssr: false,
  loading: () => null
});

const ContextualHelpProvider = dynamic(dynamicImports.ContextualHelpProvider, {
  ssr: false,
  loading: () => null
});

const PreferencesProvider = dynamic(dynamicImports.PreferencesProvider, {
  ssr: false,
  loading: () => null
});

// Simple throttle function
const throttle = <T extends (...args: any[]) => any>(func: T, limit: number): T => {
  let inThrottle: boolean = false;
  return (function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }) as T;
};

interface MyAppProps extends AppProps {
  Component: AppProps['Component'] & {
    fullBleed?: boolean;
  };
}

function MyApp({ Component, pageProps, router }: MyAppProps) {
  const nextRouter = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [featuresEnabled, setFeaturesEnabled] = useState<Record<string, boolean>>({});
  const [isScrolling, setIsScrolling] = useState(false);
  
  // Check if this is an error page
  // Error pages should not be wrapped in ErrorBoundary to prevent infinite loops
  // and to ensure they can render even if there are errors in the app
  const isErrorPage = router.pathname === '/404' || 
                     router.pathname === '/500' || 
                     router.pathname === '/_error';
  
  // EMERGENCY: Minimal initialization only
  useEffect(() => {
    setIsClient(true);
    
    // Apply iOS-specific fixes
    import('../utils/iosFixes').then(({ applyIOSFixes }) => {
      applyIOSFixes();
    }).catch(err => {
      logger.warn('iOS fixes failed to load', { error: err });
    });
    
    // iOS scroll performance optimization
    let scrollTimer: NodeJS.Timeout;
    const handleScroll = () => {
      if (!isScrolling) {
        document.body.classList.add('is-scrolling');
        setIsScrolling(true);
      }
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        document.body.classList.remove('is-scrolling');
        setIsScrolling(false);
      }, 150);
    };
    
    // Use passive event listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Remove isScrolling dependency to prevent re-renders

  // Create minimal content for error pages
  if (isErrorPage) {
    console.log('Rendering error page with minimal wrapper:', router.pathname);
    return (
      <>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover" />
          <meta name="theme-color" content="#dc2626" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Component {...pageProps} />
      </>
    );
  }

  // Create the main app content for non-error pages
  const appContent = (
    <>
      <GlobalErrorHandler />
      <PWAProvider>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover" />
          <meta name="theme-color" content="#dc2626" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="format-detection" content="telephone=no" />
          <link rel="preconnect" href="https://pokeapi.co" />
          <link rel="preconnect" href="https://api.pokemontcg.io" />
          <link rel="dns-prefetch" href="https://images.pokemontcg.io" />
          <link rel="prefetch" href="/back-card.png" />
          <link rel="manifest" href="/manifest.json" />
          <link rel="icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" href="/icon-192x192.png" />
          <meta name="description" content="Discover, track, and explore Pokémon TCG card prices and trends in a beautiful Pokédex-inspired experience." />
          <meta name="keywords" content="Pokemon, TCG, cards, prices, trends, pokedex, collection, trading cards" />
        </Head>
        
        {/* AccessibilityProvider disabled to stop refresh */}
        
        <UnifiedAppProvider>
          <NotificationProvider>
            <ContextualHelpProvider>
              <PreferencesProvider>
                <Layout fullBleed={Component.fullBleed}>
                  <AnimatePresence mode="wait" initial={false}>
                    <PageTransition key={nextRouter.asPath}>
                      <Component {...pageProps} />
                    </PageTransition>
                  </AnimatePresence>
                  
                  {/* QOL System Components */}
                  {isClient && (
                    <>
                      <KeyboardShortcutsManager />
                      <GlobalSearchShortcuts />
                      <PreferencesManager />
                      
                      {/* Mobile features */}
                      <PushNotifications />
                    </>
                  )}
                </Layout>
              </PreferencesProvider>
            </ContextualHelpProvider>
          </NotificationProvider>
        </UnifiedAppProvider>
      </PWAProvider>
    </>
  );

  // Wrap non-error pages with ErrorBoundary
  return <ErrorBoundary>{appContent}</ErrorBoundary>;
}


// Removed getInitialProps to prevent refresh loops and improve performance

export default MyApp;