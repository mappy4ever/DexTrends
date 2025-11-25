import { useState, useEffect, useRef } from 'react';

interface ProgressiveImageOptions {
  src: string;
  placeholder?: string;
  blur?: boolean;
  threshold?: number;
  rootMargin?: string;
}

interface ProgressiveImageState {
  currentSrc: string;
  isLoading: boolean;
  isInView: boolean;
  hasError: boolean;
}

export function useProgressiveImage({
  src,
  placeholder,
  blur = true,
  threshold = 0.1,
  rootMargin = '50px'
}: ProgressiveImageOptions): ProgressiveImageState & { ref: React.RefObject<HTMLImageElement | null> } {
  const [state, setState] = useState<ProgressiveImageState>({
    currentSrc: placeholder || '',
    isLoading: true,
    isInView: false,
    hasError: false
  });
  
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generate blur placeholder from image URL if not provided
  const getPlaceholder = (imageSrc: string) => {
    if (placeholder) return placeholder;
    
    // For Pokemon TCG images, use low quality version
    if (imageSrc.includes('images.pokemontcg.io')) {
      return imageSrc.replace('/high.', '/low.');
    }
    
    // For PokeAPI sprites, return original (no thumbnails available)
    if (imageSrc.includes('raw.githubusercontent.com/PokeAPI')) {
      return imageSrc;
    }
    
    // Default: create a 1x1 transparent pixel
    return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  };

  useEffect(() => {
    if (!imgRef.current) return;

    // Set up Intersection Observer for lazy loading
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setState(prev => ({ ...prev, isInView: true }));
            observerRef.current?.disconnect();
          }
        });
      },
      {
        threshold,
        rootMargin
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [threshold, rootMargin]);

  useEffect(() => {
    if (!state.isInView) return;

    const img = new Image();
    
    img.onload = () => {
      setState(prev => ({
        ...prev,
        currentSrc: src,
        isLoading: false,
        hasError: false
      }));
    };

    img.onerror = () => {
      setState(prev => ({
        ...prev,
        hasError: true,
        isLoading: false
      }));
    };

    // Start loading the high-quality image
    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, state.isInView]);

  // Set initial placeholder
  useEffect(() => {
    const placeholderSrc = getPlaceholder(src);
    setState(prev => ({
      ...prev,
      currentSrc: placeholderSrc
    }));
  }, [src, placeholder]);

  return {
    ...state,
    ref: imgRef
  };
}

// Hook for preloading images
export function useImagePreloader(urls: string[]) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (urls.length === 0) return;

    let loaded = 0;
    const images: HTMLImageElement[] = [];

    urls.forEach((url) => {
      const img = new Image();
      
      img.onload = () => {
        loaded++;
        setLoadedImages(prev => new Set(prev).add(url));
        setProgress(loaded / urls.length);
      };

      img.onerror = () => {
        loaded++;
        setProgress(loaded / urls.length);
      };

      img.src = url;
      images.push(img);
    });

    return () => {
      images.forEach(img => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, [urls]);

  return { loadedImages, progress };
}