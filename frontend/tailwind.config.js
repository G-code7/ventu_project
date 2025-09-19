console.log("--- TAILWIND CONFIG LOADED! Si ves este mensaje, Vite está leyendo este archivo. ---");

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/App.jsx",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
       colors: {
        orange: {
          500: '#FF7900',
          600: '#E66D00',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}