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
        medical: {
          50: '#f0f9fa',
          100: '#dcf1f3',
          200: '#bde2e7',
          300: '#90ccd5',
          400: '#5caab7',
          500: '#418e9c',
          600: '#387582',
          700: '#32616d',
          800: '#2f515b',
          900: '#2a454f',
          950: '#182c34',
        }
      }
    },
  },
  plugins: [],
}
