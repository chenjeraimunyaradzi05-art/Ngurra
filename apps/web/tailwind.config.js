/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Core Brand Colors (mapped from general.css / style.css)
        primary: {
          DEFAULT: '#5d60e3', // lighter indigo
          dark: '#4742d1',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#cb3e84', // magenta/pink
          light: 'rgba(236,72,153,0.08)',
          strong: '#ff0077',
        },
        sand: {
          DEFAULT: '#050816',
          dark: '#020617', // darkened based on rgba(2,6,23,0.92)
        },
        
        // Aura Theme Components
        aura: {
          pink: '#ec4899',
          purple: '#a855f7',
          indigo: '#6366f1',
          muted: 'rgba(15,23,42,0.72)',
          surface: 'rgba(2,6,23,0.72)',
        },

        // Celestial Precious Stone Theme (from globals.css)
        scarlet: '#C41E3A',
        maroon: '#800020',
        'purple-royal': '#6B4C9A',
        'purple-deep': '#4A2E7A',
        'purple-light': '#9B7EC4',
        'pink-blush': '#F4A4D3',
        'pink-rose': '#E85B8A',
        'light-blue': '#87CEEB',
        'celestial-blue': '#4A90E2',
        'diamond-white': '#F8F6FF',
        'emerald-dark': '#2D7A5A',
        'rose-gold': '#B76E79',

        // Existing merged palette
        cosmic: {
          darker: '#0D0A1A',
          dark: '#1A0F2E',
          DEFAULT: '#2D1B69',
          light: '#3D2E6B',
          lighter: '#4C1D95',
          // Mapped from css vars
          deep: '#1A0F2E', 
          purple: '#2D1B69',
          maroon: '#3D1A2A',
        },
        gold: {
          DEFAULT: '#FFD700',
          light: '#FFE44D',
          dark: '#CC9900',
        },
        emerald: {
          DEFAULT: '#50C878',
          light: '#7DD99E',
          dark: '#3AA05F',
        },
        rose: {
          DEFAULT: '#E85B8A',
          light: '#F08AAD',
          dark: '#C94473',
        },
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '15%': { transform: 'rotate(-15deg)' },
          '30%': { transform: 'rotate(10deg)' },
          '45%': { transform: 'rotate(-10deg)' },
          '60%': { transform: 'rotate(5deg)' },
          '75%': { transform: 'rotate(-5deg)' },
        },
        'pulse-scale': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
        'ping-slow': {
          '75%, 100%': {
            transform: 'scale(2)',
            opacity: '0',
          },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(255, 215, 0, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(255, 215, 0, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-8px) rotate(0.5deg)' },
          '66%': { transform: 'translateY(-4px) rotate(-0.5deg)' },
        },
        'glow-pulse': {
          '0%, 100%': {
            boxShadow: '0 0 12px 2px rgba(168,85,247,0.25), 0 0 24px 4px rgba(236,72,153,0.12)',
          },
          '50%': {
            boxShadow: '0 0 24px 6px rgba(168,85,247,0.45), 0 0 48px 12px rgba(236,72,153,0.22)',
          },
        },
        'glow-teal': {
          '0%, 100%': {
            boxShadow: '0 0 10px 2px rgba(20,184,166,0.3), 0 0 20px 4px rgba(6,182,212,0.15)',
          },
          '50%': {
            boxShadow: '0 0 20px 6px rgba(20,184,166,0.5), 0 0 40px 10px rgba(6,182,212,0.25)',
          },
        },
        aurora: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'gradient-border': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'text-shimmer': {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'orb-drift': {
          '0%, 100%': { transform: 'translate(0%, 0%) scale(1)' },
          '25%': { transform: 'translate(3%, -4%) scale(1.05)' },
          '50%': { transform: 'translate(-2%, 3%) scale(0.97)' },
          '75%': { transform: 'translate(4%, 2%) scale(1.03)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        wiggle: 'wiggle 0.5s ease-in-out',
        'pulse-scale': 'pulse-scale 1s ease-in-out infinite',
        'ping-slow': 'ping-slow 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fade-in 0.2s ease-out',
        'fade-in-up': 'fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-in': 'scale-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        shimmer: 'shimmer 2s linear infinite',
        glow: 'glow 2s ease-in-out infinite',
        float: 'float 5s ease-in-out infinite',
        'float-slow': 'float-slow 8s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'glow-teal': 'glow-teal 3s ease-in-out infinite',
        aurora: 'aurora 8s ease infinite',
        'gradient-border': 'gradient-border 4s ease infinite',
        'text-shimmer': 'text-shimmer 6s linear infinite',
        'orb-drift': 'orb-drift 12s ease-in-out infinite',
      },
    },
  },
  plugins: [
    // Add cosmic: variant for the cosmic theme
    function({ addVariant }) {
      addVariant('cosmic', '.cosmic &');
    },
  ],
};
