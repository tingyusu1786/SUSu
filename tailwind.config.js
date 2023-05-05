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
      animation: {
        shrinkSpin: 'shrinkSpin 5s ease-in infinite',
        wave: 'wave 1.5s linear infinite',
        arrow: 'arrow 1s ease-out infinite',
        arrowLeft: 'arrowLeft 1s ease-out infinite',
      },
      keyframes: {
        shrinkSpin: {
          from: {
            transform: 'rotate(45deg)',
            // transform: 'scale(1)',
          },
          to: {
            transform: 'rotate(10844deg)',
            // transform: 'scale(0.1)',
          },
        },
        wave: {
          from: {
            transform: 'translateX(-1px)',
          },
          to: {
            transform: 'translateX(-55px)',
          },
        },
        arrow: {
          '0%': {
            transform: 'translateX(0px)',
          },
          '50%': {
            transform: 'translateX(10px)',
          },
          '100%': {
            transform: 'translateX(0px)',
          },
        },
        arrowLeft: {
          '0%': {
            transform: 'translateX(0px)',
          },
          '50%': {
            transform: 'translateX(-10px)',
          },
          '100%': {
            transform: 'translateX(0px)',
          },
        },
      },
    },
    screens: {
      xl2: { max: '1539px' },
      xl: { max: '1279px' },
      // => @media (max-width: 1279px) { ... }

      lg: { max: '1023px' },
      // => @media (max-width: 1023px) { ... }

      md: { max: '767px' },
      // => @media (max-width: 767px) { ... }

      sm: { max: '639px' },
      // => @media (max-width: 639px) { ... }
    },
  },
  plugins: [],
};
