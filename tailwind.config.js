/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',  // Enables manual toggling with a class
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
	"./layouts/**/*.{js,ts,jsx,tsx}",
	"./public/**/*.{js,ts,jsx,tsx}",
	"./styles/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",  
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
		    },
		    navbar: {
          DEFAULT: "var(--color-navbar)",
          navbar: "var(--color-navbar)",
        },
        background: {
          DEFAULT: "var(--color-background)",
        },
        herobox: {
          DEFAULT: "var(--color-herobox)",
        },
        chart: {
          DEFAULT: "var(--color-chart)",
        },
        text: {
          primary: "var(--color-text-primary)",
          title: "var(--color-text-title)",
		  navbar: "var(--color-text-navbar)",
		  heroTitle: "var(--color-text-heroTitle)",
		  heroSubtitle: "var(--color-text-heroSubtitle)",
		  heroDescription: "var(--color-text-heroDescription)",	  
          heading: "var(--color-text-heading)",
          subheading: "var(--color-text-subheading)",
          comment: "var(--color-text-comment)",
		  highlight: "var(--color-highlight-cinnamon)",
          highlightHover: "var(--color-highlightHover)",
        },
        button: {
          DEFAULT: "var(--color-button)",
          hover: "var(--color-button-hover)",
          title: "var(--color-button-title)",
        },
      },
      fontFamily: {
        title: ["Helvetica Neue", "Arial", "sans-serif"],
        heading: ["Verdana", "sans-serif"],
        faq: ["Georgia", "serif"],
        subtitle: ["Verdana", "sans-serif"],
        body: ["Geneva", "Verdana", "sans-serif"],
        comment: ["Cambria", "serif"],
      },
      spacing: {
        sm: "16px",
        md: "24px",
        lg: "32px",
        xl: "40px",
      },
      borderRadius: {
        btn: "8px",
        card: "12px",
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
};
