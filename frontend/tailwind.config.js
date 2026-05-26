/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        pink: { 50: '#FBEAF0', 100: '#F4C0D1', 200: '#ED93B1', 300: '#D4537E', 400: '#C44070', 500: '#B03060', 600: '#993556', 700: '#72243E', 800: '#4B1528' },
        purple: { 50: '#EEEDFE', 100: '#CECBF6', 200: '#AFA9EC', 300: '#7F77DD', 400: '#6B62CC', 500: '#534AB7', 600: '#3C3489', 700: '#26215C' },
      },
      borderRadius: { '2xl': '16px', '3xl': '24px' },
    },
  },
  plugins: [],
};
