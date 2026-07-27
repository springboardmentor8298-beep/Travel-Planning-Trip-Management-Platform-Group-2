/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F5F6F0',
        ink: {
          DEFAULT: '#12313F',
          soft: '#3C5A68'
        },
        voyage: {
          50: '#EAF3F2',
          100: '#CFE4E2',
          300: '#7FADAC',
          500: '#1D5C63',
          600: '#164A50',
          700: '#0F383D'
        },
        sunset: {
          100: '#FBE3D0',
          300: '#F2B587',
          500: '#E98A4B',
          600: '#D4712F'
        },
        sky: {
          300: '#B7D6D9',
          500: '#6FA8AE'
        }
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace']
      },
      backgroundImage: {
        'route-line': "linear-gradient(90deg, transparent 50%, currentColor 50%)"
      },
      boxShadow: {
        ticket: '0 12px 40px -12px rgba(18, 49, 63, 0.35)'
      }
    }
  },
  plugins: []
};
