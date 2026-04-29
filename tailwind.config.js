/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 12px 40px rgba(30, 41, 59, 0.12)",
        glass: "0 10px 30px rgba(2, 6, 23, 0.08)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
