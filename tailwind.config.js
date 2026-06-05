/** @type {import('tailwindcss').Config} */
import scrollbarHide from 'tailwind-scrollbar-hide'

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [scrollbarHide],
}