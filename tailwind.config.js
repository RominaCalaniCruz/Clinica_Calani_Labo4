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
        secondary: '#4A2359',
        tertiary: '#14eb80',
        accent: '#2b2d2f',
        background: '#1a1a2e',
      },
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
}

