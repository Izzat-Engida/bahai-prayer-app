/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1B2A4A",
          light: "#50689C",
          dark: "#111B32",
        },
        secondary: {
          DEFAULT: "#C5A059",
          light: "#DCC17F",
          dark: "#80632D",
        },
        tertiary: {
          DEFAULT: "#8B3A2B",
          light: "#D58F7D",
          dark: "#5D251D",
        },
        neutral: {
          DEFAULT: "#F9F6F0",
          white: "#FFFFFF",
          100: "#EEEAE2",
          200: "#D9D5CD",
          500: "#8D8982",
          700: "#4A4844",
          900: "#1D1D1B",
        },
      },
      fontFamily: {
        heading: ["NotoSerif"],
        "heading-bold": ["NotoSerifBold"],
        body: ["Atkinson"],
        "body-medium": ["AtkinsonMedium"],
        "body-bold": ["AtkinsonBold"],
      },
      borderRadius: {
        card: "20px",
        control: "12px",
      },
    },
  },
  plugins: [],
};