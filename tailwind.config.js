/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['Courier Prime', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
}
