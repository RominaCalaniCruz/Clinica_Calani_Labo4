/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {
      fontFamily:{
        sans: ['"Lato"', 'sans-serif'],
        noto: ['"Noto"', 'sans-serif'],
      }
      ,
      colors: {
        primary: '#bee8f4',
        secondary: '#006680',
        tertiary: '#14eb80',
        accent: '#2b2d2f',
        background: '#1a1a2e',
      },
      keyframes: {
        slideInUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideOutDown: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(100%)', opacity: '0' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        fadeInFromBottom: {
          '0%': { opacity: '0', transform: 'translateY(100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        slideInUp: 'slideInUp 0.3s ease-out',
        slideOutDown: 'slideOutDown 0.3s ease-in',
        fadeOut: 'fadeOut 0.5s ease forwards',
        fadeInFromBottom: 'fadeInFromBottom 0.5s ease forwards',
      },
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
}

