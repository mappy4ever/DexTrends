import { useState, useEffect, useCallback, useContext, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import { HapticFeedback, VisualFeedback } from './MicroInteractionSystem';
import { FABContext, FABContextValue, FABConfig, FABAction } from './FloatingActionSystem';

export const useFAB = (): FABContextValue => {
  const context = useContext(FABContext);
  if (!context) {
    throw new Error('useFAB must be used within FABProvider');
  }
  return context;
};

export const useContextualFAB = () => {
  const { setGlobalFABConfig, clearGlobalFAB } = useFAB();
  const router = useRouter();
  
  const showFAB = useCallback((config: FABConfig) => {
    setGlobalFABConfig(config);
  }, [setGlobalFABConfig]);
  
  const hideFAB = useCallback(() => {
    clearGlobalFAB();
  }, [clearGlobalFAB]);
  
  // Common FAB configurations
  const showScrollToTop = useCallback(() => {
    showFAB({
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      ),
      onClick: () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        HapticFeedback.light();
      },
      tooltip: 'Scroll to top',
      position: 'bottom-right'
    });
  }, [showFAB]);
  
  const showAddCard = useCallback((onAdd: () => void) => {
    showFAB({
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      onClick: onAdd,
      tooltip: 'Add card',
      position: 'bottom-right'
    });
  }, [showFAB]);
  
  const showShareActions = useCallback((shareOptions: { url?: string; text?: string } = {}) => {
    const shareActions: FABAction[] = [
      {
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
          </svg>
        ),
        label: 'Share to Twitter',
        onClick: () => {
          const url = shareOptions.url || `${window.location.origin}${router.asPath}`;
          const text = shareOptions.text || 'Check this out!';
          window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
        }
      },
      {
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        ),
        label: 'Copy link',
        onClick: () => {
          const url = shareOptions.url || `${window.location.origin}${router.asPath}`;
          navigator.clipboard.writeText(url);
          HapticFeedback.success();
        }
      }
    ];
    
    showFAB({
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
        </svg>
      ),
      actions: shareActions,
      tooltip: 'Share',
      position: 'bottom-right'
    });
  }, [showFAB, router.asPath]);
  
  return {
    showFAB,
    hideFAB,
    showScrollToTop,
    showAddCard,
    showShareActions
  };
};

export const useScrollFAB = (threshold: number = 200): boolean => {
  const { showScrollToTop, hideFAB } = useContextualFAB();
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const shouldShow = scrollTop > threshold;
      
      if (shouldShow !== isVisible) {
        setIsVisible(shouldShow);
        if (shouldShow) {
          showScrollToTop();
        } else {
          hideFAB();
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold, isVisible, showScrollToTop, hideFAB]);
  
  return isVisible;
};
