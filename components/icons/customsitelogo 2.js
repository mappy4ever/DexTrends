// components/icons/CustomSiteLogo.js
import React from 'react';
import Image from 'next/image';

export default function CustomSiteLogo({ size = 120, className = '', ...props }) {
  return (
    <div className="site-logo">
      <Image
        src="/dextrendslogo.png" // Updated to use the new Pokédex-themed logo
        alt="DexTrends Logo"
        width={150} // Adjusted size for better visibility
        height={150}
        className={className}
        style={{ display: 'block', objectFit: 'contain' }}
        {...props}
      />
    </div>
  );
}