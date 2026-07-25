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
        slate: {
          750: '#1e293b',
          805: '#1e293b',
          850: '#0f172a',
          855: '#0f172a',
        },
        indigo: {
          755: '#4338ca',
          770: '#3730a3',
          655: '#4f46e5',
        },
        sky: {
          450: '#38bdf8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

