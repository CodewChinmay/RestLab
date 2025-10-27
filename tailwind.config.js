/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // <--- THIS IS REQUIRED
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // adjust if you're using Next.js or Vite
  ],
  theme: {
    extend: {},
  },
  plugins: [require("tailwind-scrollbar-hide")],
};
