/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
    colors: {
      'green': '#419764',
      'white': '#f2f2f2',
      'lightgray': '#d6d6d6',
      'darkgreen' : '#264a33',
      'black' : '#121212',
      'lightgreen' : '#86cba2'
    }
  },
  plugins: [],
}

