/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Chess Arena palette
        'ca-green': '#81B64C',
        'ca-green-dark': '#45753C',
        'ca-green-hover': '#6fa33e',
        'ca-bg-light': '#F5F5F2',
        'ca-bg-dark': '#262522',
        'ca-panel': '#302E2B',
        'ca-panel-light': '#3D3A37',
        'ca-border': '#3D3A37',
        'ca-text-primary': '#FFFFFF',
        'ca-text-dark': '#292824',
        'ca-text-secondary': '#92918C',
        'ca-accent': '#4A9EE8',
        'ca-accent-dark': '#2D7BC4',
        'ca-red': '#E05252',
        'ca-red-dark': '#C43A3A',
        'ca-yellow': '#F6D44C',
        'ca-highlight': 'rgba(246, 212, 76, 0.5)',
        'ca-highlight-move': 'rgba(129, 182, 76, 0.4)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'panel': '0 4px 24px rgba(0,0,0,0.4)',
        'piece': '0 2px 8px rgba(0,0,0,0.3)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'pulse-check': 'pulseCheck 1s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseCheck: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(224, 82, 82, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(224, 82, 82, 0)' },
        },
      },
    },
  },
  plugins: [],
}
