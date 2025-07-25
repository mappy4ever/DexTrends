// components/icons/CustomSiteLogo.tsx
import React from 'react';
import Image from 'next/image';
import { getLogoConfig, getLogoForContext, LogoContext, LogoVariantType } from '../../utils/logoConfig';
import { getLogoEnhancement } from '../../utils/logoEnhancements';

// Type definitions
interface CustomSiteLogoProps {
  size?: number;
  className?: string;
  variant?: LogoVariantType;
  context?: LogoContext;
  enhanced?: boolean;
  [key: string]: any; // For additional props
}

const CustomSiteLogo: React.FC<CustomSiteLogoProps> = ({ 
  size = 120, 
  className = '', 
  variant = 'vertical', 
  context,
  enhanced = true,
  ...props 
}) => {
  // Use context if provided, otherwise use variant
  const logoConfig = context ? getLogoForContext(context) : getLogoConfig(variant);
  // Pass context as string for enhancement, defaulting to variant name if no context
  const enhancement = enhanced ? getLogoEnhancement(context || variant as string) : '';
  
  return (
    <div className="site-logo">
      <Image
        src={logoConfig.src}
        alt={logoConfig.alt}
        width={logoConfig.width}
        height={logoConfig.height}
        className={`${className} ${enhancement} transform hover:scale-105 transition-transform duration-300`}
        style={{ display: 'block', objectFit: 'contain' }}
        priority
        {...props}
      />
    </div>
  );
};

export default CustomSiteLogo;