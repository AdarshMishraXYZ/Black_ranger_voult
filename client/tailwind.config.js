/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-cyan': '#00F2A9',
        'dark-bg': '#02080F',
        'dark-bg-light': '#030A12',
      },
      boxShadow: {
        'neon': '0 0 20px rgba(0, 242, 169, 0.5)',
        'neon-sm': '0 0 10px rgba(0, 242, 169, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backdropBlur: {
        'glass': '10px',
      },
    },
  },
  plugins: [],
}

