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
        tertiary: '#006680a8',
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
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.9)' },
        },
        fadeInFromBottom: {
          '0%': { opacity: '0', transform: 'translateY(100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        slideInUp: 'slideInUp 0.3s ease-out',
        slideOutDown: 'slideOutDown 0.3s ease-in',
        fadeOut: 'fadeOut 0.5s ease forwards',
        fadeIn: 'fadeIn 0.3s ease-out',
        fadeInFromBottom: 'fadeInFromBottom 0.5s ease forwards',
      },
    },
  },
  plugins: [
    require('flowbite/plugin')({
      charts: true,
      datatables: true,
    })
  ],
}

