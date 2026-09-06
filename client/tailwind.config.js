/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#eef5f0',
          100: '#d3e6d9',
          200: '#a7cdb3',
          300: '#7ab48d',
          400: '#4f9968',
          500: '#2f7a4a',
          600: '#1f5c37',
          700: '#164529',
          800: '#0f331e',
          900: '#0a2416',
        },
        gold: {
          50: '#fdf8ec',
          100: '#faedc7',
          200: '#f4da8f',
          300: '#eec257',
          400: '#e6ab34',
          500: '#c98d21',
          600: '#a26f19',
          700: '#7c5416',
          800: '#5a3d14',
          900: '#402c11',
        },
        charcoal: '#22282b',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        card: '0 6px 24px -8px rgba(15, 51, 30, 0.18)',
      },
    },
  },
  plugins: [],
};
