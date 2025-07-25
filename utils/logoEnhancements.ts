// Logo enhancement utilities

// Type definitions
interface LogoEnhancements {
  [key: string]: string;
}

interface FilterOptions {
  contrast?: number;
  saturate?: number;
  brightness?: number;
  hueRotate?: number;
}

interface FilterPreset {
  contrast: number;
  saturate: number;
  brightness: number;
}

type EnhancementContext = 
  | 'vibrant' 
  | 'superVibrant' 
  | 'darkVibrant' 
  | 'pastelDark' 
  | 'softDark' 
  | 'ultraDark' 
  | 'subtle' 
  | 'homepage' 
  | 'navbar';

type PresetName = 'mild' | 'moderate' | 'strong' | 'extreme';
type PastelPresetName = 'soft' | 'balanced' | 'defined';

// Logo enhancement filters
export const logoEnhancements: LogoEnhancements = {
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

// Get logo enhancement classes by context
export const getLogoEnhancement = (context: EnhancementContext | string = 'homepage'): string => {
  return logoEnhancements[context] || logoEnhancements.vibrant;
};

// Apply logo filters to an element
export const applyLogoFilters = (element: HTMLElement | null, enhancement: EnhancementContext | string = 'vibrant'): void => {
  if (typeof window === 'undefined' || !element) return;
  
  const filters = logoEnhancements[enhancement];
  if (filters) {
    // Remove existing filter classes
    const currentClasses = element.className;
    const cleanedClasses = currentClasses.replace(/filter[\s\w-]+/g, '').trim();
    element.className = `${cleanedClasses} ${filters}`.trim();
  }
};

// CSS filter string generators
export const generateFilterString = (options: FilterOptions = {}): string => {
  const {
    contrast = 200,
    saturate = 150,
    brightness = 75,
    hueRotate = 0
  } = options;
  
  return `filter: contrast(${contrast}%) saturate(${saturate}%) brightness(${brightness}%) hue-rotate(${hueRotate}deg);`;
};

// Preset dark enhancement configurations
export const darkPresets: Record<PresetName, FilterPreset> = {
  mild: { contrast: 175, saturate: 140, brightness: 85 },
  moderate: { contrast: 200, saturate: 150, brightness: 75 },
  strong: { contrast: 225, saturate: 175, brightness: 65 },
  extreme: { contrast: 250, saturate: 200, brightness: 60 }
};

// Pastel dark presets
export const pastelDarkPresets: Record<PastelPresetName, FilterPreset> = {
  soft: { contrast: 160, saturate: 100, brightness: 85 },
  balanced: { contrast: 175, saturate: 110, brightness: 80 },
  defined: { contrast: 190, saturate: 120, brightness: 75 }
};

// Get preset configuration
export const getPreset = (presetType: 'dark' | 'pastel', presetName: string): FilterPreset | null => {
  if (presetType === 'dark' && presetName in darkPresets) {
    return darkPresets[presetName as PresetName];
  }
  if (presetType === 'pastel' && presetName in pastelDarkPresets) {
    return pastelDarkPresets[presetName as PastelPresetName];
  }
  return null;
};

// Generate filter from preset
export const generateFilterFromPreset = (presetType: 'dark' | 'pastel', presetName: string): string => {
  const preset = getPreset(presetType, presetName);
  if (!preset) {
    return generateFilterString(); // Return default if preset not found
  }
  return generateFilterString(preset);
};