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
        // ─── Brand Identity: Orange (#FF4F00) ─────────────────────────────
        'hazard-orange': '#FF4F00',
        orange: {
          950: '#1a0800',
          900: '#331000',
          800: '#661f00',
          700: '#992f00',
          600: '#cc3f00',
          500: '#FF4F00',
          400: '#ff7233',
          300: '#ff9666',
          200: '#ffb999',
          100: '#ffdccc',
          50: '#fff0e6',
        },
        'surface-charcoal': '#ffffff',
        'muted-steel': '#d1d5db',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f9fafb',
        'surface-container': '#f3f4f6',
        'surface-container-high': '#e5e7eb',
        'surface-container-highest': '#d1d5db',
        'surface-bright': '#f9fafb',
        // ───────────────────────────────────────────────────────────────────
        cami: {
          950: '#ffffff',
          900: '#ffffff',
          800: '#f9fafb',
          700: '#f3f4f6',
          400: '#4b5563',
          300: '#6b7280',
          200: '#374151',
          100: '#111827',
        },
        steel: {
          500: '#627084',
          400: '#8394aa',
          300: '#b1bed1',
        },
        accent: {
          500: '#FF4F00',
          400: '#FF4F00',
          300: '#ff7233',
          200: '#ffb999',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"Courier New"', 'Courier', 'monospace'],
        // Admin Operations Design System
        'headline-md': ['var(--font-montserrat)', 'Montserrat', 'ui-sans-serif'],
        'headline-lg': ['var(--font-montserrat)', 'Montserrat', 'ui-sans-serif'],
        'display-lg': ['var(--font-montserrat)', 'Montserrat', 'ui-sans-serif'],
        'label-caps': ['var(--font-display)', 'Space Grotesk', 'ui-sans-serif'],
        'body-md': ['var(--font-sans)', 'Manrope', 'ui-sans-serif'],
        'body-lg': ['var(--font-sans)', 'Manrope', 'ui-sans-serif'],
      },
      spacing: {
        'gutter': '24px',
        'margin-desktop': '64px',
        'margin-mobile': '20px',
      },
      fontSize: {
        'headline-md': ['24px', { lineHeight: '1.3', fontWeight: '700' }],
        'headline-lg': ['48px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '800' }],
        'display-lg': ['80px', { lineHeight: '1.0', letterSpacing: '-0.04em', fontWeight: '900' }],
        'label-caps': ['14px', { lineHeight: '1.0', letterSpacing: '0.1em', fontWeight: '700' }],
        'body-md': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
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

