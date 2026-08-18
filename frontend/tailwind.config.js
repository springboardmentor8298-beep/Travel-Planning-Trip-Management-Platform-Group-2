/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  safelist: [
    "animate-fadeInUp",
    "animate-fadeInDown",
    "animate-fadeIn",
    "animate-scaleIn",
    "animate-slideInLeft",
    "animate-slideInRight",
    "animate-float",
    "animate-gradientShift",
    "skeleton",
    "card-img-zoom",
    "page-enter",
    "badge-pulse",
    "link-underline",
    "stagger-children",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#f0f7ff",
          100: "#dbeefe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#2563eb",
          600: "#1d4ed8",
          700: "#1e40af",
          800: "#1e3a8a",
        },
      },
      keyframes: {
        fadeInUp: {
          "0%":   { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInDown: {
          "0%":   { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%":   { opacity: "0", transform: "scale(0.92)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideInLeft: {
          "0%":   { opacity: "0", transform: "translateX(-28px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInRight: {
          "0%":   { opacity: "0", transform: "translateX(28px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-8px)" },
        },
      },
      animation: {
        fadeInUp:     "fadeInUp 0.5s ease both",
        fadeInDown:   "fadeInDown 0.4s ease both",
        fadeIn:       "fadeIn 0.4s ease both",
        scaleIn:      "scaleIn 0.4s cubic-bezier(.22,1,.36,1) both",
        slideInLeft:  "slideInLeft 0.45s ease both",
        slideInRight: "slideInRight 0.45s ease both",
        float:        "float 3.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
