// Logo configuration based on metadata

export interface LogoVariant {
  src: string;
  width: number;
  height: number;
  alt: string;
  usage: string[];
}

export interface LogoConfig {
  horizontal: LogoVariant;
  vertical: LogoVariant;
}

export type LogoVariantType = keyof LogoConfig;
export type LogoContext = 'navbar' | 'header' | 'tight-space' | 'homepage' | 'hero' | 'main';

export const logoConfig: LogoConfig = {
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

export const getLogoConfig = (variant: LogoVariantType = 'vertical'): LogoVariant => {
  return logoConfig[variant] || logoConfig.vertical;
};

export const getLogoForContext = (context: LogoContext): LogoVariant => {
  const contextMap: Record<LogoContext, LogoVariantType> = {
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