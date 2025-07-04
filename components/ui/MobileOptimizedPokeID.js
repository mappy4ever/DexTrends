import React from 'react';

// Mobile-optimized wrapper component for PokeID page sections
export const MobileContainer = ({ children, className = '' }) => (
  <div className={`w-full max-w-7xl mx-auto px-3 py-2 sm:px-4 sm:py-8 ${className}`}>
    {children}
  </div>
);

export const MobileHeader = ({ children }) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-8">
    {children}
  </div>
);

export const MobileCard = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-lg p-3 sm:p-6 lg:p-8 mb-4 sm:mb-8 overflow-hidden ${className}`}>
    {children}
  </div>
);

export const MobileGrid = ({ children, cols = 2 }) => {
  const gridClass = cols === 1 ? 'grid-cols-1' : 
                    cols === 2 ? 'grid-cols-1 sm:grid-cols-2' :
                    cols === 3 ? 'grid-cols-2 sm:grid-cols-3' :
                    'grid-cols-2 sm:grid-cols-4';
  
  return (
    <div className={`grid ${gridClass} gap-2 sm:gap-3`}>
      {children}
    </div>
  );
};

export const MobileInfoBox = ({ title, value, subValue, className = '' }) => (
  <div className={`bg-gray-50 p-2 sm:p-3 rounded ${className}`}>
    <h4 className="font-semibold text-gray-700 text-xs sm:text-sm">{title}</h4>
    <p className="text-gray-900 text-sm sm:text-base lg:text-lg font-medium">{value}</p>
    {subValue && <p className="text-gray-500 text-[10px] sm:text-xs">{subValue}</p>}
  </div>
);

export const MobileTabNav = ({ tabs, activeTab, onTabChange }) => (
  <nav className="flex gap-1 sm:gap-2 md:gap-4 px-2 sm:px-4 md:px-8 overflow-x-auto scrollbar-hide tab-navigation">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onTabChange(tab.id)}
        className={`py-2 sm:py-3 md:py-4 px-2 sm:px-3 border-b-2 font-medium text-[10px] sm:text-xs md:text-sm transition-colors whitespace-nowrap ${
          activeTab === tab.id
            ? 'border-pokemon-red text-pokemon-red'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
      >
        {tab.name}
      </button>
    ))}
  </nav>
);

export const MobileSection = ({ title, children, className = '' }) => (
  <div className={`mb-4 sm:mb-6 ${className}`}>
    {title && <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 mb-2 sm:mb-4">{title}</h3>}
    {children}
  </div>
);

// Responsive text sizes
export const MobileTitle = ({ children, size = 'lg' }) => {
  const sizeClasses = {
    xl: 'text-2xl sm:text-3xl lg:text-4xl',
    lg: 'text-xl sm:text-2xl lg:text-3xl',
    md: 'text-lg sm:text-xl lg:text-2xl',
    sm: 'text-base sm:text-lg lg:text-xl',
    xs: 'text-sm sm:text-base lg:text-lg'
  };
  
  return (
    <h1 className={`${sizeClasses[size]} font-bold text-gray-800 break-words`}>
      {children}
    </h1>
  );
};

// Type effectiveness section with proper mobile layout
export const MobileTypeEffectiveness = ({ weaknesses, resistances, immunities }) => (
  <div className="space-y-2 sm:space-y-3">
    {weaknesses.length > 0 && (
      <div className="bg-red-50 rounded-lg p-2 sm:p-3 border border-red-200">
        <h5 className="text-xs sm:text-sm font-semibold text-red-800 mb-1">Weak to:</h5>
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {weaknesses}
        </div>
      </div>
    )}
    
    {resistances.length > 0 && (
      <div className="bg-green-50 rounded-lg p-2 sm:p-3 border border-green-200">
        <h5 className="text-xs sm:text-sm font-semibold text-green-800 mb-1">Resistant to:</h5>
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {resistances}
        </div>
      </div>
    )}
    
    {immunities.length > 0 && (
      <div className="bg-gray-100 rounded-lg p-2 sm:p-3 border border-gray-300">
        <h5 className="text-xs sm:text-sm font-semibold text-gray-800 mb-1">Immune to:</h5>
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {immunities}
        </div>
      </div>
    )}
  </div>
);

// Mobile-optimized button
export const MobileButton = ({ children, onClick, variant = 'primary', fullWidth = false, className = '' }) => {
  const baseClasses = 'px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base';
  const widthClass = fullWidth ? 'w-full' : 'w-full sm:w-auto';
  const variantClasses = {
    primary: 'bg-red-500 text-white hover:bg-red-600',
    secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50'
  };
  
  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${widthClass} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default {
  MobileContainer,
  MobileHeader,
  MobileCard,
  MobileGrid,
  MobileInfoBox,
  MobileTabNav,
  MobileSection,
  MobileTitle,
  MobileTypeEffectiveness,
  MobileButton
};