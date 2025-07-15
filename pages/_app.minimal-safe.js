import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import "../styles/globals.css";
import "../styles/unified-mobile.css";
import "../styles/pokemon-animations.css";
import "../styles/design-system.css";
import "../components/typebadge.css";
import Layout from "../components/layout/Layout";
import ErrorBoundary from "../components/layout/ErrorBoundary";

import UnifiedAppProvider from '../context/UnifiedAppContext';

function MyApp({ Component, pageProps, router }) {
  const nextRouter = useRouter();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <ErrorBoundary>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
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
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </UnifiedAppProvider>
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