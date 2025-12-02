import { useEffect, useRef, RefObject } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  enabled?: boolean;
}

export function useIntersectionObserver(
  elementRef: RefObject<Element>,
  callback: (entry: IntersectionObserverEntry) => void,
  options: UseIntersectionObserverOptions = {}
): void {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0px',
    enabled = true
  } = options;

  const observerRef = useRef<IntersectionObserver | null>(null);
  // Fix BETA-001: Use ref for callback to prevent infinite re-runs
  // when callback reference changes between renders
  const callbackRef = useRef(callback);

  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled || !elementRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Use ref to always call the latest callback
            callbackRef.current(entry);
          }
        });
      },
      {
        threshold,
        root,
        rootMargin
      }
    );

    observerRef.current = observer;
    observer.observe(elementRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [elementRef, threshold, root, rootMargin, enabled]); // callback removed from deps
}