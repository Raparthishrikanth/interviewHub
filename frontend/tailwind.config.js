/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#6366f1", // Sleek indigo
          600: "#4f46e5", // Deep indigo
          700: "#4338ca",
          800: "#3730a3",
          900: "#1e1b4b",
        },
        accent: {
          50: "#f0fdf4",
          100: "#dcfce7",
          500: "#10b981", // Emerald accent
          600: "#059669",
        }
      },
      fontFamily: {
        sans: ["Outfit", "Inter", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        premium: "0 8px 30px rgb(0 0 0 / 0.04)",
        glass: "inset 0 1px 0 0 rgba(255, 255, 255, 0.05)",
      }
    },
  },
  plugins: [],
}
