import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          {/* Add any global styles, meta tags, or scripts here */}
          
          {/* Google Fonts - Montserrat Black for Pokémon names */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
          <link 
            href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap" 
            rel="stylesheet" 
          />
          
          {/* Preload the navigation fix script for faster loading */}
          <link 
            rel="preload" 
            href="/js/fix-navigation.js" 
            as="script" 
            importance="high" 
          />
        </Head>
        <body>
          <Main />
          <NextScript />
          {/* Inline script to ensure navigation fix is loaded as early as possible */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  // Load navigation fix script as early as possible
                  var script = document.createElement('script');
                  script.src = '/js/fix-navigation.js';
                  script.id = 'navigation-fix-script';
                  document.head.appendChild(script);
                })();
              `,
            }}
          />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
