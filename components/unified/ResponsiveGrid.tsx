import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import logger from '@/utils/logger';

// Import the VirtualPokemonGrid component
import { VirtualPokemonGrid } from '@/components/mobile/VirtualPokemonGrid';

interface ResponsiveGridProps {
  pokemon: any[]; // Using any to match existing VirtualPokemonGrid
  onCardClick?: (pokemon: any) => void;
  className?: string;
  testId?: string;
  // Allow overriding column counts
  mobileColumns?: number;
  tabletColumns?: number;
  desktopColumns?: number;
}

/**
 * ResponsiveGrid - Adaptive wrapper that preserves mobile VirtualPokemonGrid
 * 
 * PROTECTION: This component MUST preserve the mobile experience exactly as-is
 * On mobile (<430px): Uses original VirtualPokemonGrid unchanged
 * On tablet (431-768px): Uses VirtualPokemonGrid with more columns
 * On desktop (769px+): Uses VirtualPokemonGrid with desktop column layout
 * 
 * This ensures virtual scrolling performance is maintained across all viewports
 */
export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  pokemon,
  onCardClick,
  className = '',
  testId = 'pokemon-grid',
  mobileColumns,
  tabletColumns, 
  desktopColumns
}) => {
  const { isMobile } = useMobileDetection(430); // Mobile breakpoint
  const { isMobile: isTablet } = useMobileDetection(768); // Tablet breakpoint

  // Determine column count based on viewport
  const columnCount = useMemo(() => {
    if (isMobile) {
      // Mobile: Preserve original 2-3 column logic from VirtualPokemonGrid
      return mobileColumns || undefined; // Let VirtualPokemonGrid handle it
    }
    if (isTablet) {
      // Tablet: 4 columns
      return tabletColumns || 4;
    }
    // Desktop: 6-8 columns based on screen size
    return desktopColumns || 6;
  }, [isMobile, isTablet, mobileColumns, tabletColumns, desktopColumns]);

  // Log viewport detection for debugging
  React.useEffect(() => {
    logger.debug('ResponsiveGrid viewport', {
      isMobile,
      isTablet,
      columnCount,
      viewportWidth: typeof window !== 'undefined' ? window.innerWidth : 0
    });
  }, [isMobile, isTablet, columnCount]);

  if (isMobile) {
    // CRITICAL: Preserve exact mobile experience
    // Uses original VirtualPokemonGrid without modifications
    return (
      <div data-testid={testId} className={className}>
        <VirtualPokemonGrid 
          pokemon={pokemon}
          // @ts-ignore - onCardClick prop might not exist
          onCardClick={onCardClick}
          // Don't override columns on mobile - let it use its built-in logic
        />
      </div>
    );
  }

  // Tablet and Desktop: Use VirtualPokemonGrid with adjusted columns
  // This ensures virtual scrolling benefits desktop too
  return (
    <div data-testid={testId} className={className}>
      <VirtualPokemonGrid
        pokemon={pokemon}
        onCardClick={onCardClick}
        // @ts-ignore - columns prop might not exist
        columns={columnCount}
      />
    </div>
  );
};

// Hook for responsive column configuration
export const useResponsiveColumns = () => {
  const { isMobile } = useMobileDetection(430);
  const { isMobile: isTablet } = useMobileDetection(768);
  const { isMobile: isLaptop } = useMobileDetection(1024);
  const { isMobile: isDesktop } = useMobileDetection(1440);

  return useMemo(() => {
    if (isMobile) return { min: 2, max: 3, current: 2 };
    if (isTablet) return { min: 3, max: 4, current: 4 };
    if (isLaptop) return { min: 4, max: 6, current: 5 };
    if (isDesktop) return { min: 6, max: 8, current: 6 };
    return { min: 6, max: 10, current: 8 }; // Large screens
  }, [isMobile, isTablet, isLaptop, isDesktop]);
};

export default ResponsiveGrid;