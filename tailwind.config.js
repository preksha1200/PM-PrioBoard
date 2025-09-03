/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          red: 'var(--color-primary-red)',
          cream: 'var(--color-cream)',
          'soft-blue': 'var(--color-soft-blue)',
          'ocean-blue': 'var(--color-ocean-blue)',
          'deep-navy': 'var(--color-deep-navy)',
          terracotta: 'var(--color-terracotta)',
        },
        gray: {
          900: 'var(--color-gray-900)',
          700: 'var(--color-gray-700)',
          500: 'var(--color-gray-500)',
          300: 'var(--color-gray-300)',
          100: 'var(--color-gray-100)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
