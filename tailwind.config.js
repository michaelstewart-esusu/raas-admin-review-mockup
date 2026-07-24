/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Admin console brand colors
        'esusu-teal': '#1a4d3c',
        'esusu-teal-dark': '#0d3429',
        'esusu-green': '#2ea678',
        'esusu-green-light': '#e8f5f0',
        'esusu-gray-light': '#f5f5f5',
        'esusu-gray-border': '#e0e0e0',
      },
    },
  },
  plugins: [],
}
