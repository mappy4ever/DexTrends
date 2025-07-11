// components/icons/CustomSiteLogo.js
import React from 'react';
import Image from 'next/image';
import { getLogoConfig, getLogoForContext } from '../../utils/logoConfig';
import { getLogoEnhancement } from '../../utils/logoEnhancements';

export default function CustomSiteLogo({ 
  size = 120, 
  className = '', 
  variant = 'vertical', 
  context,
  enhanced = true,
  ...props 
}) {
  // Use context if provided, otherwise use variant
  const logoConfig = context ? getLogoForContext(context) : getLogoConfig(variant);
  const enhancement = enhanced ? getLogoEnhancement(context || variant) : '';
  
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
}