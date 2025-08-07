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
import "../styles/battle-simulator.css";
import "../styles/tcg-set-detail.css";
import "../styles/card-performance.css";
import "../styles/pokedex-redesign.css";
import "../styles/pokeid-premium.css";
import "../styles/performance.css";
import "../styles/holographic-cards.css";
import "../components/typebadge.css";
import Layout from "../components/layout/Layout";
import logger from "../utils/logger";
import ErrorBoundary from "../components/layout/ErrorBoundary";
import { AnimatePresence, motion } from "framer-motion";
import { PageTransition } from "../components/ui/animations/AnimationSystem";
import { UnifiedAppProvider } from '../context/UnifiedAppContext';
import GlobalErrorHandler from '../components/GlobalErrorHandler';
import { PWAProvider } from '../components/pwa/PWAProvider';
import { pageVariants, defaultTransition, getRouteTransition, prefersReducedMotion } from '../utils/pageTransitions';

// Initialize cache warming on server startup
if (typeof window === 'undefined') {
  import('../lib/initialize-cache-warming').catch(err => {
    logger.error('[App] Failed to initialize cache warming:', err);
  });
}

// Import critical providers directly to avoid context errors
import { NotificationProvider } from '../components/qol/NotificationSystem';
import { ContextualHelpProvider } from '../components/qol/ContextualHelp';
import { PreferencesProvider } from '../components/qol/UserPreferences';

// Toast system imports
import { ToastProvider } from '../components/providers/ToastProvider';

// Enhanced dynamic imports with comprehensive loading
import dynamic from 'next/dynamic';
import { initializeFeatureFlags, isFeatureEnabled } from '../utils/featureFlags';

// Create stable references for dynamic imports to improve Fast Refresh
const dynamicImports = {
  SimpleBackToTop: () => import('../components/ui/SimpleBackToTop').catch(() => ({ default: () => null })),
  AccessibilityProvider: () => import('../components/ui/AccessibilityProvider').catch(() => ({ default: ({ children }: any) => children })),
  KeyboardShortcutsManager: () => import('../components/qol/KeyboardShortcuts').catch(() => ({ default: () => null })),
  PushNotifications: () => import('../components/mobile/PushNotifications').catch(() => ({ default: () => null })),
  GlobalSearchShortcuts: () => import('../components/qol/GlobalSearchShortcuts').catch(() => ({ default: () => null })),
  PreferencesManager: () => import('../components/qol/PreferencesManager').catch(() => ({ default: () => null })),
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

// Test Supabase connection on app start (development only)
// COMMENTED OUT: This was causing app startup to hang at "ready"
/*
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  import('@/utils/supabase').then(({ testSupabaseConnection }) => {
    testSupabaseConnection().then(result => {
      if (result.success) {
        console.log('[App] Supabase connection test:', result.message);
      } else {
        console.error('[App] Supabase connection test failed:', result.error);
      }
    });
  }).catch(err => {
    console.error('[App] Failed to load Supabase test:', err);
  });
}
*/

// Enhanced Page Transition Component
interface EnhancedPageTransitionProps {
  children: React.ReactNode;
  pathname: string;
}

const EnhancedPageTransition: React.FC<EnhancedPageTransitionProps> = ({ children, pathname }) => {
  const routeTransition = getRouteTransition(pathname);
  const variants = pageVariants[routeTransition.type];
  const reducedMotion = prefersReducedMotion();

  if (reducedMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={variants}
      transition={defaultTransition}
      style={{ width: '100%', height: '100%' }}
    >
      {children}
    </motion.div>
  );
};

// Simple throttle function with proper cleanup
const throttle = <T extends (...args: any[]) => any>(func: T, limit: number): T => {
  let inThrottle: boolean = false;
  let timer: NodeJS.Timeout | null = null;
  
  const throttledFunc = function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      timer = setTimeout(() => {
        inThrottle = false;
        timer = null;
      }, limit);
    }
  } as T;
  
  // Add cleanup method
  (throttledFunc as any).cleanup = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    inThrottle = false;
  };
  
  return throttledFunc;
};

// Scroll handler state and callbacks
let scrollTimer: NodeJS.Timeout;
let scrollHandlerIsScrolling = false;
let scrollStateSetters: {
  setIsScrolling?: React.Dispatch<React.SetStateAction<boolean>>;
} = {};

// Scroll handler object to avoid function detection issues
const scrollHandlerUtils = {
  handleScroll: () => {
    if (!scrollHandlerIsScrolling) {
      document.body.classList.add('is-scrolling');
      scrollStateSetters.setIsScrolling?.(true);
      scrollHandlerIsScrolling = true;
    }
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      document.body.classList.remove('is-scrolling');
      scrollStateSetters.setIsScrolling?.(false);
      scrollHandlerIsScrolling = false;
    }, 150);
  },
  cleanup: () => {
    clearTimeout(scrollTimer);
    scrollStateSetters = {};
  }
};

interface MyAppProps extends AppProps {
  Component: AppProps['Component'] & {
    fullBleed?: boolean;
  };
}

// Extracted component to fix Fast Refresh nested component issue
interface AppContentProps {
  Component: MyAppProps['Component'];
  pageProps: any;
  fullBleed?: boolean;
  isClient: boolean;
  nextRouterPath: string;
}

const AppContent: React.FC<AppContentProps> = ({ 
  Component, 
  pageProps, 
  fullBleed, 
  isClient,
  nextRouterPath 
}) => {
  return (
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
        
        <UnifiedAppProvider>
          <ToastProvider>
            <NotificationProvider>
              <ContextualHelpProvider>
                <PreferencesProvider>
                <Layout fullBleed={fullBleed}>
                  <AnimatePresence mode="wait" initial={false}>
                    <EnhancedPageTransition pathname={nextRouterPath} key={nextRouterPath}>
                      <Component {...pageProps} />
                    </EnhancedPageTransition>
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
          </ToastProvider>
        </UnifiedAppProvider>
      </PWAProvider>
    </>
  );
};

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
    // Store state setter in external object to avoid nested functions
    scrollStateSetters.setIsScrolling = setIsScrolling;
    
    // Use passive event listener for better performance
    window.addEventListener('scroll', scrollHandlerUtils.handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', scrollHandlerUtils.handleScroll);
      scrollHandlerUtils.cleanup();
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

  // Wrap non-error pages with ErrorBoundary
  return (
    <ErrorBoundary>
      <AppContent 
        Component={Component}
        pageProps={pageProps}
        fullBleed={Component.fullBleed}
        isClient={isClient}
        nextRouterPath={nextRouter.asPath}
      />
    </ErrorBoundary>
  );
}


// Removed getInitialProps to prevent refresh loops and improve performance

export default MyApp;