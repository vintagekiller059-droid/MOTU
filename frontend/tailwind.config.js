/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          cyan: '#00f2fe',
          blue: '#4facfe',
          purple: '#7f00ff',
          magenta: '#e100ff',
        },
        panel: {
          bg: 'rgba(10, 10, 15, 0.45)',
          border: 'rgba(255, 255, 255, 0.06)',
        }
      }
    },
  },
  plugins: [],
};