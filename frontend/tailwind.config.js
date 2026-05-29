/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#F97316',
          hover: '#EA6C0A',
          light: '#FED7AA',
        },
        surface: '#1C1C1E',
        'surface-2': '#2C2C2E',
        background: '#111113',
        border: '#3A3A3C',
        'text-primary': '#F5F5F5',
        'text-muted': '#A1A1AA',
      }
    }
  },
  plugins: []
};
