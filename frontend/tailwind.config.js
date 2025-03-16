/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        header: 'rgba(249, 250, 251, 1)',
        active: 'rgba(16, 25, 40, 1)',
        inactive: 'rgba(208, 213, 221, 1)',
      },
    },
  },
  plugins: [],
};
