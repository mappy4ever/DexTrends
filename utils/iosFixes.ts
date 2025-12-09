// iOS-specific fixes and optimizations

interface ScrollableElement extends HTMLElement {
  style: CSSStyleDeclaration & {
    webkitOverflowScrolling?: string;
  };
}

interface WebkitStyleElement extends HTMLElement {
  style: CSSStyleDeclaration & {
    webkitTransform?: string;
    webkitBackfaceVisibility?: string;
  };
}

export function applyIOSFixes(): boolean {
  if (typeof window === 'undefined') return false;

  // Detect iOS device
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  if (isIOS) {
    // Add iOS class to body for CSS targeting
    document.body.classList.add('ios-device');
    
    // Fix viewport height issue on iOS
    const setViewportHeight = (): void => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);

    // Prevent bounce scrolling - DISABLED to prevent issues
    // document.body.addEventListener('touchmove', function(e) {
    //   if (!e.target.closest('.scrollable')) {
    //     e.preventDefault();
    //   }
    // }, { passive: false });

    // Fix iOS input zoom - SIMPLIFIED to prevent viewport changes
    const inputs = document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      'input, textarea, select'
    );
    
    inputs.forEach(input => {
      // Ensure font size is 16px to prevent zoom
      input.style.fontSize = '16px';
    });

    // Add scroll performance optimization
    let scrollTimeout: number;
    window.addEventListener('scroll', function() {
      if (!document.body.classList.contains('is-scrolling')) {
        document.body.classList.add('is-scrolling');
      }
      
      clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(function() {
        document.body.classList.remove('is-scrolling');
      }, 150);
    }, { passive: true });

    // Fix iOS fixed positioning issues - ensure navbar stays visible
    // Select navbar specifically by its semantic element, not just .fixed class
    const navbar = document.querySelector<WebkitStyleElement>('header.fixed, nav.fixed[style*="bottom"]');
    const bottomNav = document.querySelector<WebkitStyleElement>('nav.fixed[style*="bottom: 0"]');

    // Force hardware acceleration on critical fixed elements
    if (navbar) {
      navbar.style.transform = 'translate3d(0, 0, 0)';
      navbar.style.webkitTransform = 'translate3d(0, 0, 0)';
      navbar.style.backfaceVisibility = 'hidden';
      navbar.style.webkitBackfaceVisibility = 'hidden';
      // Ensure navbar is always at top
      navbar.style.position = 'fixed';
      navbar.style.top = '0';
      navbar.style.left = '0';
      navbar.style.right = '0';
    }

    if (bottomNav) {
      bottomNav.style.transform = 'translate3d(0, 0, 0)';
      bottomNav.style.webkitTransform = 'translate3d(0, 0, 0)';
      bottomNav.style.backfaceVisibility = 'hidden';
      bottomNav.style.webkitBackfaceVisibility = 'hidden';
    }

    // Periodically check and fix navbar positioning (workaround for iOS bugs)
    let lastScrollY = window.scrollY;
    let navbarCheckTimer: number;

    window.addEventListener('scroll', function() {
      const currentScrollY = window.scrollY;

      // Clear any pending timer
      if (navbarCheckTimer) {
        clearTimeout(navbarCheckTimer);
      }

      // After scroll ends, verify navbar is still visible
      navbarCheckTimer = window.setTimeout(function() {
        const navbarElem = document.querySelector<HTMLElement>('header.fixed');
        if (navbarElem) {
          // Force a repaint to fix any rendering issues
          navbarElem.style.transform = 'translate3d(0, 0, 0)';
        }
      }, 100);

      lastScrollY = currentScrollY;
    }, { passive: true });

    // Enable smooth momentum scrolling
    const scrollableElements = document.querySelectorAll<ScrollableElement>(
      '.overflow-auto, .overflow-scroll, .scrollable'
    );
    scrollableElements.forEach(element => {
      element.style.webkitOverflowScrolling = 'touch';
      element.style.overscrollBehavior = 'contain';
    });

    // Handle orientation changes - DISABLED due to refresh issues
    // window.addEventListener('orientationchange', function() {
    //   // Force a re-layout
    //   document.body.style.display = 'none';
    //   document.body.offsetHeight; // Trigger reflow
    //   document.body.style.display = '';
    // });

    // Optimize touch responsiveness
    let touchendTime = 0;
    document.addEventListener('touchend', function(event) {
      const now = Date.now();
      if (now - touchendTime <= 300) {
        event.preventDefault();
      }
      touchendTime = now;
    }, false);

    // Add will-change optimization for frequently animated elements
    const animatedElements = document.querySelectorAll<HTMLElement>(
      '.card, .hover\\:scale-105, [class*="transition"]'
    );
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const target = entry.target as HTMLElement;
        if (entry.isIntersecting) {
          target.style.willChange = 'transform';
        } else {
          target.style.willChange = 'auto';
        }
      });
    });
    
    animatedElements.forEach(element => {
      observer.observe(element);
    });
  }

  return isIOS;
}

// Export for use in React components
export default applyIOSFixes;