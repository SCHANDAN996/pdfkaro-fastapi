/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
     colors: {
       'primary': '#6A5ACD', // Slate Blue
       'secondary': '#F0F0F0', // Soft Light Grey
       'accent': '#98FF98', // Mint Green
       'dark-charcoal': '#333333',
     }
    },
  },
  plugins: [],
}
