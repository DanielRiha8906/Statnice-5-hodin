/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sand: {
          50: "#fffdf9",
          100: "#f6f0e7",
          200: "#efe5d7",
          300: "#dcccb4"
        },
        forest: {
          700: "#2f5c51"
        },
        clay: {
          700: "#7d4a2d"
        }
      },
      boxShadow: {
        soft: "0 10px 30px rgba(77, 57, 31, 0.08)"
      },
      fontFamily: {
        display: ['Georgia', '"Times New Roman"', "serif"]
      }
    }
  },
  plugins: []
};
