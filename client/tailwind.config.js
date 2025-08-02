/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'status-available': '#10B981',
        'status-busy': '#EF4444',
        'status-meeting': '#F59E0B',
        'status-office': '#3B82F6',
        'status-away': '#6B7280',
        'status-online': '#8B5CF6',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}