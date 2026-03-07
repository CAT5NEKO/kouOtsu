/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f3f4f6',
        surface: '#ffffff',
        primary: '#3b82f6',
        'primary-dark': '#2563eb',
        text: '#111827',
        'text-muted': '#4b5563',
        border: '#e5e7eb',
      },
      boxShadow: {
        'paper': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
