/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        finGreen: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          500: '#10b981',
          600: '#00b074',
          700: '#059669',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22'
        },
        finDark: {
          900: '#091e1d',
          800: '#0d2826',
          700: '#163835',
          600: '#1e293b'
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
