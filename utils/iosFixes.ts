// iOS-specific fixes and optimizations

interface ScrollableElement extends HTMLElement {
  style: CSSStyleDeclaration & {
    webkitOverflowScrolling?: string;
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

    // Fix iOS fixed positioning issues
    const fixedElements = document.querySelectorAll<HTMLElement>('.fixed, [style*="position: fixed"]');
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', function() {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY;
      
      fixedElements.forEach(element => {
        if (Math.abs(scrollDelta) > 10) {
          element.style.transform = 'translateZ(0)';
        }
      });
      
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