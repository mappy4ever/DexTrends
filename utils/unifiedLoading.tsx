import React from 'react';
import PokeballLoader from '../components/ui/PokeballLoader';

interface LoadingOptions {
  text?: string;
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
  inline?: boolean;
  className?: string;
}

/**
 * Unified loading component that uses PokeballLoader for all loading states
 */
export function UnifiedLoader({
  text = 'Loading...',
  size = 'medium',
  fullScreen = false,
  inline = false,
  className = ''
}: LoadingOptions) {
  // For inline loading, use small size by default
  const actualSize = inline ? 'small' : size;
  
  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50 flex items-center justify-center">
        <PokeballLoader size={size} text={text} randomBall={true} />
      </div>
    );
  }
  
  if (inline) {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <PokeballLoader size={actualSize} text="" randomBall={false} />
        {text && <span className="ml-2 text-gray-600">{text}</span>}
      </div>
    );
  }
  
  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <PokeballLoader size={size} text={text} randomBall={true} />
    </div>
  );
}

/**
 * Page loading component - full screen with gradient background
 */
export function PageLoader({ text = 'Loading...' }: { text?: string }) {
  return <UnifiedLoader text={text} size="large" fullScreen={true} />;
}

/**
 * Inline loading component - small spinner for buttons/inline states
 */
export function InlineLoader({ text = '' }: { text?: string }) {
  return <UnifiedLoader text={text} size="small" inline={true} />;
}

/**
 * Card/Section loading component - medium sized for card areas
 */
export function SectionLoader({ text = 'Loading...' }: { text?: string }) {
  return <UnifiedLoader text={text} size="medium" fullScreen={false} />;
}

/**
 * Loading with progress
 */
export function ProgressLoader({ 
  text = 'Loading...', 
  progress = 0 
}: { 
  text?: string; 
  progress?: number;
}) {
  const displayText = progress > 0 && progress < 100 
    ? `${text} ${Math.round(progress)}% complete`
    : text;
    
  return <PageLoader text={displayText} />;
}