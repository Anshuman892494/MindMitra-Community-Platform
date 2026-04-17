/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        primary: '#F43F5E',
        'primary-hover': '#E11D48',
        secondary: '#FB923C',
        accent: '#FACC15',
        'brand-bg': '#FFF7ED',
        'brand-border': '#FFEDD5',
        'brand-white': '#FFFFFF',
        'brand-text': '#111827',
        'brand-muted': '#6B7280',
        instagram: {
          orange: '#F56040',
          yellow: '#FCAF45',
          pink: '#E1306C',
          purple: '#833AB4'
        }
      }
    },
  },
  plugins: [],
}
