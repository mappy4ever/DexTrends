// Logo configuration based on metadata
export const logoConfig = {
  horizontal: {
    src: '/images/dextrends-horizontal-logo.png',
    width: 480,
    height: 180,
    alt: 'DexTrends - Horizontal Logo',
    usage: ['navbar', 'header', 'tight-spaces']
  },
  vertical: {
    src: '/images/dextrends-vertical-logo.png',
    width: 500,
    height: 600,
    alt: 'DexTrends - Vertical Logo',
    usage: ['homepage', 'hero-sections', 'main-branding']
  }
};

export const getLogoConfig = (variant = 'vertical') => {
  return logoConfig[variant] || logoConfig.vertical;
};

export const getLogoForContext = (context) => {
  const contextMap = {
    navbar: 'horizontal',
    header: 'horizontal',
    'tight-space': 'horizontal',
    homepage: 'vertical',
    hero: 'vertical',
    main: 'vertical'
  };
  
  const variant = contextMap[context] || 'vertical';
  return getLogoConfig(variant);
};