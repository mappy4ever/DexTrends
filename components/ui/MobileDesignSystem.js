import React from 'react';

/**
 * MobileDesignSystem - Comprehensive mobile-first component showcase
 * Demonstrates all design tokens and patterns optimized for iPhone displays
 */

// Typography Scale Component
export const TypographyScale = () => (
  <div className="space-y-4 p-4">
    <h3 className="text-lg font-semibold mb-4">Typography Scale (Mobile-Optimized)</h3>
    
    <div className="space-y-2">
      <p className="text-2xs text-gray-600">2XS (10px) - Micro labels</p>
      <p className="text-xs text-gray-700">XS (11px) - Small labels, badges</p>
      <p className="text-sm text-gray-800">SM (13px) - Secondary text, captions</p>
      <p className="text-base">Base (15px) - Body text (iOS optimal)</p>
      <p className="text-lg font-medium">LG (17px) - Emphasized body text</p>
      <h4 className="text-xl font-semibold">XL (20px) - Section headers</h4>
      <h3 className="text-2xl font-semibold">2XL (24px) - Page headers</h3>
      <h2 className="text-3xl font-bold">3XL (28px) - Major headers</h2>
      <h1 className="text-4xl font-bold">4XL (32px) - Hero text</h1>
    </div>
    
    <div className="mt-6 space-y-2">
      <p className="text-dynamic-sm">Dynamic Small - Scales with viewport</p>
      <p className="text-dynamic">Dynamic Base - Scales with viewport</p>
      <p className="text-dynamic-lg">Dynamic Large - Scales with viewport</p>
    </div>
  </div>
);

// Spacing Grid Component
export const SpacingGrid = () => (
  <div className="p-4">
    <h3 className="text-lg font-semibold mb-4">4px Spacing Grid</h3>
    
    <div className="space-y-2">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(space => (
        <div key={space} className="flex items-center gap-4">
          <span className="text-xs w-16 text-gray-600">space-{space}</span>
          <div 
            className="bg-pokemon-blue rounded"
            style={{ 
              width: `${space * 4}px`, 
              height: '16px' 
            }}
          />
          <span className="text-xs text-gray-500">{space * 4}px</span>
        </div>
      ))}
    </div>
    
    <div className="mt-6 p-4 bg-gray-100 rounded-lg">
      <p className="text-sm font-medium mb-2">iOS Touch Target</p>
      <div className="w-11 h-11 bg-pokemon-red rounded flex items-center justify-center text-white font-bold">
        44px
      </div>
    </div>
  </div>
);

// Button Showcase Component
export const ButtonShowcase = () => (
  <div className="p-4 space-y-6">
    <h3 className="text-lg font-semibold mb-4">iOS-Optimized Buttons</h3>
    
    <div className="space-y-4">
      <button className="btn-ios btn-ios-primary w-full">
        Primary Button
      </button>
      
      <button className="btn-ios btn-ios-secondary w-full">
        Secondary Button
      </button>
      
      <button className="btn-ios btn-ios-ghost w-full">
        Ghost Button
      </button>
      
      <div className="flex gap-2">
        <button className="btn-ios btn-ios-primary flex-1">
          Confirm
        </button>
        <button className="btn-ios btn-ios-secondary flex-1">
          Cancel
        </button>
      </div>
    </div>
    
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">Touch Feedback Demo</p>
      <button className="touch-target touch-feedback btn-ios btn-ios-primary">
        Tap Me
      </button>
    </div>
  </div>
);

// Card Showcase Component
export const CardShowcase = () => (
  <div className="p-4 space-y-4">
    <h3 className="text-lg font-semibold mb-4">iOS-Style Cards</h3>
    
    <div className="card-ios">
      <h4 className="font-medium mb-2">Basic Card</h4>
      <p className="text-sm text-gray-600">
        Clean card with iOS-native styling and elevation
      </p>
    </div>
    
    <div className="card-ios hover:shadow-lg transition-shadow">
      <h4 className="font-medium mb-2">Interactive Card</h4>
      <p className="text-sm text-gray-600">
        Tap or hover for elevation change
      </p>
    </div>
    
    <div className="card-ios bg-gradient-to-br from-pokemon-red to-pokemon-blue text-white">
      <h4 className="font-medium mb-2">Gradient Card</h4>
      <p className="text-sm opacity-90">
        Premium card with gradient background
      </p>
    </div>
  </div>
);

// Form Components Showcase
export const FormShowcase = () => (
  <div className="p-4 space-y-4">
    <h3 className="text-lg font-semibold mb-4">iOS Form Components</h3>
    
    <div>
      <label className="block text-sm font-medium mb-2">
        Text Input
      </label>
      <input 
        type="text" 
        className="input-ios" 
        placeholder="Enter text..."
      />
    </div>
    
    <div>
      <label className="block text-sm font-medium mb-2">
        Select Input
      </label>
      <select className="input-ios select-ios">
        <option>Choose option...</option>
        <option>Option 1</option>
        <option>Option 2</option>
        <option>Option 3</option>
      </select>
    </div>
    
    <div>
      <label className="block text-sm font-medium mb-2">
        Text Area
      </label>
      <textarea 
        className="input-ios" 
        rows="3"
        placeholder="Enter message..."
      />
    </div>
    
    <div className="flex items-center gap-3">
      <input 
        type="checkbox" 
        id="checkbox" 
        className="w-5 h-5 rounded border-gray-300 text-pokemon-blue focus:ring-pokemon-blue"
      />
      <label htmlFor="checkbox" className="text-sm touch-target">
        Accept terms and conditions
      </label>
    </div>
  </div>
);

// Shadow & Elevation Showcase
export const ShadowShowcase = () => (
  <div className="p-4 space-y-4">
    <h3 className="text-lg font-semibold mb-4">iOS Shadow System</h3>
    
    <div className="grid grid-cols-2 gap-4">
      {['xs', 'sm', 'md', 'lg', 'xl', '2xl'].map(size => (
        <div 
          key={size}
          className={`p-4 bg-white rounded-lg text-center shadow-${size}`}
          style={{ boxShadow: `var(--shadow-${size})` }}
        >
          <p className="text-sm font-medium">shadow-{size}</p>
        </div>
      ))}
    </div>
    
    <h4 className="text-md font-semibold mt-6 mb-4">Elevation System</h4>
    
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map(level => (
        <div 
          key={level}
          className="p-4 bg-white rounded-lg"
          style={{ boxShadow: `var(--elevation-${level})` }}
        >
          <p className="text-sm font-medium">Elevation {level}</p>
        </div>
      ))}
    </div>
  </div>
);

// Color Showcase Component
export const ColorShowcase = () => (
  <div className="p-4 space-y-4">
    <h3 className="text-lg font-semibold mb-4">Color System</h3>
    
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-700">Primary Colors</h4>
      <div className="grid grid-cols-4 gap-2">
        <div className="aspect-square rounded-lg bg-pokemon-red flex items-center justify-center">
          <span className="text-xs text-white font-medium">Red</span>
        </div>
        <div className="aspect-square rounded-lg bg-pokemon-blue flex items-center justify-center">
          <span className="text-xs text-white font-medium">Blue</span>
        </div>
        <div className="aspect-square rounded-lg bg-pokemon-yellow flex items-center justify-center">
          <span className="text-xs text-black font-medium">Yellow</span>
        </div>
        <div className="aspect-square rounded-lg bg-pokemon-green flex items-center justify-center">
          <span className="text-xs text-white font-medium">Green</span>
        </div>
      </div>
    </div>
    
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-700">Neutral Scale</h4>
      <div className="space-y-1">
        {[
          { name: 'white', bg: 'bg-white', text: 'text-gray-800' },
          { name: 'off-white', bg: 'bg-gray-50', text: 'text-gray-800' },
          { name: 'light-grey', bg: 'bg-gray-100', text: 'text-gray-800' },
          { name: 'mid-grey', bg: 'bg-gray-200', text: 'text-gray-800' },
          { name: 'border-grey', bg: 'bg-gray-300', text: 'text-gray-800' },
          { name: 'text-grey', bg: 'bg-gray-500', text: 'text-white' },
          { name: 'dark-text', bg: 'bg-gray-700', text: 'text-white' },
          { name: 'charcoal', bg: 'bg-gray-800', text: 'text-white' },
          { name: 'black', bg: 'bg-gray-900', text: 'text-white' }
        ].map(color => (
          <div 
            key={color.name}
            className={`p-2 rounded ${color.bg} ${color.text} text-xs font-medium`}
          >
            {color.name}
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Navigation Components
export const NavigationShowcase = () => (
  <div className="space-y-8">
    <div className="navbar-ios">
      <div className="navbar-ios-content">
        <button className="touch-target">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="font-semibold">DexTrends</h3>
        <button className="touch-target">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>
    
    <div className="h-32" />
    
    <div className="tabbar-ios">
      <div className="tabbar-ios-content">
        {['Home', 'Cards', 'Favorites', 'Profile'].map((item, index) => (
          <div 
            key={item}
            className={`tabbar-ios-item ${index === 0 ? 'active' : ''}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Responsive Grid Showcase
export const ResponsiveGridShowcase = () => (
  <div className="p-4 space-y-4">
    <h3 className="text-lg font-semibold mb-4">iPhone Responsive Grids</h3>
    
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium mb-2">iPhone SE Grid (2 columns)</p>
        <div className="grid grid-iphone-se">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card-ios text-center">
              <span className="text-sm">Item {i}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <p className="text-sm font-medium mb-2">iPhone Pro Max Grid (3 columns)</p>
        <div className="grid grid-iphone-max">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="card-ios text-center">
              <span className="text-sm">Item {i}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Main Design System Component
const MobileDesignSystem = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-2">DexTrends Mobile Design System</h1>
          <p className="text-sm text-gray-600 mb-6">
            Sophisticated, clean design optimized for iPhone displays
          </p>
        </div>
        
        <div className="space-y-8 pb-20">
          <TypographyScale />
          <SpacingGrid />
          <ColorShowcase />
          <ButtonShowcase />
          <CardShowcase />
          <FormShowcase />
          <ShadowShowcase />
          <ResponsiveGridShowcase />
          <NavigationShowcase />
        </div>
      </div>
    </div>
  );
};

export default MobileDesignSystem;