import Document, { Html, Head, Main, NextScript, DocumentContext, DocumentInitialProps } from 'next/document';

class MyDocument extends Document {
  static override async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps> {
    const initialProps = await Document.getInitialProps(ctx);
    return initialProps;
  }

  override render() {
    return (
      <Html lang="en">
        <Head>
          {/* PWA Meta Tags */}
          <meta name="application-name" content="DexTrends" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="DexTrends" />
          <meta name="description" content="Track Pokemon TCG card prices, market trends, and build your collection with real-time data and analytics." />
          <meta name="format-detection" content="telephone=no" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="msapplication-TileColor" content="#3b82f6" />
          <meta name="msapplication-tap-highlight" content="no" />
          <meta name="theme-color" content="#3b82f6" />

          {/* Viewport removed from _document.js - handled by Next.js automatically */}
          
          {/* PWA Manifest */}
          <link rel="manifest" href="/manifest.json" />
          
          {/* Icons */}
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon.ico" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon.ico" />
          <link rel="apple-touch-icon" href="/dextrendslogo.png" />
          <link rel="apple-touch-icon" sizes="152x152" href="/dextrendslogo.png" />
          <link rel="apple-touch-icon" sizes="180x180" href="/dextrendslogo.png" />
          <link rel="apple-touch-icon" sizes="167x167" href="/dextrendslogo.png" />

          {/* Open Graph / Social Media */}
          <meta property="og:type" content="website" />
          <meta property="og:title" content="DexTrends - Pokemon TCG Price Tracker" />
          <meta property="og:description" content="Track Pokemon TCG card prices, market trends, and build your collection with real-time data and analytics." />
          <meta property="og:site_name" content="DexTrends" />
          <meta property="og:image" content="/dextrendslogo.png" />

          {/* Twitter Card */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="DexTrends - Pokemon TCG Price Tracker" />
          <meta name="twitter:description" content="Track Pokemon TCG card prices, market trends, and build your collection with real-time data and analytics." />
          <meta name="twitter:image" content="/dextrendslogo.png" />

          {/* Performance and SEO */}
          <link rel="preconnect" href="https://api.pokemontcg.io" />
          <link rel="preconnect" href="https://images.pokemontcg.io" />
          <link rel="dns-prefetch" href="https://api.pokemontcg.io" />
          <link rel="dns-prefetch" href="https://images.pokemontcg.io" />
          
          {/* Google Fonts - Montserrat Black for Pokémon names */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link 
            href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap" 
            rel="stylesheet" 
          />
          
          {/* Navigation fix script DISABLED - was causing refresh loops */}

          {/* Structured Data */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebApplication",
                "name": "DexTrends",
                "description": "Track Pokemon TCG card prices, market trends, and build your collection with real-time data and analytics.",
                "applicationCategory": "GameApplication",
                "operatingSystem": "All",
                "browserRequirements": "Requires JavaScript. Requires HTML5.",
                "softwareVersion": "1.0.0",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD"
                }
              })
            }}
          />
          {/* Theme initialization script to prevent flash */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  try {
                    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
                      const theme = localStorage.getItem('theme');
                      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                      const activeTheme = theme || systemTheme;
                      
                      if (activeTheme === 'dark') {
                        document.documentElement.classList.add('dark');
                      }
                    }
                  } catch (e) {
                    // Theme detection failed, default to light mode
                  }
                })();
              `
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
          {/* Navigation fix script loading DISABLED - was causing refresh loops */}
        </body>
      </Html>
    );
  }
}

export default MyDocument;