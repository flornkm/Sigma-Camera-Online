const colors = require("tailwindcss/colors")

module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        "spin-slow": "spin 20s linear infinite",
        glitch: "glitch 0.15s infinite",
        progress: "progress 1s ease-in-out",
        aperture: "aperture 1s ease-out forwards",
      },
      keyframes: {
        glitch: {
          "0%": { transform: "translate(0)", opacity: "1" },
          "20%": { transform: "translate(-2px, 1px)", opacity: "0.8" },
          "40%": { transform: "translate(2px, -1px)", opacity: "1" },
          "60%": { transform: "translate(-1px, -1px)", opacity: "0.6" },
          "80%": { transform: "translate(1px, 1px)", opacity: "1" },
          "90%": { transform: "translate(0)", opacity: "0.8" },
          "100%": { transform: "translate(0)", opacity: "1" },
        },
        progress: {
          "0%": { width: "0%" },
          "50%": { width: "40%" },
          "70%": { width: "60%" },
          "80%": { width: "80%" },
          "90%": { width: "90%" },
          "100%": { width: "100%" },
        },
        aperture: {
          "0%": { transform: "scale(0)", opacity: "0" },
          "30%": { transform: "scale(0.3)", opacity: "0.3" },
          "60%": { transform: "scale(0.6)", opacity: "0.6" },
          "90%": { transform: "scale(0.9)", opacity: "0.9" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
}
