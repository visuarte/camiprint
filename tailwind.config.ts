import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cami: {
          950: '#071018',
          900: '#0d1724',
          800: '#152131',
          700: '#1f3046',
          400: '#8ea1b8',
          300: '#afbed1',
          200: '#dbe6f5',
          100: '#f4f7fb',
        },
        steel: {
          500: '#627084',
          400: '#8394aa',
          300: '#b1bed1',
        },
        accent: {
          500: '#a77a41',
          400: '#c79b63',
          300: '#e8c792',
          200: '#f6e4c4',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"Courier New"', 'Courier', 'monospace'],
      },
      backgroundImage: {
        'cami-hero': 'radial-gradient(circle at top left, rgba(199, 155, 99, 0.18), transparent 24%), radial-gradient(circle at 85% 12%, rgba(134, 162, 209, 0.18), transparent 28%), linear-gradient(180deg, #071018 0%, #0d1724 52%, #08111a 100%)',
        'cami-noise': 'radial-gradient(circle at 20% 10%, rgba(199, 155, 99, 0.1), transparent 35%), radial-gradient(circle at 85% 0%, rgba(255, 255, 255, 0.06), transparent 32%), radial-gradient(circle at 50% 95%, rgba(98, 112, 132, 0.18), transparent 42%)',
        'metal-button': 'linear-gradient(180deg, rgba(255,248,235,0.24) 0%, rgba(199,155,99,0.18) 45%, rgba(21,33,49,0.7) 100%)',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(219, 230, 245, 0.16), 0 18px 50px rgba(0, 0, 0, 0.42)',
        metal: 'inset 0 1px 1px rgba(255,245,230,0.3), inset 0 -1px 2px rgba(7,16,24,0.7), 0 18px 34px rgba(4, 8, 14, 0.62)',
      },
      animation: {
        slideDown: 'slideDown 0.3s ease-in-out',
      },
      keyframes: {
        slideDown: {
          from: {
            opacity: '0',
            transform: 'translateY(-10px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;

