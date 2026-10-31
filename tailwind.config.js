/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        serif: ['Cinzel', 'serif'],
        doto: ['Doto', 'monospace', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      colors: {
        netflix: {
          red: '#E50914',
          dark: '#141414',
          gray: '#b3b3b3'
        }
      }
    },
  },
  plugins: [],
}
