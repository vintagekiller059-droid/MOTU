import { type Config } from 'tailwindcss';

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', '-apple-system', 'sans-serif'],
        mono: ['Space Grotesk', 'JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          cyan: '#4FEFFF',
          blue: '#2563EB',
          purple: '#7C5CFF',
          accent: '#7C5CFF',
          success: '#38FF9C',
          warning: '#FBBF24'
        },
        os: {
          bg: '#050816',
          card: 'rgba(13, 17, 34, 0.45)'
        }
      },
      animation: {
        'breathe-slow': 'breathe 8s ease-in-out infinite',
        'breathe-fast': 'breathe 3s ease-in-out infinite',
        'orbit-slow': 'spin3d 120s linear infinite',
        'orbit-mid': 'spin3d 80s linear infinite',
        'orbit-fast': 'spin3d-reverse 40s linear infinite',
        'pulse-subtle': 'pulseSubtle 6s ease-in-out infinite',
        'glow-cyan': 'glowCyan 4s ease-in-out infinite',
        'glow-purple': 'glowPurple 6s ease-in-out infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.9' },
          '50%': { transform: 'scale(1.04)', opacity: '1' },
        },
        spin3d: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'spin3d-reverse': {
          '0%': { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        pulseSubtle: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.85' },
          '50%': { transform: 'scale(1.02)', opacity: '1' },
        },
        glowCyan: {
          '0%, 100%': { filter: 'drop-shadow(0 0 15px rgba(79, 239, 255, 0.25))' },
          '50%': { filter: 'drop-shadow(0 0 30px rgba(79, 239, 255, 0.5))' },
        },
        glowPurple: {
          '0%, 100%': { filter: 'drop-shadow(0 0 15px rgba(124, 92, 255, 0.2))' },
          '50%': { filter: 'drop-shadow(0 0 35px rgba(124, 92, 255, 0.4))' },
        }
      }
    },
  },
  plugins: [],
} satisfies Config;