/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        sand: {
          50: 'var(--sand-50)',
          100: 'var(--sand-100)',
          200: 'var(--sand-200)',
        },
        ink: {
          400: 'var(--ink-400)',
          500: 'var(--ink-500)',
          700: 'var(--ink-700)',
          900: 'var(--ink-900)',
        },
        copper: {
          500: 'var(--copper-500)',
          600: 'var(--copper-600)',
        },
        success: { 500: 'var(--success-500)' },
        warning: { 500: 'var(--warning-500)' },
        danger: { 500: 'var(--danger-500)' },
      },
      fontFamily: {
        display: ['var(--font-display)'],
        sans: ['var(--font-sans)'],
      },
      boxShadow: {
        paper: '0 1px 2px rgba(27,42,78,0.04), 0 1px 1px rgba(27,42,78,0.03)',
      },
      borderRadius: {
        xl: '12px',
      },
    },
  },
  plugins: [],
}
