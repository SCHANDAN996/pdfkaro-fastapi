/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary': {
          50: '#f2f2fd',
          100: '#e4e4fa',
          200: '#c7c7f5',
          300: '#a3a3ef',
          400: '#7f7fe9',
          500: '#6A5ACD',
          600: '#5548b3',
          700: '#413799',
          800: '#2d267f',
          900: '#1a1666',
        },
        'secondary': '#F0F0F0',
        'accent': '#98FF98',
        'dark-charcoal': '#333333',
        'success': '#4CAF50',
        'warning': '#FFC107',
        'error': '#F44336',
        'info': '#2196F3'
      },
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui'],
        'heading': ['Poppins', 'ui-sans-serif', 'system-ui']
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      }
    },
  },
  plugins: [],
}
