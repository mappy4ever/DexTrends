// Navigation fix script - Enhanced version
(function() {
  // Log when the script initializes for debugging
  console.log('Navigation fix script loaded and waiting for DOM...');

  function applyNavigationFix() {
    console.log('Applying enhanced navigation fix...');

    // Fix navigation for all links - use capturing phase for improved reliability
    document.addEventListener('click', function(e) {
      console.log('Click detected on:', e.target.tagName, e.target.className);
      
      // Skip clicks on buttons or interactive elements that shouldn't navigate
      if (e.target.closest('button') || e.target.closest('[data-no-navigate]')) {
        console.log('Skipping interactive element click');
        return;
      }
      
      // Handle navbar links specifically
      const navbarLink = e.target.closest('[data-is-navbar="true"]');
      if (navbarLink && navbarLink.tagName === 'A' && navbarLink.getAttribute('href')) {
        e.preventDefault();
        const href = navbarLink.getAttribute('href');
        console.log('Forcing navbar navigation to:', href);
        window.location.href = href;
        return;
      }
      
      // Handle Pokémon card links
      const pokeLink = e.target.closest('a[href^="/pokedex/"]');
      if (pokeLink && pokeLink.getAttribute('href') !== '/pokedex' && pokeLink.getAttribute('href') !== '/pokedex/') {
        e.preventDefault();
        console.log('Forcing Pokémon card navigation to:', pokeLink.getAttribute('href'));
        window.location.href = pokeLink.getAttribute('href');
      }
    }, true); // Use capturing phase for earliest possible interception
  }

  // Run immediately if document is already loaded
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    applyNavigationFix();
  } else {
    // Otherwise wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', applyNavigationFix);
  }

  // Also attach to route change events in Next.js to handle client-side navigation
  if (typeof window !== 'undefined') {
    window.addEventListener('routeChangeComplete', function() {
      console.log('Route changed, reapplying navigation fix...');
      // Small timeout to ensure DOM is updated
      setTimeout(applyNavigationFix, 100);
    });
    
    // Debug navigation events for testing
    console.log('Setting up navigation debugging...');
    document.addEventListener('click', function(e) {
      const navLink = e.target.closest('a[href]');
      if (navLink) {
        const href = navLink.getAttribute('href');
        console.log('Link clicked:', href, 'Has navbar attr:', !!navLink.getAttribute('data-is-navbar'));
      }
    }, true);
    
    // Attempt to monkey patch Next.js Router for better diagnostics
    if (window.next && window.next.router) {
      const origPush = window.next.router.push;
      window.next.router.push = function(href, options) {
        console.log('Next.js Router.push called with:', href);
        return origPush.apply(this, arguments);
      };
    }
  }
})();
