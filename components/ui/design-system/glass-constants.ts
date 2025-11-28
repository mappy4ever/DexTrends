/**
 * DexTrends Unified Design System
 *
 * Design Philosophy:
 * - Clean Minimal aesthetic (Apple-inspired)
 * - Warm cream backgrounds with amber accents
 * - Consistent border radius (xl = 12px for most elements)
 * - Subtle micro-interactions, no heavy effects
 * - Works beautifully on both mobile and desktop
 *
 * Updated: 2025-11-27 - Warm Tones Overhaul
 */

// ===========================================
// COLORS - Warm Palette
// ===========================================

export const COLORS = {
  // Warm backgrounds
  warm: {
    bg: {
      primary: '#FFFDF7',      // Soft cream - main background
      secondary: '#FBF8F3',    // Light beige - cards
      tertiary: '#F5F1EA',     // Warm gray - secondary surfaces
      elevated: '#FFFFFF',      // Pure white - elevated cards
    },
    // Amber-based accents
    accent: {
      primary: '#D97706',      // Amber 600 - primary actions
      secondary: '#B45309',    // Amber 700 - hover states
      tertiary: '#92400E',     // Amber 800 - active states
      soft: '#FEF3C7',         // Amber 100 - soft highlights
    },
    // Stone palette for text (warmer than gray)
    text: {
      primary: '#292524',      // Stone 800 - headings
      secondary: '#57534E',    // Stone 600 - body text
      tertiary: '#78716C',     // Stone 500 - muted text
      disabled: '#A8A29E',     // Stone 400 - disabled
    },
    // Warm borders
    border: {
      subtle: '#E7E5E4',       // Stone 200
      default: '#D6D3D1',      // Stone 300
      strong: '#A8A29E',       // Stone 400
    },
    // Dark mode variants
    dark: {
      bg: {
        primary: '#1C1917',    // Stone 900
        secondary: '#292524',  // Stone 800
        tertiary: '#44403C',   // Stone 700
      },
      text: {
        primary: '#FAFAF9',    // Stone 50
        secondary: '#E7E5E4',  // Stone 200
        tertiary: '#A8A29E',   // Stone 400
      },
      border: {
        subtle: '#44403C',     // Stone 700
        default: '#57534E',    // Stone 600
      },
    },
  },
} as const;

// ===========================================
// SURFACE - Clean background presets
// ===========================================

export const SURFACE = {
  // Main page background
  primary: 'bg-[#FFFDF7] dark:bg-stone-900',
  // Secondary surfaces (sidebar, sections)
  secondary: 'bg-[#FBF8F3] dark:bg-stone-800',
  // Elevated elements (cards, modals)
  elevated: 'bg-white dark:bg-stone-800',
  // Card preset with border
  card: 'bg-white dark:bg-stone-800/95 border border-stone-200 dark:border-stone-700',
  // Subtle card (less prominent)
  cardSubtle: 'bg-stone-50 dark:bg-stone-800/80 border border-stone-100 dark:border-stone-700/50',
} as const;

// ===========================================
// BORDER RADIUS - Unified System
// ===========================================
// Use these values consistently across ALL components:
// - Buttons: rounded-xl (12px) - NOT pill-shaped
// - Cards/Containers: rounded-xl (12px)
// - Modals: rounded-2xl (16px)
// - Badges/Tags: rounded-lg (8px)
// - Avatars/Icons: rounded-full

export const RADIUS = {
  none: 'rounded-none',      // 0px
  sm: 'rounded',             // 4px - tiny elements
  md: 'rounded-lg',          // 8px - badges, tags
  lg: 'rounded-xl',          // 12px - buttons, cards, inputs
  xl: 'rounded-2xl',         // 16px - modals, larger panels
  '2xl': 'rounded-3xl',      // 24px - hero sections
  full: 'rounded-full',      // circles, avatars
} as const;

// ===========================================
// GLASS MORPHISM - Clean Implementation
// ===========================================

// Glass blur levels - use sparingly
export const GLASS_BLUR = {
  none: '',
  sm: 'backdrop-blur-sm',     // 4px - subtle
  md: 'backdrop-blur-md',     // 8px - default for most glass
  lg: 'backdrop-blur-lg',     // 16px - prominent glass panels
  xl: 'backdrop-blur-xl',     // 24px - modal overlays
  '2xl': 'backdrop-blur-2xl', // 40px - legacy
  '3xl': 'backdrop-blur-3xl', // 64px - legacy
} as const;

// Clean glass backgrounds - NO purple tints
export const GLASS_BG = {
  // Light glass (for light backgrounds)
  light: {
    subtle: 'bg-white/60 dark:bg-stone-900/60',
    medium: 'bg-white/75 dark:bg-stone-900/75',
    strong: 'bg-white/90 dark:bg-stone-900/90',
  },
  // Frosted glass (more opacity)
  frosted: {
    subtle: 'bg-stone-50/70 dark:bg-stone-800/70',
    medium: 'bg-stone-50/85 dark:bg-stone-800/85',
    strong: 'bg-white/95 dark:bg-stone-800/95',
  },
} as const;

// Legacy alias for backward compatibility
export const GLASS_OPACITY = {
  light: GLASS_BG.light,
  gradient: GLASS_BG.light, // Remove purple gradients - use plain glass
} as const;

// Glass borders - subtle, elegant
export const GLASS_BORDER = {
  none: '',
  subtle: 'border border-stone-200/50 dark:border-stone-700/50',
  medium: 'border border-stone-200 dark:border-stone-700',
  strong: 'border border-stone-300 dark:border-stone-600',
} as const;

// ===========================================
// SHADOWS - Consistent System
// ===========================================

export const SHADOW = {
  none: '',
  xs: 'shadow-[0_1px_2px_rgba(0,0,0,0.04)]',          // Very subtle
  sm: 'shadow-sm',                                    // Subtle lift
  md: 'shadow-md',                                    // Default cards
  lg: 'shadow-lg',                                    // Elevated cards
  xl: 'shadow-xl',                                    // Modals, dropdowns
  '2xl': 'shadow-2xl',                                // Hero elements
  // Refined layered shadows for depth
  soft: 'shadow-[0_2px_8px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)]',
  elevated: 'shadow-[0_4px_12px_rgba(0,0,0,0.05),0_8px_24px_rgba(0,0,0,0.05)]',
  floating: 'shadow-[0_8px_24px_rgba(0,0,0,0.08),0_16px_48px_rgba(0,0,0,0.06)]',
  // Colored shadows for special emphasis (subtle)
  primary: 'shadow-lg shadow-amber-500/15',
  success: 'shadow-lg shadow-emerald-500/15',
  warning: 'shadow-lg shadow-orange-500/15',
  danger: 'shadow-lg shadow-red-500/15',
} as const;

// Legacy alias
export const GLASS_SHADOW = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  glow: 'shadow-lg shadow-amber-500/15',
  glowHover: 'hover:shadow-xl hover:shadow-amber-500/20',
} as const;

// Legacy alias for border radius
export const GLASS_ROUNDED = RADIUS;

// ===========================================
// TRANSITIONS - Smooth & Professional
// ===========================================

export const TRANSITION = {
  none: '',
  fast: 'transition-all duration-100 ease-out',
  default: 'transition-all duration-150 ease-out',
  medium: 'transition-all duration-200 ease-out',
  slow: 'transition-all duration-300 ease-out',
  smooth: 'transition-all duration-500 ease-in-out',
  // Specific transitions for better performance
  shadow: 'transition-shadow duration-150 ease-out',
  transform: 'transition-transform duration-150 ease-out',
  opacity: 'transition-opacity duration-150 ease-out',
  colors: 'transition-colors duration-150 ease-out',
} as const;

// Legacy alias
export const GLASS_TRANSITION = TRANSITION;

// ===========================================
// ANIMATION DURATION - Standardized Timing
// ===========================================
// Use these values for consistent animation timing across the app

export const ANIMATION_DURATION = {
  instant: 75,     // Instant feedback (ms)
  fast: 150,       // Default transitions, hover effects
  medium: 200,     // Card transitions, small animations
  slow: 300,       // Modal transitions, larger animations
  slower: 500,     // Page transitions, complex animations
  // Tailwind class equivalents
  classes: {
    instant: 'duration-75',
    fast: 'duration-150',
    medium: 'duration-200',
    slow: 'duration-300',
    slower: 'duration-500',
  },
} as const;

// ===========================================
// SPRING PHYSICS - For framer-motion/animations
// ===========================================
// Standardized spring configurations for smooth animations

export const SPRING_PHYSICS = {
  // Quick, snappy animations (buttons, toggles)
  snappy: { type: 'spring', stiffness: 400, damping: 30 },
  // Default for most UI elements
  default: { type: 'spring', stiffness: 300, damping: 30 },
  // Smooth, gentle animations (modals, sheets)
  gentle: { type: 'spring', stiffness: 200, damping: 25 },
  // Bouncy animations (celebratory, playful)
  bouncy: { type: 'spring', stiffness: 300, damping: 15 },
  // No spring, just easing
  easing: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
} as const;

// ===========================================
// HOVER EFFECTS - Subtle & Elegant
// ===========================================

export const HOVER = {
  none: '',
  // Standard lift - the default hover for cards (per user preference)
  lift: 'hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg',
  // Subtle alternatives
  scale: 'hover:scale-[1.01]',
  glow: 'hover:shadow-md hover:shadow-amber-500/10',
  brighten: 'hover:brightness-[1.02]',
  // Combined effects
  shadowOnly: 'hover:shadow-md',
  subtle: 'hover:-translate-y-px hover:shadow-md',
  medium: 'hover:-translate-y-0.5 hover:shadow-lg',
  // Standard card hover - same as lift (per user preference: scale 1.02, -4px lift, shadow-lg)
  card: 'hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg',
  // Button hover with press feedback
  button: 'hover:shadow-md active:scale-[0.98]',
  link: 'hover:text-amber-600 dark:hover:text-amber-400',
} as const;

// Legacy alias
export const GLASS_HOVER = HOVER;

// ===========================================
// COMPONENT PRESETS - Ready-to-use combinations
// ===========================================

export const GLASS_STYLES = {
  // Standard card - clean and elegant
  card: [
    GLASS_BLUR.md,
    GLASS_BG.frosted.medium,
    GLASS_BORDER.subtle,
    SHADOW.md,
    RADIUS.lg,
    TRANSITION.default,
  ].filter(Boolean).join(' '),

  // Elevated card - more prominence
  cardElevated: [
    GLASS_BLUR.lg,
    GLASS_BG.frosted.strong,
    GLASS_BORDER.medium,
    SHADOW.lg,
    RADIUS.lg,
    TRANSITION.default,
    HOVER.lift,
  ].filter(Boolean).join(' '),

  // Panel/Container - subtle background
  container: [
    GLASS_BG.light.subtle,
    GLASS_BORDER.subtle,
    SHADOW.sm,
    RADIUS.lg,
  ].filter(Boolean).join(' '),

  // Modal - prominent with blur backdrop
  modal: [
    GLASS_BG.frosted.strong,
    GLASS_BORDER.medium,
    SHADOW.xl,
    RADIUS.xl,
  ].filter(Boolean).join(' '),

  // Button glass variant
  button: [
    GLASS_BLUR.sm,
    GLASS_BG.light.medium,
    GLASS_BORDER.subtle,
    SHADOW.sm,
    RADIUS.lg,
    TRANSITION.fast,
  ].filter(Boolean).join(' '),

  // Badge/Tag
  badge: [
    GLASS_BG.light.subtle,
    GLASS_BORDER.subtle,
    RADIUS.md,
  ].filter(Boolean).join(' '),

  // Input field
  input: [
    GLASS_BG.light.medium,
    GLASS_BORDER.medium,
    RADIUS.lg,
    TRANSITION.fast,
  ].filter(Boolean).join(' '),

  // Navbar
  navbar: [
    GLASS_BLUR.lg,
    GLASS_BG.frosted.medium,
    GLASS_BORDER.subtle,
    SHADOW.sm,
  ].filter(Boolean).join(' '),

  // Dropdown menu
  dropdown: [
    GLASS_BLUR.md,
    GLASS_BG.frosted.strong,
    GLASS_BORDER.medium,
    SHADOW.lg,
    RADIUS.lg,
  ].filter(Boolean).join(' '),

  // Legacy orb style
  orb: [
    GLASS_BLUR.xl,
    GLASS_BG.light.strong,
    GLASS_BORDER.medium,
    SHADOW.xl,
    RADIUS.full,
  ].filter(Boolean).join(' '),
} as const;

// ===========================================
// POKEMON TYPE GRADIENTS - Clean & Vibrant
// ===========================================

export const TYPE_GRADIENTS = {
  fire: 'from-orange-400 to-red-500',
  water: 'from-blue-400 to-cyan-500',
  grass: 'from-green-400 to-emerald-500',
  electric: 'from-yellow-300 to-amber-400',
  psychic: 'from-pink-400 to-purple-500',
  ice: 'from-cyan-300 to-blue-400',
  dragon: 'from-indigo-500 to-purple-600',
  dark: 'from-gray-600 to-gray-800',
  fairy: 'from-pink-300 to-pink-500',
  normal: 'from-gray-300 to-gray-500',
  fighting: 'from-red-500 to-red-700',
  flying: 'from-blue-300 to-indigo-400',
  poison: 'from-purple-400 to-purple-600',
  ground: 'from-amber-400 to-orange-500',
  rock: 'from-amber-600 to-amber-800',
  bug: 'from-lime-400 to-green-500',
  ghost: 'from-purple-500 to-indigo-700',
  steel: 'from-gray-400 to-gray-600',
} as const;

// ===========================================
// ICON SIZES - Consistent across app
// ===========================================

export const ICON_SIZE = {
  xs: 'w-3 h-3',        // 12px - tiny indicators
  sm: 'w-4 h-4',        // 16px - inline icons, badges
  md: 'w-5 h-5',        // 20px - default for buttons, inputs
  lg: 'w-6 h-6',        // 24px - prominent icons
  xl: 'w-8 h-8',        // 32px - feature icons
  '2xl': 'w-10 h-10',   // 40px - hero icons
  '3xl': 'w-12 h-12',   // 48px - large feature icons
} as const;

// Numeric values for react-icons
export const ICON_SIZE_PX = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
} as const;

// ===========================================
// INPUT SIZES - Consistent form elements
// ===========================================

export const INPUT_SIZE = {
  sm: {
    height: 'h-9',         // 36px
    padding: 'px-3 py-2',
    text: 'text-sm',
    iconSize: 'w-4 h-4',
  },
  md: {
    height: 'h-11',        // 44px - iOS touch target
    padding: 'px-4 py-2.5',
    text: 'text-base',
    iconSize: 'w-5 h-5',
  },
  lg: {
    height: 'h-12',        // 48px
    padding: 'px-5 py-3',
    text: 'text-lg',
    iconSize: 'w-5 h-5',
  },
} as const;

// ===========================================
// REGION ACCENT COLORS
// ===========================================

export const REGION_ACCENTS = {
  kanto: 'from-red-500 to-blue-500',
  johto: 'from-amber-400 to-gray-500',
  hoenn: 'from-emerald-500 to-blue-500',
  sinnoh: 'from-indigo-500 to-purple-500',
  unova: 'from-gray-500 to-gray-800',
  kalos: 'from-pink-500 to-purple-500',
  alola: 'from-orange-400 to-teal-500',
  galar: 'from-purple-500 to-red-500',
  paldea: 'from-red-500 to-purple-500',
} as const;

// ===========================================
// HELPER FUNCTIONS
// ===========================================

// Combine glass classes cleanly
export function glassClasses(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

// Build custom glass style
export function createGlassStyle(options: {
  blur?: keyof typeof GLASS_BLUR;
  opacity?: 'subtle' | 'medium' | 'strong';
  gradient?: boolean;
  border?: keyof typeof GLASS_BORDER;
  shadow?: keyof typeof GLASS_SHADOW;
  rounded?: keyof typeof GLASS_ROUNDED;
  hover?: keyof typeof GLASS_HOVER;
  transition?: keyof typeof GLASS_TRANSITION;
}): string {
  const {
    blur = 'md',
    opacity = 'medium',
    gradient = false, // Changed default to false - no more purple gradients
    border = 'subtle',
    shadow = 'md',
    rounded = 'lg',
    hover = 'none',
    transition = 'default',
  } = options;

  return glassClasses(
    GLASS_BLUR[blur],
    GLASS_BG.frosted[opacity], // Always use clean frosted glass
    GLASS_BORDER[border],
    GLASS_SHADOW[shadow],
    GLASS_ROUNDED[rounded],
    GLASS_TRANSITION[transition],
    GLASS_HOVER[hover]
  );
}

// ===========================================
// DEFAULT EXPORT
// ===========================================

export default {
  // NEW: Warm color palette
  COLORS,
  SURFACE,
  // Core design tokens
  RADIUS,
  SHADOW,
  TRANSITION,
  HOVER,
  ICON_SIZE,
  ICON_SIZE_PX,
  INPUT_SIZE,
  // Animation tokens (new)
  ANIMATION_DURATION,
  SPRING_PHYSICS,
  // Glass morphism (deprecated - use SURFACE instead)
  GLASS_BG,
  GLASS_BLUR,
  GLASS_OPACITY,
  GLASS_BORDER,
  GLASS_SHADOW,
  GLASS_ROUNDED,
  GLASS_TRANSITION,
  GLASS_HOVER,
  // Presets
  GLASS_STYLES,
  TYPE_GRADIENTS,
  REGION_ACCENTS,
  // Functions
  glassClasses,
  createGlassStyle,
};
