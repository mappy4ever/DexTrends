import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/utils/cn';

interface DexTrendsLogoProps {
  variant?: 'horizontal' | 'vertical';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  className?: string;
  withLink?: boolean;
  priority?: boolean;
}

const sizeMap = {
  horizontal: {
    xs: { width: 160, height: 40, className: 'h-10 w-auto' },
    sm: { width: 200, height: 50, className: 'h-12 w-auto' },
    md: { width: 240, height: 60, className: 'h-14 w-auto' },
    lg: { width: 320, height: 80, className: 'h-16 md:h-20 w-auto' },
    xl: { width: 400, height: 100, className: 'h-24 w-auto' },
    '2xl': { width: 480, height: 120, className: 'h-28 w-auto' },
    '3xl': { width: 640, height: 160, className: 'h-32 w-auto' },
  },
  vertical: {
    xs: { width: 150, height: 150, className: 'h-24 w-auto' },
    sm: { width: 200, height: 200, className: 'h-32 w-auto' },
    md: { width: 300, height: 300, className: 'h-48 w-auto' },
    lg: { width: 400, height: 400, className: 'h-64 w-auto' },
    xl: { width: 500, height: 500, className: 'h-80 w-auto' },
    '2xl': { width: 600, height: 600, className: 'h-96 w-auto' },
    '3xl': { width: 800, height: 800, className: 'h-[32rem] w-auto' },
  },
};

export const DexTrendsLogo: React.FC<DexTrendsLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  className,
  withLink = false,
  priority = false,
}) => {
  const config = sizeMap[variant][size];
  // Use the new logo with built-in outline
  const src = '/images/DT_Logo.png';
  
  const logoImage = (
    <Image
      src={src}
      alt="DexTrends - Your Ultimate Pokemon Companion"
      width={config.width}
      height={config.height}
      className={cn(
        config.className,
        'transition-all duration-300',
        withLink && 'hover:scale-110',
        className
      )}
      priority={priority}
      unoptimized
    />
  );

  if (withLink) {
    return (
      <Link href="/" className="inline-block">
        {logoImage}
      </Link>
    );
  }

  return logoImage;
};

// Hero Logo - Special large version for hero sections
export const HeroLogo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('relative', className)}>
      {/* Glow effect */}
      <div className="absolute inset-0 blur-3xl opacity-30">
        <div className="h-full w-full bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 rounded-full" />
      </div>
      
      {/* Logo */}
      <DexTrendsLogo 
        variant="vertical" 
        size="2xl" 
        className="relative z-10"
        priority
      />
    </div>
  );
};

// Navbar Logo - Uses horizontal line version for better navbar fit
export const NavbarLogo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <Link href="/" className="inline-block">
      <Image
        src="/images/DT_Line.png"
        alt="DexTrends - Your Ultimate Pokemon Companion"
        width={320}
        height={80}
        className={cn(
          'h-14 md:h-16 lg:h-20 w-auto transition-all duration-300 hover:scale-110',
          className
        )}
        priority
        unoptimized
      />
    </Link>
  );
};

// Footer Logo - Optimized for footer
export const FooterLogo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <DexTrendsLogo 
      variant="horizontal" 
      size="md" 
      className={className}
    />
  );
};

export default DexTrendsLogo;