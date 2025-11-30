import React, { useState, useEffect } from 'react';
import { useBottomNavigation } from './BottomNavigation';
import { Z_INDEX } from '@/hooks/useViewport';

const BaseBackToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { bottomOffset } = useBottomNavigation();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show button when page is scrolled down
  const toggleVisibility = (): void => {
    if (typeof window !== 'undefined' && window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = (): void => {
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    
    toggleVisibility(); // Check initial position
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, [mounted]);

  return (
    <>
      {mounted && isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed right-4 bg-amber-600 hover:bg-amber-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
          style={{ bottom: bottomOffset, zIndex: Z_INDEX.fab }}
          aria-label="Back to top"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </>
  );
};

export default BaseBackToTop;