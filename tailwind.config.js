/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      animation: {
        shrinkSpin: 'shrinkSpin 5s ease-in infinite',
        wave: 'wave 1.5s linear infinite',
        arrow: 'arrow 1s ease-out infinite',
        arrowLeft: 'arrowLeft 1s ease-out infinite',
        upDown: 'upDown 2s linear infinite',
        upDownOp: 'upDownOp 2s linear infinite',
      },
      keyframes: {
        shrinkSpin: {
          from: {
            transform: 'rotate(45deg)',
          },
          to: {
            transform: 'rotate(10844deg)',
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
        upDown: {
          '0%': {
            transform: 'translateY(0px)',
          },
          '25%': {
            transform: 'translateY(-5px) ',
          },
          '50%': {
            transform: 'translateY(0px) ',
          },
          '75%': {
            transform: 'translateY(5px) ',
          },
          '100%': {
            transform: 'translateY(0px)',
          },
        },
        upDownOp: {
          '0%': {
            transform: 'translateY(0px) scaleX(-1)',
          },
          '25%': {
            transform: 'translateY(-5px) scaleX(-1)',
          },
          '50%': {
            transform: 'translateY(0px) scaleX(-1)',
          },
          '75%': {
            transform: 'translateY(5px) scaleX(-1)',
          },
          '100%': {
            transform: 'translateY(0px) scaleX(-1)',
          },
        },
      },
    },
    screens: {
      xl2: { max: '1539px' },
      xl: { max: '1279px' },
      lg: { max: '1023px' },
      md: { max: '767px' },
      sm: { max: '639px' },
      xs: { max: '399px' },
    },
  },
  plugins: [],
};
