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
    src: '/images/DTLogo_Line.png',
    width: 640,
    height: 160,  // Adjusted for better navbar fit
    alt: 'DexTrends - Your Ultimate Pokemon Companion',
    usage: ['navbar', 'header', 'tight-spaces']
  },
  vertical: {
    src: '/images/DT_FullLogo.png',
    width: 800,
    height: 800,  // Square ratio for the new logo
    alt: 'DexTrends - Your Ultimate Pokemon Companion',
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