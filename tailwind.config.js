/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        heal: ['heal', 'sans-serif'],
        sayger: ['sayger', 'sans-serif'],
        tpBold: ['tp-bold', 'sans-serif'],
        tpReg: ['tp-reg', 'sans-serif'],
        tpLight: ['tp-light', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
