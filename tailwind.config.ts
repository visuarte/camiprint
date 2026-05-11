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
        slate: {
          900: '#0f172a',
        },
        blue: {
          800: '#1e40af',
        },
      },
      fontFamily: {
        sans: ['Arial', 'Helvetica', 'sans-serif'],
        mono: ['"Courier New"', 'Courier', 'monospace'],
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

