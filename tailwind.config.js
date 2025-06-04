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