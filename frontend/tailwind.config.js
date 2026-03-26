/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--bg-body)',
        surface: 'var(--bg-surface)',
        'surface-2': 'var(--bg-surface-2)',
        sidebar: 'var(--bg-sidebar)',
        header: 'var(--bg-header)',
        primary: 'var(--pnb-burgundy)',
        'primary-light': 'var(--pnb-burgundy-light)',
        'primary-dark': 'var(--pnb-burgundy-dark)',
        accent: 'var(--pnb-gold)',
        'accent-dark': 'var(--pnb-gold-dark)',
        danger: 'var(--color-critical)',
        success: 'var(--color-safe)',
        warning: 'var(--color-warning)',
        info: 'var(--color-info)',
        brand: 'var(--pnb-burgundy)',
        gold: 'var(--pnb-gold)',
        navy: 'var(--pnb-navy)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
}
