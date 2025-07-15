import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import "../styles/globals.css";
import "../styles/unified-mobile.css";
import "../styles/ios-scrolling-fix.css";
import "../styles/desktop-tabs.css";
import "../styles/pokemon-animations.css";
import "../styles/design-system.css";
import "../styles/animations.css";
import "../styles/card-types.css";
import "../components/typebadge.css";
import Layout from "../components/layout/Layout";
import ErrorBoundary from "../components/layout/ErrorBoundary";
import { PageTransition } from "../components/ui/animations/animations";
import { UnifiedAppProvider } from '../context/UnifiedAppContext';
import GlobalErrorHandler from '../components/GlobalErrorHandler';

// Enhanced dynamic imports with comprehensive loading
import dynamic from 'next/dynamic';
import { initializeFeatureFlags, isFeatureEnabled } from '../utils/featureFlags';

// Safe components - only load confirmed existing ones
const SimpleBackToTop = dynamic(() => import('../components/ui/SimpleBackToTop'), {
  ssr: false,
  loading: () => <div className="fixed bottom-4 right-4 w-12 h-12" />
});

// Core UX components that should be safe
const AccessibilityProvider = dynamic(() => import('../components/ui/AccessibilityProvider'), {
  ssr: false,
  loading: () => <div />
});

const UnifiedLoadingScreen = dynamic(() => import('../components/ui/loading/UnifiedLoadingScreen'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50" />
});

const PokemonLoadingScreen = dynamic(() => import('../components/ui/loading/PokemonLoadingScreen'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50" />
});

// Simple throttle function
const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

function MyApp({ Component, pageProps, router }) {
  const nextRouter = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [featuresEnabled, setFeaturesEnabled] = useState({});
  const [isScrolling, setIsScrolling] = useState(false);
  
  // EMERGENCY: Minimal initialization only
  useEffect(() => {
    setIsClient(true);
    
    // Apply iOS-specific fixes
    import('../utils/iosFixes').then(({ applyIOSFixes }) => {
      applyIOSFixes();
    }).catch(err => {
      console.warn('iOS fixes failed to load:', err);
    });
    
    // iOS scroll performance optimization
    let scrollTimer;
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
  }, []); // Remove isScrolling dependency to prevent re-renders

  return (
    <ErrorBoundary>
      <GlobalErrorHandler />
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
        <Layout fullBleed={Component.fullBleed}>
          <PageTransition key={nextRouter.asPath}>
            <Component {...pageProps} />
          </PageTransition>
          
          {/* EMERGENCY: All enhancements disabled to stop refresh loop */}
        </Layout>
      </UnifiedAppProvider>
    </ErrorBoundary>
  );
}


// Removed getInitialProps to prevent refresh loops and improve performance

export default MyApp;