/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light Mode
        'warm-white': '#FAF9F6',
        'soft-ivory': '#FDFBF7',
        'muted-violet': '#9B8CB5',
        'gentle-mint': '#A8D5BA',
        'lavender': '#C4B8E0',
        'deep-charcoal': '#2D2D2D',
        'neutral-border': '#E8E4DE',

        // Dark Mode
        'dark-bg': '#1A1A1A',
        'dark-surface': '#242424',
        'dark-violet': '#8B7AA0',
        'dark-mint': '#7BC19B',
        'off-white': '#F5F5F5',
      },
      boxShadow: {
        'clay': '0 4px 0 0 rgba(0, 0, 0, 0.1), 0 8px 20px rgba(0, 0, 0, 0.1)',
        'clay-hover': '0 2px 0 0 rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.1)',
        'clay-dark': '0 4px 0 0 rgba(0, 0, 0, 0.3), 0 8px 20px rgba(0, 0, 0, 0.3)',
      },
      borderRadius: {
        'clay': '16px',
        'clay-sm': '12px',
      },
    },
  },
  plugins: [],
}
