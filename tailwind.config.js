/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FFD400', // Amarelo Clini One
          hover: '#E6C200',   // -8% luminosidade
          disabled: '#FFE44D', // +10% luminosidade
          foreground: '#111111', // Texto sobre amarelo
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}