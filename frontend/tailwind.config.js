/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          900: '#0B0F19',
          800: '#111827',
          700: '#1F2937',
          blue: '#3B82F6',
          cyan: '#06B6D4',
          accent: '#10B981',
          danger: '#EF4444',
          warning: '#F59E0B'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
