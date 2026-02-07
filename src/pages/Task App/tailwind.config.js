/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'soft-slate': '#f6f8fb',
        'calm-indigo': '#4f46e5',
        'calm-teal': '#14b8a6',
        'muted-ink': '#1f2937',
        'card-border': '#e5e7eb',
        'ghost-button': '#eef2ff',
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card-soft': '0 10px 24px rgba(15, 23, 42, 0.08)',
      },
      borderRadius: {
        'extra': '24px',
      },
    },
  },
  plugins: [],
}
