/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./layouts/**/*.{js,ts,jsx,tsx}", // Keep if you have this folder
  ],
  safelist: [
    // Essential Pokémon type badge classes (most commonly used)
    "bg-poke-normal", "bg-poke-fire", "bg-poke-water", "bg-poke-electric", "bg-poke-grass", "bg-poke-ice", 
    "bg-poke-fighting", "bg-poke-poison", "bg-poke-ground", "bg-poke-flying", "bg-poke-psychic", "bg-poke-bug", 
    "bg-poke-rock", "bg-poke-ghost", "bg-poke-dragon", "bg-poke-dark", "bg-poke-steel", "bg-poke-fairy",
    "border-poke-normal", "border-poke-fire", "border-poke-water", "border-poke-electric", "border-poke-grass", "border-poke-ice",
    "border-poke-fighting", "border-poke-poison", "border-poke-ground", "border-poke-flying", "border-poke-psychic", "border-poke-bug",
    "border-poke-rock", "border-poke-ghost", "border-poke-dragon", "border-poke-dark", "border-poke-steel", "border-poke-fairy",
    "hover:bg-poke-normal", "hover:bg-poke-fire", "hover:bg-poke-water", "hover:bg-poke-electric", "hover:bg-poke-grass", "hover:bg-poke-ice",
    "hover:bg-poke-fighting", "hover:bg-poke-poison", "hover:bg-poke-ground", "hover:bg-poke-flying", "hover:bg-poke-psychic", "hover:bg-poke-bug",
    "hover:bg-poke-rock", "hover:bg-poke-ghost", "hover:bg-poke-dragon", "hover:bg-poke-dark", "hover:bg-poke-steel", "hover:bg-poke-fairy",
    // Type badge classes for Pocket mode
    "type-badge", "bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-400", "bg-pink-500", "bg-cyan-400",
    "bg-indigo-600", "bg-gray-800", "bg-pink-400", "bg-gray-400", "bg-orange-600", "bg-indigo-400", "bg-purple-500",
    "bg-yellow-600", "bg-stone-500", "bg-lime-500", "bg-purple-600", "bg-slate-500", "bg-gray-300", "bg-emerald-500",
    "size-sm", "size-md", "size-lg", "size-list",
    // Core utility classes used in TypeBadge and cards
    "text-white", "bg-gray-100", "bg-gray-200", "border-gray-200", "border-gray-300", "hover:bg-gray-200", "hover:bg-gray-300",
    "bg-blue-100", "text-blue-900", "border-blue-200", "hover:bg-blue-200",
    "bg-yellow-100", "text-gray-800", "border-yellow-200", "hover:bg-yellow-200",
  ],
  theme: {
    extend: {
      colors: {
        // Premium, sophisticated palette
        primary: {
          DEFAULT: "var(--color-primary-default)",
          foreground: "#fff",
          hover: "var(--color-primary-darker)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary-default)",
          foreground: "#222f3f",
          hover: "var(--color-secondary-darker)",
        },
        accent: {
          DEFAULT: "var(--color-accent-default)",
          foreground: "#fff",
          hover: "var(--color-accent-darker)",
        },
        background: "var(--color-background-default)",
        surface: "var(--color-surface-default)",
        navbar: {
          DEFAULT: "var(--color-navbar-default)",
          scrolled: "var(--color-navbar-scrolled)",
        },
        border: "var(--color-border-default)",
        ring: "var(--color-primary-default)",
        foreground: {
          DEFAULT: "#222f3f",
          muted: "#7b8794",
        },
        card: {
          DEFAULT: "var(--color-card-background)",
          foreground: "var(--color-card-foreground)",
        },
        input: {
          DEFAULT: "var(--color-surface-default)",
          text: "#222f3f",
          border: "var(--color-border-default)",
          placeholder: "#b0b8c1",
        },
        text: {
          heading: "#22304f",
          subheading: "#22304f",
          body: "#222f3f",
          muted: "#7b8794",
          navbar: "#22304f",
          inverted: "#fff",
          link: "var(--color-primary-default)",
          'link-hover': "var(--color-primary-darker)",
          highlight: "var(--color-secondary-default)",
          'highlight-hover': "var(--color-secondary-darker)",
        },
        chart: {
          background: "#f5f7fa",
          legend: "#222f3f"
        },
        // Official Pokémon type colors
        'poke-normal': '#A8A77A',
        'poke-fire': '#EE8130',
        'poke-water': '#6390F0',
        'poke-electric': '#F7D02C',
        'poke-grass': '#7AC74C',
        'poke-ice': '#96D9D6',
        'poke-fighting': '#C22E28',
        'poke-poison': '#A33EA1',
        'poke-ground': '#E2BF65',
        'poke-flying': '#A98FF3',
        'poke-psychic': '#F95587',
        'poke-bug': '#A6B91A',
        'poke-rock': '#B6A136',
        'poke-ghost': '#735797',
        'poke-dragon': '#6F35FC',
        'poke-dark': '#705746',
        'poke-steel': '#B7B7CE',
        'poke-fairy': '#D685AD',
      },
      fontFamily: {
        // Ensure these CSS variables are defined in globals.css
        // Tailwind will automatically append the OS-default fallbacks
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui'],
        serif: ['var(--font-serif)', 'ui-serif', 'Georgia'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular'],
      },
      borderRadius: {
        // Extend Tailwind's default scale or use your 'app-' prefixed ones
        // If 'app-' is your design system, ensure they are used consistently
        'app-sm': 'var(--radius-sm, 0.25rem)', // Fallback to a sensible default
        'app-md': 'var(--radius-md, 0.5rem)',
        'app-lg': 'var(--radius-lg, 0.75rem)',
        'app-xl': 'var(--radius-xl, 1rem)',
        'app-full': '9999px',
        // You can also override Tailwind's defaults if 'app-' IS your default scale
        // DEFAULT: 'var(--radius-md)',
        // sm: 'var(--radius-sm)',
        // lg: 'var(--radius-lg)',
        // etc.
      },
      boxShadow: {
        // Define shadows using your CSS variable for shadow color for themeability
        'app': '0 2px 4px 0 var(--color-shadow-default)', // Simplified name
        'app-md': '0 4px 8px 0 var(--color-shadow-default)', // Simplified name
        // You can still use Tailwind's 'sm', 'md', 'lg', 'xl', '2xl' which are quite good.
        // This extend block adds your custom ones.
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1.5rem',
          md: '2rem', // Added for more granular control
          lg: '3rem', // Previous was 2rem, potentially increased
          xl: '4rem', // Added for wider screens
        },
        // screens: { ... } // Only override if container breakpoints need to differ from global
      },
      // Custom animations for our application
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scale: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-in-out',
        slideUp: 'slideUp 0.5s ease-in-out',
        scale: 'scale 0.5s ease-in-out',
        pulse: 'pulse 2s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite',
        bounce: 'bounce 1s ease-in-out infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
        strategy: 'class', // Recommended: add .form-input, .form-select etc.
                           // Or 'base' to style inputs globally (less control)
    }),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    // Consider: require('@tailwindcss/container-queries'),
  ],
};