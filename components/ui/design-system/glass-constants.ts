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
        tertiary: '#D6D3D1',   // Stone 300 - WCAG AA compliant (6.3:1 on stone-900)
        // Note: Stone 400 (#A8A29E) has only 4.1:1 contrast - fails WCAG
      },
      border: {
        subtle: '#44403C',     // Stone 700
        default: '#57534E',    // Stone 600
      },
    },
  },
  // Semantic status colors
  status: {
    success: {
      bg: '#DCFCE7',        // Green 100
      text: '#166534',       // Green 800
      border: '#86EFAC',     // Green 300
      dark: {
        bg: '#14532D',       // Green 900
        text: '#86EFAC',     // Green 300
        border: '#22C55E',   // Green 500
      },
    },
    warning: {
      bg: '#FEF3C7',        // Amber 100
      text: '#92400E',       // Amber 800
      border: '#FCD34D',     // Amber 300
      dark: {
        bg: '#78350F',       // Amber 900
        text: '#FCD34D',     // Amber 300
        border: '#F59E0B',   // Amber 500
      },
    },
    error: {
      bg: '#FEE2E2',        // Red 100
      text: '#991B1B',       // Red 800
      border: '#FCA5A5',     // Red 300
      dark: {
        bg: '#7F1D1D',       // Red 900
        text: '#FCA5A5',     // Red 300
        border: '#EF4444',   // Red 500
      },
    },
    info: {
      bg: '#DBEAFE',        // Blue 100
      text: '#1E40AF',       // Blue 800
      border: '#93C5FD',     // Blue 300
      dark: {
        bg: '#1E3A8A',       // Blue 900
        text: '#93C5FD',     // Blue 300
        border: '#3B82F6',   // Blue 500
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
  dark: 'from-stone-600 to-stone-800',
  fairy: 'from-pink-300 to-pink-500',
  normal: 'from-stone-300 to-stone-500',
  fighting: 'from-red-500 to-red-700',
  flying: 'from-blue-300 to-indigo-400',
  poison: 'from-purple-400 to-purple-600',
  ground: 'from-amber-400 to-orange-500',
  rock: 'from-amber-600 to-amber-800',
  bug: 'from-lime-400 to-green-500',
  ghost: 'from-purple-500 to-indigo-700',
  steel: 'from-stone-400 to-stone-600',
} as const;

// Solid type colors for dots/indicators/backgrounds
export const TYPE_COLORS: Record<string, string> = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  electric: '#F8D030',
  grass: '#78C850',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
  fairy: '#EE99AC',
} as const;

// ===========================================
// TYPOGRAPHY - Consistent text styling
// ===========================================

export const TYPOGRAPHY = {
  // Font families
  font: {
    sans: 'font-sans', // System font stack
    mono: 'font-mono', // Monospace for code/stats
  },
  // Font sizes with line heights
  size: {
    xs: 'text-xs leading-4',        // 12px / 16px
    sm: 'text-sm leading-5',        // 14px / 20px
    base: 'text-base leading-6',    // 16px / 24px
    lg: 'text-lg leading-7',        // 18px / 28px
    xl: 'text-xl leading-7',        // 20px / 28px
    '2xl': 'text-2xl leading-8',    // 24px / 32px
    '3xl': 'text-3xl leading-9',    // 30px / 36px
    '4xl': 'text-4xl leading-10',   // 36px / 40px
    '5xl': 'text-5xl leading-none', // 48px
  },
  // Font weights
  weight: {
    normal: 'font-normal',    // 400
    medium: 'font-medium',    // 500
    semibold: 'font-semibold', // 600
    bold: 'font-bold',        // 700
  },
  // Text colors
  color: {
    primary: 'text-stone-900 dark:text-white',
    secondary: 'text-stone-600 dark:text-stone-300',
    muted: 'text-stone-500 dark:text-stone-300',
    disabled: 'text-stone-400 dark:text-stone-500',
    accent: 'text-amber-600 dark:text-amber-400',
    success: 'text-green-600 dark:text-green-400',
    error: 'text-red-600 dark:text-red-400',
    warning: 'text-orange-600 dark:text-orange-400',
  },
  // Heading presets
  heading: {
    h1: 'text-3xl md:text-4xl font-bold text-stone-900 dark:text-white',
    h2: 'text-2xl md:text-3xl font-bold text-stone-900 dark:text-white',
    h3: 'text-xl md:text-2xl font-semibold text-stone-900 dark:text-white',
    h4: 'text-lg md:text-xl font-semibold text-stone-900 dark:text-white',
    h5: 'text-base md:text-lg font-medium text-stone-900 dark:text-white',
    h6: 'text-sm md:text-base font-medium text-stone-900 dark:text-white',
  },
  // Body text presets
  body: {
    lg: 'text-lg text-stone-600 dark:text-stone-300 leading-relaxed',
    base: 'text-base text-stone-600 dark:text-stone-300 leading-relaxed',
    sm: 'text-sm text-stone-500 dark:text-stone-300 leading-relaxed',
  },
  // Utility text
  caption: 'text-xs text-stone-500 dark:text-stone-300',
  label: 'text-sm font-medium text-stone-700 dark:text-stone-200',
  stat: 'text-2xl md:text-3xl font-bold tabular-nums',
  statLabel: 'text-xs uppercase tracking-wide text-stone-500 dark:text-stone-300',
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
// SPACING - Consistent spacing system
// ===========================================

export const SPACING = {
  // Page padding (horizontal) - responsive
  page: {
    mobile: 'px-4',         // 16px
    tablet: 'px-6',         // 24px
    desktop: 'px-8',        // 32px
    responsive: 'px-4 sm:px-6 lg:px-8',
  },
  // Section spacing (vertical between sections)
  section: {
    sm: 'py-4',             // 16px
    md: 'py-6 md:py-8',     // 24-32px
    lg: 'py-8 md:py-12',    // 32-48px
    xl: 'py-12 md:py-16',   // 48-64px
  },
  // Grid gaps - mobile-first optimized
  grid: {
    xs: 'gap-1.5',          // 6px - tight grids
    sm: 'gap-2',            // 8px - mobile grids
    md: 'gap-3',            // 12px - tablet grids
    lg: 'gap-4',            // 16px - desktop grids
    responsive: 'gap-2 sm:gap-3 lg:gap-4',
  },
  // Card internal padding
  card: {
    sm: 'p-3',              // 12px - compact cards
    md: 'p-4',              // 16px - standard cards
    lg: 'p-5',              // 20px - larger cards
    xl: 'p-6',              // 24px - featured cards
  },
  // Inline spacing (gaps between elements)
  inline: {
    xs: 'gap-1',            // 4px
    sm: 'gap-1.5',          // 6px
    md: 'gap-2',            // 8px
    lg: 'gap-3',            // 12px
    xl: 'gap-4',            // 16px
  },
  // Stack spacing (vertical gaps)
  stack: {
    xs: 'space-y-1',        // 4px
    sm: 'space-y-2',        // 8px
    md: 'space-y-3',        // 12px
    lg: 'space-y-4',        // 16px
    xl: 'space-y-6',        // 24px
  },
} as const;

// ===========================================
// TOUCH TARGETS - Mobile-first accessibility
// ===========================================

export const TOUCH_TARGET = {
  // Minimum touch targets per Apple HIG
  min: 'min-h-[44px] min-w-[44px]',
  // Comfortable touch targets
  comfortable: 'min-h-[48px] min-w-[48px]',
  // Button sizes
  button: {
    sm: 'min-h-[36px] px-3 py-2',
    md: 'min-h-[44px] px-4 py-2.5',
    lg: 'min-h-[48px] px-5 py-3',
  },
  // Touch feedback utilities
  feedback: {
    tap: 'active:scale-[0.97] transition-transform duration-100',
    press: 'active:bg-stone-100 dark:active:bg-stone-800',
    highlight: 'tap-highlight-transparent touch-manipulation',
  },
} as const;

// ===========================================
// DISABLED - Consistent disabled state styling
// ===========================================

export const DISABLED = {
  // Opacity reduction for disabled elements
  opacity: 'opacity-50',
  // Cursor style
  cursor: 'cursor-not-allowed',
  // Combined styles for interactive elements
  interactive: 'opacity-50 cursor-not-allowed pointer-events-none',
  // Softer version (for less prominent elements)
  soft: 'opacity-40 cursor-not-allowed',
  // Button specific
  button: 'opacity-50 cursor-not-allowed hover:opacity-50 active:opacity-50',
  // Input specific
  input: 'opacity-60 cursor-not-allowed bg-stone-100 dark:bg-stone-800',
  // Colors for disabled text
  text: {
    light: 'text-stone-400',
    dark: 'dark:text-stone-500',
    combined: 'text-stone-400 dark:text-stone-500',
  },
  // Background for disabled elements
  bg: {
    light: 'bg-stone-100',
    dark: 'dark:bg-stone-800',
    combined: 'bg-stone-100 dark:bg-stone-800',
  },
  // Border for disabled elements
  border: {
    light: 'border-stone-200',
    dark: 'dark:border-stone-700',
    combined: 'border-stone-200 dark:border-stone-700',
  },
} as const;

// ===========================================
// FOCUS - WCAG 2.1 AA Compliant Focus Styles
// ===========================================

export const FOCUS = {
  // Focus ring colors
  ring: {
    light: '#f59e0b',           // Amber 500 - visible on light backgrounds
    dark: '#fbbf24',            // Amber 400 - visible on dark backgrounds
    input: '#3b82f6',           // Blue 500 - form inputs
  },
  // Focus ring styles (Tailwind classes)
  styles: {
    default: 'focus-visible:outline-2 focus-visible:outline-amber-500 focus-visible:outline-offset-2',
    input: 'focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:ring-4 focus-visible:ring-blue-500/15',
    card: 'focus-visible:outline-2 focus-visible:outline-amber-500 focus-visible:outline-offset-2 focus-visible:scale-[1.02]',
    button: 'focus-visible:outline-2 focus-visible:outline-amber-500 focus-visible:outline-offset-2',
    // Remove focus (use sparingly)
    none: 'focus:outline-none focus-visible:outline-none',
  },
  // CSS custom property for use in stylesheets
  cssVar: '--focus-ring-color',
} as const;

// ===========================================
// CARD INTERACTIONS - Unified interactive card patterns
// ===========================================

export const CARD_INTERACTIONS = {
  // Standard hover effect for cards
  hover: {
    classes: 'hover:-translate-y-1 hover:shadow-lg transition-all duration-200',
    framer: { y: -4, transition: { duration: 0.2, ease: 'easeOut' } },
  },
  // Tap/press effect for touch
  tap: {
    classes: 'active:scale-[0.98] transition-transform duration-100',
    framer: { scale: 0.98, transition: { duration: 0.1 } },
  },
  // Focus visible for keyboard navigation
  focus: {
    classes: 'focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none',
    ringColor: '#f59e0b', // amber-500
  },
  // Combined - use for all interactive cards
  combined: 'hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none transition-all duration-200',
  // Link-style cards
  link: 'hover:shadow-md hover:border-amber-400 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none transition-all duration-150',
} as const;

// ===========================================
// LOADING MESSAGES - Consistent loading text
// ===========================================

export const LOADING_MESSAGES = {
  // Page-level loading
  pokemon: 'Loading Pokémon...',
  pokedex: 'Loading Pokédex...',
  tcgSets: 'Loading TCG sets...',
  tcgCards: 'Loading cards...',
  pocketExpansions: 'Loading Pocket expansions...',
  pocketCards: 'Loading Pocket cards...',
  // Feature-specific
  trends: 'Analyzing market trends...',
  favorites: 'Loading your favorites...',
  search: 'Searching...',
  // Infinite scroll
  loadingMore: 'Loading more...',
  loadingMoreSets: 'Loading more sets...',
  loadingMoreCards: 'Loading more cards...',
  loadingMorePokemon: 'Loading more Pokémon...',
  // Actions
  saving: 'Saving...',
  updating: 'Updating...',
  deleting: 'Deleting...',
  // Retry states
  retrying: 'Retrying...',
  retryingWithCount: (count: number) => `Retrying... (Attempt ${count})`,
} as const;

// ===========================================
// EMPTY STATE PRESETS - Type presets for EmptyState
// ===========================================

export const EMPTY_STATE_PRESETS = {
  noResults: {
    illustration: 'search' as const,
    title: 'No results found',
    description: 'Try adjusting your search or filters to find what you\'re looking for.',
  },
  apiError: {
    illustration: 'error' as const,
    title: 'Failed to load',
    description: 'We encountered an error while loading this content. Please try again.',
  },
  noData: {
    illustration: 'empty' as const,
    title: 'No data available',
    description: 'There\'s nothing here yet.',
  },
  filteredEmpty: {
    illustration: 'search' as const,
    title: 'No matches for filters',
    description: 'Try adjusting or clearing your filters.',
  },
  emptyCollection: {
    illustration: 'collection' as const,
    title: 'Your collection is empty',
    description: 'Start adding items to build your collection.',
  },
  noPokemon: {
    illustration: 'pokemon' as const,
    title: 'No Pokémon found',
    description: 'Try searching for a different Pokémon or adjusting your filters.',
  },
  noCards: {
    illustration: 'card' as const,
    title: 'No cards found',
    description: 'Try searching for a different card or adjusting your filters.',
  },
} as const;

// ===========================================
// TEXT TRUNCATION - Consistent text clipping
// ===========================================

export const TEXT_TRUNCATE = {
  /** Single line truncation with ellipsis */
  single: 'truncate',
  /** Two line clamp */
  double: 'line-clamp-2',
  /** Three line clamp */
  triple: 'line-clamp-3',
  /** Four line clamp */
  quad: 'line-clamp-4',
  /** No truncation */
  none: '',
  /** Word break for long words */
  breakWord: 'break-words',
  /** Break anywhere (for URLs, hashes) */
  breakAll: 'break-all',
} as const;

// ===========================================
// REGION ACCENT COLORS
// ===========================================

export const REGION_ACCENTS = {
  kanto: 'from-red-500 to-blue-500',
  johto: 'from-amber-400 to-stone-500',
  hoenn: 'from-emerald-500 to-blue-500',
  sinnoh: 'from-indigo-500 to-purple-500',
  unova: 'from-stone-500 to-stone-800',
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
  // Typography tokens (new)
  TYPOGRAPHY,
  // Animation tokens (new)
  ANIMATION_DURATION,
  SPRING_PHYSICS,
  // Spacing & touch targets (mobile redesign)
  SPACING,
  TOUCH_TARGET,
  // Focus (WCAG 2.1 AA)
  FOCUS,
  // Disabled state tokens
  DISABLED,
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
  TYPE_COLORS,
  REGION_ACCENTS,
  // Card interactions (Sprint 3)
  CARD_INTERACTIONS,
  LOADING_MESSAGES,
  EMPTY_STATE_PRESETS,
  // Text utilities
  TEXT_TRUNCATE,
  // Functions
  glassClasses,
  createGlassStyle,
};
