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
      keyframes: {
        wave: {
          from: {
            transform: 'translateX(-1px)',
          },
          to: {
            transform: 'translateX(-55px)',
          },
        },
      },
    },
    animation: {
      wave: 'wave 1.5s linear infinite',
    },
  },
  plugins: [],
};
