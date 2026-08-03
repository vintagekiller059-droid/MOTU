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
          bg: '#050505',
          card: 'rgba(255, 255, 255, 0.02)'
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
        'scanner': 'scanner-sweep 4s ease-in-out infinite',
        'ring-speak-1': 'ring-speak-1 2s cubic-bezier(0.34, 1.56, 0.64, 1) infinite',
        'ring-speak-2': 'ring-speak-2 2.2s cubic-bezier(0.34, 1.56, 0.64, 1) infinite 0.2s',
        'ring-speak-3': 'ring-speak-3 2.4s cubic-bezier(0.34, 1.56, 0.64, 1) infinite 0.4s',
        'ring-think': 'ring-think 8s linear infinite',
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
        },
        'scanner-sweep': {
          '0%': { transform: 'translateX(-50%) rotate(-15deg)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateX(50%) rotate(15deg)', opacity: '0' },
        },
        'ring-speak-1': {
          '0%, 100%': { transform: 'translateY(0) scale(1)', opacity: '0.8' },
          '50%': { transform: 'translateY(-20px) scale(1.02)', opacity: '1' },
        },
        'ring-speak-2': {
          '0%, 100%': { transform: 'translateY(0) scale(1)', opacity: '0.6' },
          '50%': { transform: 'translateY(-40px) scale(1.04)', opacity: '0.9' },
        },
        'ring-speak-3': {
          '0%, 100%': { transform: 'translateY(0) scale(1)', opacity: '0.4' },
          '50%': { transform: 'translateY(-60px) scale(1.06)', opacity: '0.8' },
        },
        'ring-think': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.7' },
          '50%': { transform: 'scale(1.03)', opacity: '0.9' },
        },
      },
    },
  },
  plugins: [],
}
