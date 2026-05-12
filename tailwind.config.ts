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
          950: '#0f1115',
          900: '#1a1d24',
          800: '#232833',
          700: '#2f3645',
          300: '#b9c1d1',
          200: '#d3d9e6',
          100: '#edf1f8',
        },
        steel: {
          500: '#7a8499',
          400: '#95a0b5',
          300: '#b4bfd1',
        },
        accent: {
          500: '#8da2c8',
          400: '#a9b9d8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"Courier New"', 'Courier', 'monospace'],
      },
      backgroundImage: {
        'cami-hero': 'linear-gradient(to bottom, #0f1115, #1a1d24)',
        'cami-noise': 'radial-gradient(circle at 20% 10%, rgba(141, 162, 200, 0.09), transparent 35%), radial-gradient(circle at 85% 0%, rgba(255, 255, 255, 0.08), transparent 32%), radial-gradient(circle at 50% 95%, rgba(122, 132, 153, 0.14), transparent 42%)',
        'metal-button': 'linear-gradient(180deg, rgba(255,255,255,0.32) 0%, rgba(142,152,168,0.2) 40%, rgba(49,54,66,0.34) 100%)',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(190, 204, 235, 0.22), 0 10px 30px rgba(0, 0, 0, 0.45)',
        metal: 'inset 0 1px 1px rgba(255,255,255,0.42), inset 0 -1px 2px rgba(20,24,32,0.7), 0 12px 24px rgba(6, 8, 12, 0.65)',
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

