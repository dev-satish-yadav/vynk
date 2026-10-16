/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#635BFF',
          hover: '#5248E5',
          light: '#EEEDFE',
          dark: '#483fd4',
        },
        vynkBg: '#F4F5FB',
        sidebarBg: '#F8F9FD',
        borderSubtle: '#EBEEF5',
        bubbleIncoming: '#FFFFFF',
        bubbleOutgoing: '#635BFF',
        textMain: '#1A1D2D',
        textMuted: '#8C93A8',
        accentMint: '#00D69F',
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(99, 91, 255, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'glass': '0 10px 30px -5px rgba(0, 0, 0, 0.05)',
        'active-item': '0 8px 24px -4px rgba(99, 91, 255, 0.35)',
        'bubble': '0 2px 8px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
