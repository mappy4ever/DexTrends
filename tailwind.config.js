/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./layouts/**/*.{js,ts,jsx,tsx}", // Keep if you have this folder
  ],
  theme: {
    extend: {
      colors: {
        // Core semantic colors using CSS Variables defined in globals.css
        primary: {
          DEFAULT: "var(--color-primary-default)",
          foreground: "var(--color-text-inverted)", // Text on primary background
          hover: "var(--color-primary-darker)",    // For hover states of primary elements
        },
        secondary: {
          DEFAULT: "var(--color-secondary-default)",
          foreground: "var(--color-text-body)", // Text on secondary (depends on secondary's lightness)
          hover: "var(--color-secondary-darker)",
        },
        accent: {
          DEFAULT: "var(--color-accent-default)",
          foreground: "var(--color-text-inverted)", // Text on accent
          hover: "var(--color-accent-darker)",
        },
        // UI elements
        background: "var(--color-background-default)",
        surface: "var(--color-surface-default)", // For cards, modals, etc.
        navbar: {
          DEFAULT: "var(--color-navbar-default)",
          scrolled: "var(--color-navbar-scrolled)",
        },
        border: "var(--color-border-default)",
        ring: "var(--color-primary-default)", // For focus rings, often matches primary

        // Foreground (text) colors
        foreground: {
            DEFAULT: "var(--color-foreground-default)",
            muted: "var(--color-foreground-muted)",
            // Add more if needed: subtle, emphasis, etc.
        },
        // Card specific colors (can often just use surface and foreground)
        card: {
            DEFAULT: "var(--color-card-background)",
            foreground: "var(--color-card-foreground)",
        },
        // Input specific colors
        input: {
            DEFAULT: "var(--color-input-background)", // Input field background
            text: "var(--color-input-text)",
            border: "var(--color-input-border)",
            placeholder: "var(--color-input-placeholder)",
        },
        // Direct text color mapping (use foreground.DEFAULT/muted where possible)
        text: {
          heading: "var(--color-text-heading)",
          subheading: "var(--color-text-subheading)",
          body: "var(--color-text-body)", // Aliased by foreground.DEFAULT
          muted: "var(--color-text-muted)", // Aliased by foreground.muted
          navbar: "var(--color-text-navbar)", // Specific for navbar if different
          inverted: "var(--color-text-inverted)",
          link: "var(--color-text-link)",
          'link-hover': "var(--color-text-link-hover)",
          highlight: "var(--color-text-highlight)",
          'highlight-hover': "var(--color-text-highlight-hover)",
        },
        // Chart colors (if they don't fit into the primary/secondary/accent model)
        chart: {
          background: "var(--color-chart-background)",
		  legend: "var(--color-text-body)"
          // e.g., series1: 'var(--color-chart-series-1)',
        },
        // Removed button & button-secondary color objects.
        // Button styling is better handled by .btn-primary, .btn-secondary in CSS
        // using the primary, secondary, accent colors directly.
        // Example: bg-primary, text-primary-foreground
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
      // Example: Adding custom keyframes/animations if not in globals.css
      // keyframes: {
      //   fadeIn: {
      //     '0%': { opacity: '0', transform: 'scale(0.95)' },
      //     '100%': { opacity: '1', transform: 'scale(1)' },
      //   },
      // },
      // animation: {
      //   fadeIn: 'fadeIn 0.3s ease-out forwards',
      // },
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