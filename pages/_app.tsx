import { useEffect, useState } from "react";
import type { AppProps } from 'next/app';
import Head from "next/head";
import { useRouter, NextRouter } from "next/router";
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
import { PageTransition } from "../components/layout/PageTransition";
import { UnifiedAppProvider } from '../context/UnifiedAppContext';
import GlobalErrorHandler from '../components/GlobalErrorHandler';
import { PWAProvider } from '../components/pwa/PWAProvider';
import { scrollHandlerUtils } from '../utils/scrollHandler';

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
// Modal system imports
import { ModalProvider } from '../components/ui/AdvancedModalSystem';

// Enhanced dynamic imports with comprehensive loading
import dynamic from 'next/dynamic';

// Create stable references for dynamic imports to improve Fast Refresh
const dynamicImports = {
  SimpleBackToTop: () => import('../components/ui/SimpleBackToTop').catch(() => ({ default: () => null })),
  AccessibilityProvider: () => import('../components/ui/AccessibilityProvider').catch(() => ({ default: ({ children }: { children: React.ReactNode }) => children })),
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

interface MyAppProps extends AppProps {
  Component: AppProps['Component'] & {
    fullBleed?: boolean;
  };
}

// Extracted component to fix Fast Refresh nested component issue
interface AppContentProps {
  Component: MyAppProps['Component'];
  pageProps: Record<string, unknown>;
  fullBleed?: boolean;
  isClient: boolean;
  router: NextRouter;
}

const AppContent: React.FC<AppContentProps> = ({ 
  Component, 
  pageProps, 
  fullBleed, 
  isClient,
  router 
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
            <ModalProvider>
              <NotificationProvider>
                <ContextualHelpProvider>
                  <PreferencesProvider>
                  <Layout fullBleed={fullBleed}>
                    <PageTransition>
                      <Component {...pageProps} />
                    </PageTransition>
                  
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
            </ModalProvider>
          </ToastProvider>
        </UnifiedAppProvider>
      </PWAProvider>
    </>
  );
};

function MyApp({ Component, pageProps, router }: MyAppProps) {
  const nextRouter = useRouter();
  const [isClient, setIsClient] = useState(false);
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
    scrollHandlerUtils.setStateSetters({ setIsScrolling });
    
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
    logger.debug('Rendering error page with minimal wrapper:', { pathname: router.pathname });
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
        router={nextRouter}
      />
    </ErrorBoundary>
  );
}

export default MyApp;