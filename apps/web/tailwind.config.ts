import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // GJ Lottery brand — Haitian flag inspired
        brand: {
          blue:    '#1B3A6B',  // Haitian flag blue (primary)
          red:     '#CE1126',  // Haitian flag red (secondary)
          gold:    '#F5A623',  // Lottery gold (accent)
          'gold-light': '#FFD166',
        },
        // Dark theme backgrounds
        bg: {
          base:   '#0D1520',  // Page background
          card:   '#152035',  // Card background
          muted:  '#1E2D45',  // Slightly lighter card
          border: '#1E3A5F',  // Borders
        },
        // Status colors
        success: {
          DEFAULT: '#16A34A',
          light:   '#BBF7D0',
          dark:    '#14532D',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light:   '#FEF3C7',
          dark:    '#78350F',
        },
        danger: {
          DEFAULT: '#DC2626',
          light:   '#FEE2E2',
          dark:    '#7F1D1D',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-pattern': "url('/images/hero-bg.jpg')",
        'gradient-brand': 'linear-gradient(135deg, #1B3A6B 0%, #0D1520 60%, #CE1126 100%)',
        'gradient-gold':  'linear-gradient(135deg, #F5A623 0%, #FFD166 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in':    'fadeIn 0.3s ease-in-out',
        'ticker':     'ticker 40s linear infinite',
        'float':      'float 6s ease-in-out infinite',
        'shimmer':    'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        ticker: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
