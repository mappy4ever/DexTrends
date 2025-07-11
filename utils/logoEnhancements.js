// Logo enhancement utilities
export const logoEnhancements = {
  vibrant: 'filter contrast-125 saturate-120 brightness-110 drop-shadow-2xl',
  superVibrant: 'filter contrast-150 saturate-150 brightness-115 drop-shadow-2xl',
  darkVibrant: 'filter contrast-200 saturate-150 brightness-75 drop-shadow-2xl',
  pastelDark: 'filter contrast-175 saturate-110 brightness-80 drop-shadow-2xl',
  softDark: 'filter contrast-160 saturate-100 brightness-85 drop-shadow-2xl',
  ultraDark: 'filter contrast-250 saturate-200 brightness-60 drop-shadow-2xl',
  subtle: 'filter contrast-110 saturate-105 brightness-102 drop-shadow-lg',
  homepage: 'filter contrast-175 saturate-110 brightness-80 drop-shadow-2xl',
  navbar: 'filter contrast-150 saturate-130 brightness-80'
};

export const getLogoEnhancement = (context = 'homepage') => {
  return logoEnhancements[context] || logoEnhancements.vibrant;
};

export const applyLogoFilters = (element, enhancement = 'vibrant') => {
  if (typeof window === 'undefined') return;
  
  const filters = logoEnhancements[enhancement];
  if (element && filters) {
    element.className = element.className.replace(/filter[\s\w-]+/g, '') + ' ' + filters;
  }
};

// CSS filter string generators
export const generateFilterString = (options = {}) => {
  const {
    contrast = 200,
    saturate = 150,
    brightness = 75,
    hueRotate = 0
  } = options;
  
  return `filter: contrast(${contrast}%) saturate(${saturate}%) brightness(${brightness}%) hue-rotate(${hueRotate}deg);`;
};

// Preset dark enhancement configurations
export const darkPresets = {
  mild: { contrast: 175, saturate: 140, brightness: 85 },
  moderate: { contrast: 200, saturate: 150, brightness: 75 },
  strong: { contrast: 225, saturate: 175, brightness: 65 },
  extreme: { contrast: 250, saturate: 200, brightness: 60 }
};

// Pastel dark presets
export const pastelDarkPresets = {
  soft: { contrast: 160, saturate: 100, brightness: 85 },
  balanced: { contrast: 175, saturate: 110, brightness: 80 },
  defined: { contrast: 190, saturate: 120, brightness: 75 }
};