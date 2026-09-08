/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#05070d",
          900: "#0a0e18",
          850: "#0d1220",
          800: "#111827",
          750: "#151b2c",
          700: "#1b2338",
          600: "#232c45",
          500: "#2e3a5c",
        },
        brand: {
          50: "#eef4ff",
          100: "#d9e6ff",
          200: "#b3ccff",
          300: "#82abfa",
          400: "#5b8bf0",
          500: "#3b6de0",
          600: "#2c56c4",
          700: "#24449c",
          800: "#1c3577",
          900: "#152a5c",
          950: "#0b1738",
        },
        accent: {
          400: "#ffb547",
          500: "#f5a524",
          600: "#d98c12",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.45)",
        glow: "0 0 24px -4px rgba(59, 109, 224, 0.45)",
      },
      backgroundImage: {
        "radial-fade": "radial-gradient(circle at 20% 0%, rgba(59,109,224,0.12), transparent 45%), radial-gradient(circle at 90% 10%, rgba(245,165,36,0.08), transparent 40%)",
      },
    },
  },
  plugins: [],
};
