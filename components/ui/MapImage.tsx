import React, { useState } from 'react';
import Image from 'next/image';
import logger from '@/utils/logger';

interface MapImageProps {
  src: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
}

export default function MapImage({ 
  src, 
  alt, 
  className, 
  style, 
  width, 
  height, 
  fill, 
  priority = false 
}: MapImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fallback to regular img tag if Next/Image fails
  if (hasError) {
    return (
      <img 
        src={src} 
        alt={alt}
        className={className}
        style={{
          ...style,
          width: width || '100%',
          height: height || '100%',
          objectFit: 'cover'
        }}
        onError={(e) => {
          logger.error(`Failed to load image: ${src}`);
          const target = e.target as HTMLImageElement;
          target.style.opacity = '0.3';
          target.alt = `${alt} (Failed to load)`;
        }}
      />
    );
  }

  // Use Next/Image with proper configuration
  const imageProps: {
    src: string;
    alt?: string;
    className?: string;
    style?: React.CSSProperties;
    priority: boolean;
    onError: () => void;
    onLoad: () => void;
    placeholder: 'empty';
    fill?: boolean;
    width?: number;
    height?: number;
  } = {
    src,
    alt,
    className,
    style,
    priority,
    onError: () => {
      logger.error(`Next/Image failed to load: ${src}`);
      setHasError(true);
    },
    onLoad: () => {
      setIsLoading(false);
    },
    // Handle placeholder while loading
    placeholder: 'empty' as const,
  };

  // Add dimension props based on usage
  if (fill) {
    imageProps.fill = true;
  } else if (width && height) {
    imageProps.width = width;
    imageProps.height = height;
  } else {
    // Default dimensions if not provided
    imageProps.width = 1200;
    imageProps.height = 800;
  }

  return (
    <>
      {isLoading && (
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}
        >
          Loading map...
        </div>
      )}
      <Image {...imageProps} alt={alt || "Region map"} />
    </>
  );
}